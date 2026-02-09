import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID;
const RETELL_FROM_NUMBER = process.env.RETELL_FROM_NUMBER;

export async function POST(req: Request) {
    try {
        const { contactId } = await req.json();

        // 1. Validate Retell config
        if (!RETELL_API_KEY || !RETELL_AGENT_ID || !RETELL_FROM_NUMBER) {
            console.error("Missing Retell configuration in .env");
            return NextResponse.json({
                error: "Retell API not configured. Add RETELL_API_KEY, RETELL_AGENT_ID, RETELL_FROM_NUMBER to environment variables."
            }, { status: 503 });
        }

        // 2. Fetch Contact
        const contact = await prisma.contact.findUnique({
            where: { id: contactId },
        });

        if (!contact) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        }

        // 3. Format Invoice Date (readable format for the AI agent)
        const invoiceDate = contact.createdAt
            ? new Date(contact.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric"
            })
            : "N/A";

        // 4. Build Retell API payload
        // Variable names MUST match the {{Variable_Name}} placeholders in the Retell agent prompt
        const retellPayload = {
            from_number: RETELL_FROM_NUMBER,
            to_number: contact.phoneNumber,
            override_agent_id: RETELL_AGENT_ID,
            retell_llm_dynamic_variables: {
                Client_Name: contact.name,
                Invoice_Amount: contact.billOrPayment || "N/A",
                Invoice_Date: invoiceDate,
                Services_Rendered: contact.servicesOffered || "N/A",
                Phone_Number: contact.phoneNumber,
            },
            metadata: {
                contact_id: contact.id,
            }
        };

        console.log("Triggering Retell call:", {
            to: contact.phoneNumber,
            name: contact.name,
            agent: RETELL_AGENT_ID,
        });

        // 5. Call Retell API directly
        const retellResponse = await fetch("https://api.retellai.com/v2/create-phone-call", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RETELL_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(retellPayload),
        });

        if (!retellResponse.ok) {
            const errorText = await retellResponse.text();
            console.error("Retell API Error:", retellResponse.status, errorText);
            throw new Error(`Retell API error (${retellResponse.status}): ${errorText}`);
        }

        const retellData = await retellResponse.json();
        console.log("Retell call initiated:", retellData.call_id);

        // 6. Update Status to "Calling..."
        await prisma.contact.update({
            where: { id: contactId },
            data: { lastOutcome: "Calling..." }
        });

        return NextResponse.json({ 
            success: true, 
            callId: retellData.call_id 
        });

    } catch (error) {
        console.error("Trigger Call Error:", error);
        const message = error instanceof Error ? error.message : "Failed to trigger call";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
