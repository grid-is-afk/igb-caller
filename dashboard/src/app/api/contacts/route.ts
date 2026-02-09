import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/contacts - List all contacts (filtered by date if provided)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get("date"); // YYYY-MM-DD

        let whereClause = {};

        if (dateParam) {
            // Filter for the specific day (00:00 to 24:00 local time approximation of the user's intent)
            // Since we store DateTime, we search for range.
            const startOfDay = new Date(dateParam);
            const endOfDay = new Date(dateParam);
            endOfDay.setDate(endOfDay.getDate() + 1);

            whereClause = {
                nextCallDate: {
                    gte: startOfDay,
                    lt: endOfDay,
                }
            };
        }

        const contacts = await prisma.contact.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(contacts);
    } catch (err) {
        console.error("Database error:", err);
        // Return empty array on error so frontend doesn't break
        return NextResponse.json([]);
    }
}

// POST /api/contacts - Create new contact(s)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = Array.isArray(body) ? body : [body];

        if (data.length === 0) {
            return NextResponse.json({ message: "No data provided" }, { status: 400 });
        }

        const validContacts = data.map((item: { name?: string; phoneNumber?: string; servicesOffered?: string; billOrPayment?: string; nextCallDate?: string; lastOutcome?: string }) => ({
            name: item.name,
            phoneNumber: item.phoneNumber,
            servicesOffered: item.servicesOffered,
            billOrPayment: item.billOrPayment,
            nextCallDate: item.nextCallDate ? new Date(item.nextCallDate) : null,
            lastOutcome: item.lastOutcome || "Pending",
        })).filter(c => c.name && c.phoneNumber);

        if (validContacts.length === 0) {
            return NextResponse.json({ error: "No valid contacts found (missing name or phone)" }, { status: 400 });
        }

        const result = await prisma.contact.createMany({
            data: validContacts,
            skipDuplicates: true,
        });

        return NextResponse.json({
            count: result.count,
            message: `Successfully created ${result.count} contacts`
        });
    } catch (error) {
        console.error("Error creating contacts:", error);
        return NextResponse.json({ error: "Failed to create contacts" }, { status: 500 });
    }
}
