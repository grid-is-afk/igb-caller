import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/contacts/[id] - Update Contact
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        const contact = await prisma.contact.update({
            where: { id },
            data: {
                name: body.name,
                phoneNumber: body.phoneNumber,
                servicesOffered: body.servicesOffered,
                billOrPayment: body.billOrPayment,
                nextCallDate: body.nextCallDate ? new Date(body.nextCallDate) : null,
            },
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
