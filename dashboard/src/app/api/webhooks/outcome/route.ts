import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/webhooks/outcome - Called by Retell after each call ends
export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        console.log("=== RETELL WEBHOOK RECEIVED ===");
        console.log("Event:", body.event);
        console.log("Full payload:", JSON.stringify(body, null, 2));

        // ── Handle Retell webhook format ──
        if (body.event) {
            const event = body.event;
            
            // Only process call_ended and call_analyzed events
            if (event !== "call_ended" && event !== "call_analyzed") {
                console.log(`Ignoring event type: ${event}`);
                return NextResponse.json({ ignored: true, event });
            }

            // Extract data from Retell's structure
            const callData = body.call || body.data || {};
            const metadata = callData.metadata || {};
            const contactId = metadata.contact_id;

            if (!contactId) {
                console.error("No contact_id in webhook metadata:", metadata);
                return NextResponse.json({ error: "Missing contact_id in metadata" }, { status: 400 });
            }

            // Extract transcript
            const transcript = callData.transcript || body.transcript || "";

            // Extract call analysis data (Retell post-call analysis)
            const callAnalysis = callData.call_analysis || body.call_analysis || {};
            const customData = callAnalysis.custom_analysis_data || {};
            
            // Map Retell's analysis to our fields
            // These match the {{Output Variables}} in the Retell prompt
            const retellOutcome = customData.Outcome || customData.outcome;
            const agreedPaymentDate = customData.Agreed_Payment_Date || customData.agreed_payment_date;
            const agreedPaymentAmount = customData.Agreed_Payment_Amount || customData.agreed_payment_amount;
            const paymentMethod = customData.Payment_Method || customData.payment_method;
            const callbackDate = customData.Callback_Date || customData.callback_date;
            const callSummary = callAnalysis.call_summary || customData.Call_Summary || customData.call_summary || "";

            // Normalize Retell's extracted outcomes to our system values
            // Retell agent prompt uses: Paid / Scheduled / Callback / Dispute / No Answer
            // Our system uses:          Paid / Scheduled / Callback / Failed / Voicemail / Completed
            const normalizeOutcome = (raw: string): string => {
                const map: Record<string, string> = {
                    "paid": "Paid",
                    "success": "Paid",
                    "scheduled": "Scheduled",
                    "callback": "Callback",
                    "dispute": "Failed",
                    "no answer": "Failed",
                    "no_answer": "Failed",
                    "failed": "Failed",
                    "voicemail": "Voicemail",
                };
                return map[raw.toLowerCase().trim()] || raw;
            };

            // Calculate call duration (in seconds)
            const duration = callData.end_timestamp && callData.start_timestamp
                ? Math.round((callData.end_timestamp - callData.start_timestamp) / 1000)
                : null;

            // Check if a real conversation happened
            const hasTranscript = transcript && transcript.trim().length > 10;
            const hasRealDuration = duration !== null && duration > 10; // more than 10 seconds
            const conversationHappened = hasTranscript || hasRealDuration;

            // Determine the outcome based on event type
            let outcome: string;

            if (event === "call_ended") {
                const reason = callData.disconnection_reason;

                if (reason === "voicemail_reached") {
                    outcome = "Voicemail";
                } else if (reason === "dial_no_answer") {
                    // Phone rang but nobody picked up
                    outcome = "No Answer";
                } else if (!conversationHappened) {
                    // Call connected briefly but no real conversation (hung up immediately, etc.)
                    outcome = "No Answer";
                } else {
                    // A real conversation happened — wait for call_analyzed to set the real outcome
                    outcome = "Completed";
                }
            } else if (event === "call_analyzed") {
                // call_analyzed has the REAL outcome from post-call extraction
                if (retellOutcome) {
                    outcome = normalizeOutcome(retellOutcome);
                } else if (callAnalysis.user_sentiment) {
                    const sentiment = callAnalysis.user_sentiment;
                    if (sentiment === "Positive") outcome = "Paid";
                    else if (sentiment === "Negative") outcome = "Failed";
                    else outcome = "Completed";
                } else {
                    outcome = "Completed";
                }
            } else {
                outcome = "Completed";
            }

            // Build the analysis summary from extracted data
            const summaryParts: string[] = [];
            if (callSummary) summaryParts.push(`Summary: ${callSummary}`);
            if (agreedPaymentDate) summaryParts.push(`Payment Date: ${agreedPaymentDate}`);
            if (agreedPaymentAmount) summaryParts.push(`Payment Amount: ${agreedPaymentAmount}`);
            if (paymentMethod) summaryParts.push(`Method: ${paymentMethod}`);
            if (callbackDate) summaryParts.push(`Callback: ${callbackDate}`);
            const analysisSummary = summaryParts.join(" | ");

            // Build full transcript: analysis summary on top + full conversation below
            let savedTranscript: string;
            if (analysisSummary && transcript) {
                savedTranscript = `[Analysis] ${analysisSummary}\n\n---\n\n${transcript}`;
            } else if (transcript) {
                savedTranscript = transcript;
            } else if (analysisSummary) {
                savedTranscript = analysisSummary;
            } else {
                savedTranscript = "No transcript available.";
            }

            console.log(`Processing: contact=${contactId}, outcome=${outcome}, callback=${callbackDate}`);

            // Build update data for the contact
            const contactUpdate: Record<string, unknown> = {
                lastOutcome: outcome,
                transcript: savedTranscript,
            };

            // If Retell extracted a callback date, update nextCallDate
            if (callbackDate && (outcome === "Callback" || outcome === "Scheduled")) {
                try {
                    const parsedDate = new Date(callbackDate);
                    if (!isNaN(parsedDate.getTime())) {
                        contactUpdate.nextCallDate = parsedDate;
                    }
                } catch {
                    console.warn("Could not parse callback date:", callbackDate);
                }
            }

            // Update Contact AND Create Call Log in a transaction
            await prisma.$transaction([
                prisma.contact.update({
                    where: { id: contactId },
                    data: contactUpdate,
                }),
                prisma.callLog.create({
                    data: {
                        contactId: contactId,
                        outcome: outcome,
                        transcript: savedTranscript,
                        duration: duration,
                    }
                })
            ]);

            console.log(`✅ Contact ${contactId} updated: outcome=${outcome}`);
            
            return NextResponse.json({ 
                success: true, 
                contactId, 
                outcome,
                callbackDate: callbackDate || null,
            });
        }

        // ── Handle simple/manual webhook format (non-Retell) ──
        const { contactId, outcome, transcript } = body;

        if (!contactId) {
            return NextResponse.json({ error: "contactId is required" }, { status: 400 });
        }

        await prisma.$transaction([
            prisma.contact.update({
                where: { id: contactId },
                data: {
                    lastOutcome: outcome || "Unknown",
                    transcript: transcript || null,
                },
            }),
            prisma.callLog.create({
                data: {
                    contactId: contactId,
                    outcome: outcome || "Unknown",
                    transcript: transcript || null,
                }
            })
        ]);

        return NextResponse.json({ success: true, contactId, outcome });

    } catch (error) {
        console.error("❌ Webhook Error:", error);
        return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
    }
}
