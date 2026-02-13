"use client";

import { Contact } from "@prisma/client";
import { Phone, Clock, MoreVertical, Edit2, Play, AlertOctagon } from "lucide-react";
import { motion } from "framer-motion";

interface LeadCardProps {
    contact: Contact;
    onCall: (id: string) => void;
    onEdit: (contact: Contact) => void;
    onReset: (id: string) => void;
}

export function LeadCard({ contact, onCall, onEdit, onReset }: LeadCardProps) {
    const isCalling = contact.lastOutcome === "Calling...";
    const isSuccess = ["Success", "Paid"].includes(contact.lastOutcome || "");
    const isCompleted = contact.lastOutcome === "Completed"; // Neutral — call ended, no clear outcome yet
    const isFailed = ["Failed", "Dispute", "No Answer"].includes(contact.lastOutcome || "");

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
                relative p-3.5 rounded-xl border mb-2.5 transition-all group cursor-default
                ${isCalling 
                    ? "bg-cyan-500/[0.06] border-cyan-500/20 animate-pulse-glow" 
                    : isSuccess 
                        ? "bg-green-500/[0.04] border-green-500/15"
                        : isFailed
                            ? "bg-red-500/[0.04] border-red-500/15"
                            : isCompleted
                                ? "bg-cyan-500/[0.03] border-cyan-500/10"
                                : "bg-[#0c0c0c] border-[#1a1a1a] hover:border-[#262626]"
                }
            `}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                        isCalling ? "bg-cyan-500 animate-pulse" 
                        : isSuccess ? "bg-green-500" 
                        : isFailed ? "bg-red-500"
                        : isCompleted ? "bg-cyan-400"
                        : "bg-orange-400"
                    }`} />
                    <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider">
                        {contact.servicesOffered || "Lead"}
                    </span>
                </div>
                <button className="text-neutral-700 hover:text-neutral-400 opacity-0 group-hover:opacity-100 transition-all">
                    <MoreVertical size={14} />
                </button>
            </div>

            <h3 className="font-bold text-white text-sm mb-0.5 leading-tight">{contact.name}</h3>
            <p className="text-neutral-600 text-xs mb-3 flex items-center gap-1">
                <Phone size={10} /> {contact.phoneNumber}
            </p>

            {/* Action Area */}
            <div className="flex items-center justify-between border-t border-[#151515] pt-2.5 mt-1">
                <div className="text-[10px] text-neutral-600 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(contact.nextCallDate || new Date()).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onEdit(contact)}
                        className="p-1.5 rounded-lg text-neutral-600 hover:bg-[#151515] hover:text-neutral-300 transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit Contact"
                    >
                        <Edit2 size={12} />
                    </button>

                    {isCalling && (
                        <button
                            onClick={() => onReset(contact.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Force Stop"
                        >
                            <AlertOctagon size={12} />
                        </button>
                    )}

                    <button
                        onClick={() => onCall(contact.id)}
                        disabled={isCalling}
                        className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-medium ${
                            isCalling
                                ? "bg-cyan-500/15 text-cyan-400 cursor-wait"
                                : "bg-[#111] text-neutral-500 hover:bg-green-500/15 hover:text-green-400 border border-[#1a1a1a] hover:border-green-500/20"
                        }`}
                    >
                        {isCalling ? (
                            <span className="px-1 text-[10px] font-bold">Dialing...</span>
                        ) : (
                            <>
                                <Play size={11} fill="currentColor" />
                                <span className="pr-0.5">Call</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
