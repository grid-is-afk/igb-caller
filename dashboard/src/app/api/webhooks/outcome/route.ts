import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/webhooks/outcome - Called by Retell directly
export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        console.log("Webhook received:", JSON.stringify(body, null, 2));

        // Handle both formats: Retell direct webhook OR simple CRM format
        let contactId: string | undefined;
        let outcome: string;
        let transcript: string | undefined;

        // Check if this is a Retell webhook (has 'event' field)
        if (body.event) {
            // Retell webhook format
            const event = body.event;
            
            // Only process call_ended or call_analyzed events
            if (event !== "call_ended" && event !== "call_analyzed") {
                console.log(`Ignoring event type: ${event}`);
                return NextResponse.json({ ignored: true, event });
            }

            // Extract data from Retell's nested structure
            const callData = body.call || {};
            const analysis = body.call_analysis || {};
            const metadata = callData.metadata || {};

            contactId = metadata.contact_id;
            transcript = body.transcript || callData.transcript || "";

            // Determine outcome based on event type and sentiment
            if (event === "call_analyzed") {
                const sentiment = analysis.user_sentiment;
                if (sentiment === "Positive") {
                    outcome = "Success";
                } else if (sentiment === "Negative") {
                    outcome = "Failed";
                } else {
                    outcome = "Neutral";
                }
            } else {
                // call_ended without analysis
                outcome = body.call?.disconnection_reason === "user_hangup" 
                    ? "Failed" 
                    : "Completed";
            }
        } else {
            // Simple CRM format (direct POST from external source)
            contactId = body.contactId;
            outcome = body.outcome || "Unknown";
            transcript = body.transcript;
        }

        // Validate contact ID
        if (!contactId) {
            console.error("No contact_id in webhook payload");
            return NextResponse.json({ error: "Contact ID required" }, { status: 400 });
        }

        console.log(`Updating contact ${contactId} with outcome: ${outcome}`);

        // Update Contact AND Create Call Log
        const updatePromises = [
            prisma.contact.update({
                where: { id: contactId },
                data: {
                    lastOutcome: outcome,
                    transcript: transcript,
                },
            }),
            prisma.callLog.create({
                data: {
                    contactId: contactId,
                    outcome: outcome,
                    transcript: transcript,
                }
            })
        ];

        await prisma.$transaction(updatePromises);

        const contact = await prisma.contact.findUnique({ where: { id: contactId } });
        console.log(`Contact ${contactId} updated successfully`);
        
        return NextResponse.json({ success: true, contact });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Failed to update outcome" }, { status: 500 });
    }
}
