"use client";

import { useEffect, useState } from "react";
import { Check, X, Voicemail } from "lucide-react";

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
        <div className="flex flex-col h-full bg-[#111]">
            <div className="p-4 border-b border-[#262626] flex justify-between items-center bg-[#111] sticky top-0 z-10">
                <h3 className="font-bold text-white">Activity Timeline</h3>
                <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full border border-cyan-500/20">Live</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {logs.length === 0 && (
                    <div className="text-center text-neutral-500 text-sm mt-10">No recent activity</div>
                )}

                {logs.map((log, i) => (
                    <div key={log.id} className="relative flex gap-4">
                        {/* Connector Line */}
                        {i !== logs.length - 1 && (
                            <div className="absolute left-3.5 top-8 w-0.5 h-full bg-[#262626]" />
                        )}

                        {/* Icon */}
                        <div className={`
                        w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-[#111]
                        ${log.outcome === "Success" ? "bg-green-900/30 text-green-400" :
                                log.outcome === "Voicemail" ? "bg-orange-900/30 text-orange-400" :
                                    "bg-red-900/30 text-red-400"}
                    `}>
                            {log.outcome === "Success" ? <Check size={14} /> :
                                log.outcome === "Voicemail" ? <Voicemail size={14} /> :
                                    <X size={14} />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-2">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className="text-sm font-bold text-neutral-200">{log.contact.name}</span>
                                <span className="text-[10px] text-neutral-500 font-medium">
                                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-xs text-neutral-400 mb-1">Call outcome: <span className="font-medium">{log.outcome}</span></p>

                            {log.transcript && (
                                <div className="bg-[#0a0a0a] rounded-lg p-2 text-[10px] text-neutral-500 italic border border-[#262626] line-clamp-3">
                                    &ldquo;{log.transcript}&rdquo;
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
