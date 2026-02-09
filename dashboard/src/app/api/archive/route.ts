import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const { date } = body; // Optional: "YYYY-MM-DD"

        let whereClause = {};

        if (date) {
            const startOfDay = new Date(date);
            const endOfDay = new Date(date);
            endOfDay.setDate(endOfDay.getDate() + 1);

            whereClause = {
                createdAt: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            };
        }

        // Delete Call Logs based on filter (or all if empty)
        const result = await prisma.callLog.deleteMany({
            where: whereClause,
        });

        return NextResponse.json({ success: true, count: result.count });
    } catch (error) {
        console.error("Archive Error:", error);
        return NextResponse.json({ error: "Failed to archive logs" }, { status: 500 });
    }
}
