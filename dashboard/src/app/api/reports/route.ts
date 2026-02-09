import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reports - Get calls grouped by date
export async function GET() {
    try {
        const logs = await prisma.callLog.findMany({
            include: { contact: true },
            orderBy: { createdAt: "desc" },
        });

        // Group items by date string (YYYY-MM-DD)
        type LogWithContact = typeof logs[number];
        const grouped: Record<string, LogWithContact[]> = {};

        logs.forEach(log => {
            const date = new Date(log.createdAt).toISOString().split('T')[0];
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(log);
        });

        return NextResponse.json(grouped);
    } catch (err) {
        console.error("Database error:", err);
        // Return empty object on error so frontend doesn't break
        return NextResponse.json({});
    }
}
