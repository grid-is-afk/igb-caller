"use client";

import { useState, useEffect, MouseEvent } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Contact } from "@prisma/client";
import { CheckSquare, Calendar, Phone, Clock } from "lucide-react";

export default function TasksPage() {
    const [tasks, setTasks] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            // Fetch tasks for TODAY
            const today = new Date().toLocaleDateString("en-CA");
            const res = await fetch(`/api/contacts?date=${today}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                // Filter: Only show Pending or Scheduled or Calling... tasks
                // Exclude completed ones (Success/Failed) unless user wants history here? 
                // Usually "Tasks" = To Do.
                const todo = data.filter(c =>
                    !c.lastOutcome ||
                    ["Pending", "Scheduled", "Callback", "Calling...", "Ringing"].includes(c.lastOutcome)
                );
                setTasks(todo);
            }
        } catch (error) {
            console.error("Failed to load tasks", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleCall = async (id: string, e: MouseEvent) => {
        e.preventDefault(); // Prevent navigation if wrapped
        // Trigger call logic (simplified version of page.tsx)
        setTasks(prev => prev.map(c => c.id === id ? { ...c, lastOutcome: "Calling..." } : c));

        try {
            await fetch("/api/trigger-call", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contactId: id })
            });
        } catch {
            alert("Call failed to start");
            fetchTasks(); // Revert
        }
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-4xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <CheckSquare className="text-orange-500" /> Today&apos;s Tasks
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        You have <strong className="text-white">{tasks.length}</strong> call{tasks.length !== 1 ? "s" : ""} scheduled for today.
                    </p>
                </div>

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-10 text-neutral-500">Loading tasks...</div>
                    ) : tasks.length === 0 ? (
                        <div className="bg-[#111] border border-[#262626] rounded-xl p-10 text-center">
                            <div className="bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckSquare className="text-green-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white">All Caught Up!</h3>
                            <p className="text-neutral-500">No pending calls for today.</p>
                        </div>
                    ) : (
                        tasks.map(task => (
                            <div key={task.id} className="bg-[#111] border border-[#262626] rounded-xl p-5 hover:border-[#333] transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${task.lastOutcome === 'Calling...' ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' : 'bg-[#1a1a1a] text-neutral-500'}`}>
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{task.name}</h3>
                                        <div className="flex items-center gap-3 text-sm text-neutral-500 mt-0.5">
                                            <span className="flex items-center gap-1"><Phone size={12} /> {task.phoneNumber}</span>
                                            {task.servicesOffered && (
                                                <span className="bg-[#262626] px-2 py-0.5 rounded text-xs">{task.servicesOffered}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-medium text-neutral-300 flex items-center gap-1 justify-end">
                                            <Calendar size={14} className="text-neutral-500" />
                                            Today
                                        </div>
                                        <div className="text-xs text-neutral-500 flex items-center gap-1 justify-end">
                                            <Clock size={12} />
                                            Scheduled
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => handleCall(task.id, e)}
                                        disabled={task.lastOutcome === 'Calling...'}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${task.lastOutcome === 'Calling...'
                                            ? 'bg-cyan-600 text-white cursor-wait'
                                            : 'bg-green-900/20 text-green-400 hover:bg-green-600 hover:text-white'
                                            }`}
                                        title="Call Now"
                                    >
                                        <Phone size={20} fill="currentColor" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
