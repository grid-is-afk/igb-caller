"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, PhoneCall, CheckCircle2, XCircle, Archive, Download, ChevronDown, ChevronUp } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

interface CallLog {
    id: string;
    transcript: string;
    outcome: string;
    createdAt: string;
    contact: {
        name: string;
        phoneNumber: string;
    }
}

interface GroupedLogs {
    [date: string]: CallLog[];
}

export default function ReportsPage() {
    const [logs, setLogs] = useState<GroupedLogs>({});
    const [loading, setLoading] = useState(true);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/reports");
            const data = await res.json();
            setLogs(data);
        } catch (err) {
            console.error("Failed to fetch reports:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const downloadCsv = (data: CallLog[], filename: string) => {
        const headers = ["Date", "Time", "Client Name", "Phone", "Outcome", "Transcript"];
        const rows = data.map(log => [
            new Date(log.createdAt).toLocaleDateString(),
            new Date(log.createdAt).toLocaleTimeString(),
            log.contact.name,
            log.contact.phoneNumber,
            log.outcome,
            `"${(log.transcript || "").replace(/"/g, '""')}"` // Escape quotes
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleArchive = async (dateKey?: string) => {
        const targetLogs = dateKey ? logs[dateKey] : Object.values(logs).flat();
        if (!targetLogs || targetLogs.length === 0) return;

        if (!confirm(`This will DOWNLOAD the ${dateKey ? 'report for ' + dateKey : 'FULL history'} and then PERMANENTLY DELETE it from the database.\n\nContinue?`)) {
            return;
        }

        // 1. Download
        const filename = `call_report_${dateKey || 'full_history'}_${new Date().getTime()}.csv`;
        downloadCsv(targetLogs, filename);

        // 2. Delete (Archive)
        try {
            const res = await fetch("/api/archive", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: dateKey }), // undefined if full
            });

            if (res.ok) {
                alert("Archive successful. Database cleared.");
                fetchReports();
            } else {
                alert("Failed to delete from database. CSV was downloaded.");
            }
        } catch {
            alert("Error archiving.");
        }
    };

    return (
        <MainLayout>
            <div className="w-full">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                            <FileText className="text-cyan-500" /> Call Reports
                        </h1>
                        <p className="text-neutral-500 mt-1">Daily interaction history.</p>
                    </div>

                    {Object.keys(logs).length > 0 && (
                        <button
                            onClick={() => handleArchive(undefined)}
                            className="flex items-center gap-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 px-4 py-2 rounded transition-colors"
                        >
                            <Archive size={18} /> Archive All History
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-neutral-500">Loading history...</div>
                ) : Object.keys(logs).length === 0 ? (
                    <div className="text-neutral-500">No call history found.</div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(logs).map(([date, items]) => (
                            <div key={date}>
                                <div className="flex items-center gap-4 mb-4 border-b border-[#262626] pb-2">
                                    <h3 className="text-xl font-semibold text-cyan-400">
                                        {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </h3>
                                    <button
                                        onClick={() => handleArchive(date)}
                                        className="text-xs flex items-center gap-1 text-neutral-500 hover:text-neutral-300 transition-colors"
                                    >
                                        <Download size={14} /> Archive Day
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {Array.isArray(items) && items.map(log => (
                                        <div key={log.id} className="bg-[#111] border border-[#262626] rounded-lg p-4 hover:border-[#333] transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className={`p-2 rounded-full ${
                                                        ["Success", "Paid"].includes(log.outcome) ? 'bg-green-900/20 text-green-400' :
                                                        ["Failed", "Dispute", "No Answer"].includes(log.outcome) ? 'bg-red-900/20 text-red-400' :
                                                        log.outcome === "Voicemail" ? 'bg-orange-900/20 text-orange-400' :
                                                        log.outcome === "Completed" ? 'bg-cyan-900/20 text-cyan-400' :
                                                        'bg-[#262626] text-neutral-400'
                                                        }`}>
                                                        {["Success", "Paid"].includes(log.outcome) ? <CheckCircle2 size={16} /> :
                                                            ["Failed", "Dispute", "No Answer"].includes(log.outcome) ? <XCircle size={16} /> : <PhoneCall size={16} />}
                                                    </span>
                                                    <div>
                                                        <div className="font-medium text-white">{log.contact.name}</div>
                                                        <div className="text-xs text-neutral-500">{log.contact.phoneNumber}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                        ["Success", "Paid"].includes(log.outcome) ? "bg-green-900/20 text-green-400 border border-green-900/30" :
                                                        ["Failed", "Dispute", "No Answer"].includes(log.outcome) ? "bg-red-900/20 text-red-400 border border-red-900/30" :
                                                        log.outcome === "Voicemail" ? "bg-orange-900/20 text-orange-400 border border-orange-900/30" :
                                                        log.outcome === "Completed" ? "bg-cyan-900/20 text-cyan-400 border border-cyan-900/30" :
                                                        "bg-[#262626] text-neutral-400"
                                                    }`}>{log.outcome}</span>
                                                    <span className="text-xs text-neutral-500">
                                                        {new Date(log.createdAt).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {log.transcript && (
                                                <TranscriptBlock text={log.transcript} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

function TranscriptBlock({ text }: { text: string }) {
    const [expanded, setExpanded] = useState(false);

    // Split analysis summary from full conversation transcript
    const hasAnalysis = text.startsWith("[Analysis]");
    let analysisPart = "";
    let conversationPart = text;

    if (hasAnalysis) {
        const dividerIndex = text.indexOf("\n\n---\n\n");
        if (dividerIndex !== -1) {
            analysisPart = text.substring("[Analysis] ".length, dividerIndex);
            conversationPart = text.substring(dividerIndex + "\n\n---\n\n".length);
        } else {
            analysisPart = text.substring("[Analysis] ".length);
            conversationPart = "";
        }
    }

    const isLong = conversationPart.length > 400;
    const displayConversation = expanded || !isLong ? conversationPart : conversationPart.substring(0, 400) + "...";

    return (
        <div className="bg-[#0a0a0a] rounded border border-[#262626] overflow-hidden mt-2">
            {/* Analysis Summary */}
            {analysisPart && (
                <div className="px-3 py-2 bg-cyan-500/5 border-b border-[#1a1a1a] text-[11px] text-cyan-400/80 font-medium">
                    {analysisPart.split(" | ").map((part, i) => (
                        <span key={i} className="inline-block mr-3">
                            {part}
                        </span>
                    ))}
                </div>
            )}

            {/* Full Conversation Transcript */}
            {conversationPart && (
                <div className="p-3 text-neutral-400 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                    {displayConversation}
                </div>
            )}

            {/* No transcript */}
            {!conversationPart && !analysisPart && (
                <div className="p-3 text-neutral-600 text-xs italic">No transcript available.</div>
            )}

            {isLong && (
                <button
                    onClick={() => setExpanded(prev => !prev)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 bg-[#0d0d0d] border-t border-[#1a1a1a] transition-colors"
                >
                    {expanded ? (
                        <><ChevronUp size={12} /> Show Less</>
                    ) : (
                        <><ChevronDown size={12} /> Show Full Transcript</>
                    )}
                </button>
            )}
        </div>
    );
}
