import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/contacts - List all contacts (filtered by date if provided)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get("date"); // YYYY-MM-DD

        let whereClause = {};

        if (dateParam) {
            // Show contacts scheduled for today, overdue (past dates), or with no date
            const endOfDay = new Date(dateParam);
            endOfDay.setDate(endOfDay.getDate() + 1);

            whereClause = {
                OR: [
                    {
                        nextCallDate: {
                            lt: endOfDay, // Today + all overdue past dates
                        }
                    },
                    {
                        nextCallDate: null, // Also show contacts with no scheduled date
                    }
                ]
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

        const validContacts = data
            .filter((item: { name?: string; phoneNumber?: string }) => item.name && item.phoneNumber)
            .map((item: { name?: string; phoneNumber?: string; servicesOffered?: string; billOrPayment?: string; nextCallDate?: string; lastOutcome?: string }) => ({
                name: item.name as string,
                phoneNumber: item.phoneNumber as string,
                servicesOffered: item.servicesOffered,
                billOrPayment: item.billOrPayment,
                nextCallDate: item.nextCallDate ? new Date(item.nextCallDate) : new Date(), // Default to now if not set
                lastOutcome: item.lastOutcome || "Pending",
            }));

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
