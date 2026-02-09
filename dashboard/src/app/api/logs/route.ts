import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "10");

        const logs = await prisma.callLog.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                contact: {
                    select: { name: true }
                }
            }
        });

        return NextResponse.json(logs);
    } catch (err) {
        console.error("Database error:", err);
        // Return empty array on error so frontend doesn't break
        return NextResponse.json([]);
    }
}
