"use client";

import { Contact } from "@prisma/client";
import { LeadCard } from "./LeadCard";
import { MoreHorizontal, Plus, Upload } from "lucide-react";

interface KanbanBoardProps {
    contacts: Contact[];
    onCall: (id: string) => void;
    onEdit: (contact: Contact) => void;
    onReset: (id: string) => void;
    onAdd: () => void;
    onImport: () => void;
}

export function KanbanBoard({ contacts, onCall, onEdit, onReset, onAdd, onImport }: KanbanBoardProps) {
    // Filter logic
    const todo = contacts.filter(c => !c.lastOutcome || c.lastOutcome === "Pending" || c.lastOutcome === "Scheduled");
    const inProgress = contacts.filter(c => c.lastOutcome === "Calling..." || c.lastOutcome === "Ringing");
    const done = contacts.filter(c => ["Success", "Failed", "Voicemail", "Completed"].includes(c.lastOutcome || ""));

    const columns = [
        { title: "To-Do", contacts: todo, color: "bg-orange-500", emptyText: "No leads scheduled", onAdd },
        { title: "In Progress", contacts: inProgress, color: "bg-blue-500", emptyText: "No active calls" },
        { title: "Review", contacts: done, color: "bg-green-500", emptyText: "No completed calls" }
    ];

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center px-1">
                <h2 className="text-xl font-bold text-white">Pipeline</h2>
                <button
                    onClick={onImport}
                    className="flex items-center gap-2 bg-[#1a1a1a] border border-[#262626] text-neutral-300 px-3 py-1.5 rounded-lg hover:bg-[#222] hover:border-cyan-500/50 transition-colors text-sm font-medium"
                >
                    <Upload size={16} /> Import CSV
                </button>
            </div>
            <div className="flex-1 flex gap-6 h-full overflow-hidden">
                {columns.map((col) => (
                    <KanbanColumn
                        key={col.title}
                        title={col.title}
                        count={col.contacts.length}
                        color={col.color}
                        onAdd={col.onAdd}
                    >
                        {col.contacts.map(c => (
                            <LeadCard key={c.id} contact={c} onCall={onCall} onEdit={onEdit} onReset={onReset} />
                        ))}
                        {col.contacts.length === 0 && <EmptyState text={col.emptyText} />}
                    </KanbanColumn>
                ))}
            </div>
        </div>
    );
}

function KanbanColumn({ title, count, color, children, onAdd }: { title: string, count: number, color: string, children: React.ReactNode, onAdd?: () => void }) {
    return (
        <div className="flex-1 min-w-[300px] flex flex-col h-full">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-200">{title}</span>
                    <span className="bg-[#262626] text-neutral-400 text-xs px-2 py-0.5 rounded-full font-medium">{count}</span>
                </div>
                <div className="flex gap-1">
                    {onAdd && (
                        <button onClick={onAdd} className="p-1 hover:bg-[#262626] rounded text-neutral-500 hover:text-white transition-colors">
                            <Plus size={16} />
                        </button>
                    )}
                    <button className="p-1 hover:bg-[#262626] rounded text-neutral-500 hover:text-white transition-colors">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
                <div className={`h-1.5 w-full ${color} rounded-full mb-4 opacity-30`} />
                {children}
            </div>
        </div>
    )
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="border-2 border-dashed border-[#262626] rounded-xl p-8 text-center">
            <p className="text-sm text-neutral-500 font-medium">{text}</p>
        </div>
    )
}
