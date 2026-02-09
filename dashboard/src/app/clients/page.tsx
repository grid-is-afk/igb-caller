"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ContactModal } from "@/components/ContactModal";
import { Contact } from "@prisma/client";
import { Search, Plus, Edit2, User } from "lucide-react";

export default function ClientsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchContacts = async () => {
        setIsLoading(true);
        try {
            // Fetch ALL contacts (no date filter)
            const res = await fetch("/api/contacts");
            const data = await res.json();
            if (Array.isArray(data)) {
                setContacts(data);
            }
        } catch (error) {
            console.error("Failed to load clients", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phoneNumber.includes(search)
    );

    const handleCreate = async (data: Partial<Contact>) => {
        await fetch("/api/contacts", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data) 
        });
        setIsModalOpen(false);
        fetchContacts();
    };

    const handleUpdate = async (data: Partial<Contact>) => {
        if (!editingContact) return;
        await fetch(`/api/contacts/${editingContact.id}`, { 
            method: "PUT", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data) 
        });
        setIsModalOpen(false);
        setEditingContact(null);
        fetchContacts();
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                            <User className="text-cyan-500" /> Clients
                        </h1>
                        <p className="text-neutral-500 mt-1">Manage your complete client database.</p>
                    </div>
                    <button
                        onClick={() => { setEditingContact(null); setIsModalOpen(true); }}
                        className="bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-cyan-500 transition-colors"
                    >
                        <Plus size={18} /> Add Client
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search clients by name or phone..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#111] border border-[#262626] text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Table */}
                <div className="bg-[#111] rounded-xl border border-[#262626] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#0a0a0a] border-b border-[#262626]">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Service</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Next Call</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1a1a1a]">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">Loading clients...</td></tr>
                                ) : filteredContacts.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">No clients found.</td></tr>
                                ) : (
                                    filteredContacts.map(client => (
                                        <tr key={client.id} className="hover:bg-[#1a1a1a] transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">{client.name}</td>
                                            <td className="px-6 py-4 text-neutral-400 font-mono text-sm">{client.phoneNumber}</td>
                                            <td className="px-6 py-4 text-neutral-400">
                                                <span className="px-2 py-1 bg-[#262626] rounded text-xs font-medium text-neutral-400">
                                                    {client.servicesOffered || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={client.lastOutcome} />
                                            </td>
                                            <td className="px-6 py-4 text-neutral-500 text-sm">
                                                {client.nextCallDate ? new Date(client.nextCallDate).toLocaleDateString() : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => { setEditingContact(client); setIsModalOpen(true); }}
                                                    className="p-2 text-neutral-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                                                    title="Edit Client"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-[#262626] bg-[#0a0a0a] text-xs text-neutral-500">
                        {filteredContacts.length} clients found
                    </div>
                </div>
            </div>

            <ContactModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingContact(null); }}
                onSubmit={editingContact ? handleUpdate : handleCreate}
                initialData={editingContact}
            />
        </MainLayout>
    );
}

function StatusBadge({ status }: { status: string | null }) {
    if (!status || status === "Pending") return <span className="text-neutral-500 text-sm">Pending</span>;
    if (status === "Success") return <span className="text-green-400 bg-green-900/20 px-2 py-0.5 rounded text-xs font-bold border border-green-900/30">Success</span>;
    if (status === "Failed") return <span className="text-red-400 bg-red-900/20 px-2 py-0.5 rounded text-xs font-bold border border-red-900/30">Failed</span>;
    if (status === "Calling...") return <span className="text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded text-xs font-bold border border-cyan-500/30 animate-pulse">Calling...</span>;
    return <span className="text-neutral-400 bg-[#262626] px-2 py-0.5 rounded text-xs font-medium">{status}</span>;
}
