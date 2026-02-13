import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/contacts/[id] - Update Contact
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Build update data — only include fields that were actually sent
        const updateData: Record<string, unknown> = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber;
        if (body.servicesOffered !== undefined) updateData.servicesOffered = body.servicesOffered;
        if (body.billOrPayment !== undefined) updateData.billOrPayment = body.billOrPayment;
        if (body.nextCallDate !== undefined) updateData.nextCallDate = body.nextCallDate ? new Date(body.nextCallDate) : null;
        if (body.lastOutcome !== undefined) updateData.lastOutcome = body.lastOutcome;
        if (body.transcript !== undefined) updateData.transcript = body.transcript;

        const contact = await prisma.contact.update({
            where: { id },
            data: updateData,
        });
        return NextResponse.json(contact);
    } catch {
        return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
    }
}

// DELETE /api/contacts/[id] - Remove Contact
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.contact.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
    }
}
