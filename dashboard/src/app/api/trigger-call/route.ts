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
                error: "Retell API not configured. Check RETELL_API_KEY, RETELL_AGENT_ID, RETELL_FROM_NUMBER in .env"
            }, { status: 503 });
        }

        // 2. Fetch Contact
        const contact = await prisma.contact.findUnique({
            where: { id: contactId },
        });

        if (!contact) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        }

        // 3. Build Retell API payload
        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/outcome`;
        
        const retellPayload = {
            from_number: RETELL_FROM_NUMBER,
            to_number: contact.phoneNumber,
            override_agent_id: RETELL_AGENT_ID,
            retell_llm_dynamic_variables: {
                client_name: contact.name,
                invoice_amount: contact.billOrPayment || "N/A",
                services_rendered: contact.servicesOffered || "N/A",
            },
            metadata: {
                contact_id: contact.id,
                callback_url: callbackUrl,
            }
        };

        // 4. Call Retell API directly
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
            throw new Error(`Retell API error: ${retellResponse.status}`);
        }

        const retellData = await retellResponse.json();
        console.log("Retell call initiated:", retellData.call_id);

        // 5. Update Status to "Calling..."
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
