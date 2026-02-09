"use client";

import { Contact } from "@prisma/client";
import { X } from "lucide-react";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Contact>) => void;
    initialData?: Contact | null;
    defaultDate?: Date;
}

export function ContactModal({ isOpen, onClose, onSubmit, initialData, defaultDate }: ContactModalProps) {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        onSubmit({
            name: formData.get("name") as string,
            phoneNumber: formData.get("phoneNumber") as string,
            servicesOffered: formData.get("servicesOffered") as string,
            billOrPayment: formData.get("billOrPayment") as string,
            nextCallDate: formData.get("nextCallDate") ? new Date(formData.get("nextCallDate") as string) : (defaultDate || null),
        });
    };

    // Determine date value for input
    let dateValue = "";
    if (initialData?.nextCallDate) {
        dateValue = new Date(initialData.nextCallDate).toISOString().slice(0, 16);
    } else if (defaultDate) {
        // Set to 09:00 AM of the default date
        const d = new Date(defaultDate);
        d.setHours(9, 0, 0, 0);
        try {
            const offset = d.getTimezoneOffset() * 60000;
            dateValue = new Date(d.getTime() - offset).toISOString().slice(0, 16);
        } catch {
            dateValue = ""; // Fallback
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-[#262626]">
                    <h2 className="text-xl font-bold text-white">
                        {initialData ? "Edit Contact" : "Add New Contact"}
                    </h2>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Client Name</label>
                        <input
                            name="name"
                            defaultValue={initialData?.name}
                            required
                            className="w-full bg-[#111] border border-[#262626] rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                            placeholder="e.g. Acme Corp"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Phone Number</label>
                        <input
                            name="phoneNumber"
                            defaultValue={initialData?.phoneNumber}
                            required
                            className="w-full bg-[#111] border border-[#262626] rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                            placeholder="+1234567890"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Services Offered</label>
                        <input
                            name="servicesOffered"
                            defaultValue={initialData?.servicesOffered || ""}
                            className="w-full bg-[#111] border border-[#262626] rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                            placeholder="e.g. Web Dev, SEO"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400">Amount Due</label>
                            <input
                                name="billOrPayment"
                                defaultValue={initialData?.billOrPayment || ""}
                                className="w-full bg-[#111] border border-[#262626] rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                placeholder="$500.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400">Next Call Date</label>
                            <input
                                type="datetime-local"
                                name="nextCallDate"
                                defaultValue={dateValue}
                                className="w-full bg-[#111] border border-[#262626] rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded text-neutral-400 hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded font-medium transition-colors">
                            {initialData ? "Save Changes" : "Create Contact"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
