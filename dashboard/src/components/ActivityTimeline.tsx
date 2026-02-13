"use client";

import { useEffect, useState } from "react";
import { Check, X, Voicemail, Radio, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CallLog {
    id: string;
    outcome: string;
    transcript: string | null;
    duration: number | null;
    createdAt: string;
    contact: {
        name: string;
    };
}

export function ActivityTimeline() {
    const [logs, setLogs] = useState<CallLog[]>([]);

    useEffect(() => {
        let isMounted = true;
        
        const fetchLogs = async () => {
            try {
                const res = await fetch("/api/logs?limit=10");
                if (res.ok && isMounted) {
                    const data = await res.json();
                    setLogs(data);
                }
            } catch (e) {
                console.error("Failed to fetch logs", e);
            }
        };
        
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a]">
            <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center sticky top-0 z-10 bg-[#0a0a0a]">
                <h3 className="font-bold text-sm text-white">Activity</h3>
                <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1">
                    <Radio size={8} className="animate-pulse" />
                    Live
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-12 h-12 rounded-full bg-[#111] border border-[#1a1a1a] flex items-center justify-center mb-3">
                            <Clock size={20} className="text-neutral-600" />
                        </div>
                        <p className="text-sm text-neutral-500 font-medium">No activity yet</p>
                        <p className="text-[11px] text-neutral-600 mt-1">Call outcomes will appear here in real-time</p>
                    </div>
                )}

                <AnimatePresence mode="popLayout">
                    {logs.map((log, i) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ delay: i * 0.03, duration: 0.2 }}
                            className="relative flex gap-3 p-2.5 rounded-lg hover:bg-[#111] transition-colors group"
                        >
                            {/* Connector Line */}
                            {i !== logs.length - 1 && (
                                <div className="absolute left-[21px] top-10 w-px h-[calc(100%-16px)] bg-[#1a1a1a]" />
                            )}

                            {/* Icon */}
                            <div className={`
                                w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10
                                ${["Success", "Paid"].includes(log.outcome) ? "bg-green-500/15 text-green-400 ring-1 ring-green-500/20" :
                                    log.outcome === "Completed" ? "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/20" :
                                    log.outcome === "Voicemail" ? "bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/20" :
                                        "bg-red-500/15 text-red-400 ring-1 ring-red-500/20"}
                            `}>
                                {["Success", "Paid"].includes(log.outcome) ? <Check size={11} strokeWidth={3} /> :
                                    log.outcome === "Completed" ? <Check size={11} strokeWidth={3} /> :
                                    log.outcome === "Voicemail" ? <Voicemail size={11} /> :
                                        <X size={11} strokeWidth={3} />}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-xs font-semibold text-neutral-200 truncate">{log.contact.name}</span>
                                    <span className="text-[9px] text-neutral-600 font-medium ml-2 shrink-0">
                                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-[11px] text-neutral-500">
                                    <span className={`font-medium ${
                                        ["Success", "Paid"].includes(log.outcome) ? "text-green-400/70" :
                                        log.outcome === "Completed" ? "text-cyan-400/70" :
                                        log.outcome === "Voicemail" ? "text-orange-400/70" : "text-red-400/70"
                                    }`}>{log.outcome}</span>
                                    {log.duration && <span className="ml-1 text-neutral-600">· {log.duration}s</span>}
                                </p>

                                {log.transcript && (
                                    <div className="mt-1.5 bg-[#080808] rounded-lg p-2 text-[10px] text-neutral-600 italic border border-[#151515] line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        &ldquo;{log.transcript}&rdquo;
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
