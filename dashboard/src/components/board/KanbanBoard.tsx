"use client";

import { Contact } from "@prisma/client";
import { LeadCard } from "./LeadCard";
import { MoreHorizontal, Plus, Upload, PhoneCall, Users, CheckCircle2, Clock, Zap, ArrowDownAZ, CalendarArrowDown, PhoneOutgoing, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface KanbanBoardProps {
    contacts: Contact[];
    onCall: (id: string) => void;
    onEdit: (contact: Contact) => void;
    onReset: (id: string) => void;
    onAdd: () => void;
    onImport: () => void;
    onCallAll?: (ids: string[]) => void;
    onClearDone?: (ids: string[]) => void;
}

type SortMode = "newest" | "name" | "date";

export function KanbanBoard({ contacts, onCall, onEdit, onReset, onAdd, onImport, onCallAll, onClearDone }: KanbanBoardProps) {
    const [sortModes, setSortModes] = useState<Record<string, SortMode>>({
        "To-Do": "newest",
        "In Progress": "newest",
        "Review": "newest",
    });

    // Outcome categories
    const pendingOutcomes = ["Pending", "Scheduled", "Callback"];
    const activeOutcomes = ["Calling...", "Ringing"];
    const successOutcomes = ["Success", "Paid", "Completed"];
    const failedOutcomes = ["Failed", "Dispute", "No Answer", "Voicemail"];
    const doneOutcomes = [...successOutcomes, ...failedOutcomes];

    // Filter logic
    const todo = contacts.filter(c => !c.lastOutcome || pendingOutcomes.includes(c.lastOutcome));
    const inProgress = contacts.filter(c => activeOutcomes.includes(c.lastOutcome || ""));
    const done = contacts.filter(c => doneOutcomes.includes(c.lastOutcome || ""));

    const successCount = contacts.filter(c => successOutcomes.includes(c.lastOutcome || "")).length;
    const successRate = contacts.length > 0 ? Math.round((successCount / contacts.length) * 100) : 0;

    // Sort helper
    const sortContacts = (list: Contact[], mode: SortMode) => {
        const sorted = [...list];
        switch (mode) {
            case "name":
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case "date":
                return sorted.sort((a, b) => {
                    const da = a.nextCallDate ? new Date(a.nextCallDate).getTime() : 0;
                    const db = b.nextCallDate ? new Date(b.nextCallDate).getTime() : 0;
                    return da - db;
                });
            case "newest":
            default:
                return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    };

    const handleSort = (column: string, mode: SortMode) => {
        setSortModes(prev => ({ ...prev, [column]: mode }));
    };

    const stats = [
        { label: "Total Leads", value: contacts.length, icon: Users, color: "cyan", gradient: "from-cyan-500/20 to-blue-500/20", iconColor: "text-cyan-400", borderColor: "border-cyan-500/20" },
        { label: "Pending", value: todo.length, icon: Clock, color: "orange", gradient: "from-orange-500/20 to-amber-500/20", iconColor: "text-orange-400", borderColor: "border-orange-500/20" },
        { label: "In Progress", value: inProgress.length, icon: PhoneCall, color: "blue", gradient: "from-blue-500/20 to-indigo-500/20", iconColor: "text-blue-400", borderColor: "border-blue-500/20" },
        { label: "Success Rate", value: `${successRate}%`, icon: CheckCircle2, color: "green", gradient: "from-green-500/20 to-emerald-500/20", iconColor: "text-green-400", borderColor: "border-green-500/20" },
    ];

    const columns = [
        {
            title: "To-Do",
            contacts: sortContacts(todo, sortModes["To-Do"]),
            color: "from-orange-500 to-amber-500",
            dotColor: "bg-orange-500",
            emptyText: "No leads scheduled",
            emptyDesc: "Add contacts or import a CSV to get started",
            onAdd,
            menuItems: [
                ...(todo.length > 0 ? [{
                    label: "Call All",
                    icon: PhoneOutgoing,
                    onClick: () => onCallAll?.(todo.map(c => c.id)),
                    className: "text-cyan-400 hover:bg-cyan-500/10",
                }] : []),
                {
                    label: "Sort by Name",
                    icon: ArrowDownAZ,
                    onClick: () => handleSort("To-Do", "name"),
                    active: sortModes["To-Do"] === "name",
                },
                {
                    label: "Sort by Date",
                    icon: CalendarArrowDown,
                    onClick: () => handleSort("To-Do", "date"),
                    active: sortModes["To-Do"] === "date",
                },
            ],
        },
        {
            title: "In Progress",
            contacts: sortContacts(inProgress, sortModes["In Progress"]),
            color: "from-blue-500 to-cyan-500",
            dotColor: "bg-blue-500",
            emptyText: "No active calls",
            emptyDesc: "Click 'Call' on a lead to start dialing",
            menuItems: [
                {
                    label: "Sort by Name",
                    icon: ArrowDownAZ,
                    onClick: () => handleSort("In Progress", "name"),
                    active: sortModes["In Progress"] === "name",
                },
                {
                    label: "Sort by Date",
                    icon: CalendarArrowDown,
                    onClick: () => handleSort("In Progress", "date"),
                    active: sortModes["In Progress"] === "date",
                },
            ],
        },
        {
            title: "Review",
            contacts: sortContacts(done, sortModes["Review"]),
            color: "from-green-500 to-emerald-500",
            dotColor: "bg-green-500",
            emptyText: "No completed calls",
            emptyDesc: "Completed calls will appear here",
            menuItems: [
                ...(done.length > 0 ? [{
                    label: "Clear Column",
                    icon: Trash2,
                    onClick: () => onClearDone?.(done.map(c => c.id)),
                    className: "text-red-400 hover:bg-red-500/10",
                }] : []),
                {
                    label: "Sort by Name",
                    icon: ArrowDownAZ,
                    onClick: () => handleSort("Review", "name"),
                    active: sortModes["Review"] === "name",
                },
                {
                    label: "Sort by Date",
                    icon: CalendarArrowDown,
                    onClick: () => handleSort("Review", "date"),
                    active: sortModes["Review"] === "date",
                },
            ],
        }
    ];

    return (
        <div className="flex flex-col h-full gap-5 flex-1 min-w-0">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap size={18} className="text-cyan-500" />
                        Pipeline
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        {contacts.length > 0 
                            ? `${contacts.length} lead${contacts.length !== 1 ? 's' : ''} today` 
                            : "No leads scheduled for today"
                        }
                    </p>
                </div>
                <button
                    onClick={onImport}
                    className="flex items-center gap-2 bg-[#111] border border-[#1a1a1a] text-neutral-400 px-3.5 py-2 rounded-xl hover:bg-[#151515] hover:border-cyan-500/30 hover:text-cyan-400 transition-all text-sm font-medium group"
                >
                    <Upload size={15} className="group-hover:scale-110 transition-transform" /> Import CSV
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-4 gap-3">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className={`stat-card bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-3.5 ${stat.borderColor}`}
                    >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-2.5`}>
                            <stat.icon size={15} className={stat.iconColor} />
                        </div>
                        <div className="text-xl font-bold text-white tracking-tight">{stat.value}</div>
                        <div className="text-[11px] text-neutral-500 font-medium mt-0.5">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Kanban Columns */}
            <div className="flex-1 flex gap-4 h-full overflow-hidden">
                {columns.map((col, i) => (
                    <motion.div
                        key={col.title}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.4 }}
                        className="flex-1 min-w-[280px]"
                    >
                        <KanbanColumn
                            title={col.title}
                            count={col.contacts.length}
                            color={col.color}
                            dotColor={col.dotColor}
                            onAdd={col.onAdd}
                            menuItems={col.menuItems}
                        >
                            {col.contacts.map(c => (
                                <LeadCard key={c.id} contact={c} onCall={onCall} onEdit={onEdit} onReset={onReset} />
                            ))}
                            {col.contacts.length === 0 && <EmptyState text={col.emptyText} description={col.emptyDesc} />}
                        </KanbanColumn>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ---------- Column Menu Item ----------
interface MenuItem {
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    className?: string;
    active?: boolean;
}

// ---------- Column Menu Dropdown ----------
function ColumnMenu({ items }: { items: MenuItem[] }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen(prev => !prev)}
                className={`p-1.5 rounded-lg transition-colors ${
                    open 
                        ? "bg-[#1a1a1a] text-neutral-300" 
                        : "hover:bg-[#151515] text-neutral-600 hover:text-neutral-300"
                }`}
            >
                <MoreHorizontal size={14} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1.5 z-50 bg-[#111] border border-[#222] rounded-xl shadow-2xl shadow-black/50 py-1.5 min-w-[170px] overflow-hidden"
                    >
                        {items.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    item.onClick();
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                                    item.className 
                                        ? item.className 
                                        : item.active 
                                            ? "text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10" 
                                            : "text-neutral-400 hover:bg-[#1a1a1a] hover:text-neutral-200"
                                }`}
                            >
                                <item.icon size={13} />
                                {item.label}
                                {item.active && (
                                    <span className="ml-auto text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-bold">ON</span>
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ---------- Kanban Column ----------
function KanbanColumn({ title, count, color, dotColor, children, onAdd, menuItems }: { 
    title: string; 
    count: number; 
    color: string; 
    dotColor: string; 
    children: React.ReactNode; 
    onAdd?: () => void;
    menuItems?: MenuItem[];
}) {
    return (
        <div className="flex flex-col h-full">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                    <span className="font-semibold text-sm text-neutral-300">{title}</span>
                    <span className="bg-[#151515] text-neutral-500 text-[10px] px-1.5 py-0.5 rounded-md font-bold tabular-nums">{count}</span>
                </div>
                <div className="flex gap-0.5">
                    {onAdd && (
                        <button onClick={onAdd} className="p-1.5 hover:bg-[#151515] rounded-lg text-neutral-600 hover:text-neutral-300 transition-colors">
                            <Plus size={14} />
                        </button>
                    )}
                    {menuItems && menuItems.length > 0 && (
                        <ColumnMenu items={menuItems} />
                    )}
                </div>
            </div>

            {/* Color Bar */}
            <div className={`h-0.5 w-full bg-gradient-to-r ${color} rounded-full mb-3 opacity-40`} />

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto pr-1 pb-20 custom-scrollbar">
                {children}
            </div>
        </div>
    )
}

function EmptyState({ text, description }: { text: string, description: string }) {
    return (
        <div className="border border-dashed border-[#1a1a1a] rounded-xl p-6 text-center hover:border-[#262626] transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center mx-auto mb-3">
                <div className="w-2 h-2 rounded-full bg-neutral-700" />
            </div>
            <p className="text-sm text-neutral-500 font-medium">{text}</p>
            <p className="text-xs text-neutral-600 mt-1">{description}</p>
        </div>
    )
}
