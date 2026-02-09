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
    // Determine card style based on status
    const isCalling = contact.lastOutcome === "Calling...";
    const isSuccess = contact.lastOutcome === "Success";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`
        relative p-4 rounded-xl border mb-3 transition-all group
        ${isCalling ? "bg-cyan-500/10 border-cyan-500/30 ring-1 ring-cyan-500/20" : "bg-[#111] border-[#262626] hover:border-[#333]"}
      `}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isCalling ? "bg-cyan-500 animate-pulse" : isSuccess ? "bg-green-500" : "bg-orange-400"}`} />
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                        {contact.servicesOffered || "Lead"}
                    </span>
                </div>
                <button className="text-neutral-600 hover:text-neutral-400">
                    <MoreVertical size={16} />
                </button>
            </div>

            <h3 className="font-bold text-white text-sm mb-1">{contact.name}</h3>
            <p className="text-neutral-500 text-xs mb-3 flex items-center gap-1">
                <Phone size={12} /> {contact.phoneNumber}
            </p>

            {/* Action Area */}
            <div className="flex items-center justify-between border-t border-[#262626] pt-3 mt-1">
                <div className="text-xs text-neutral-500 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(contact.nextCallDate || new Date()).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onEdit(contact)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:bg-[#1a1a1a] hover:text-neutral-300 transition-colors"
                        title="Edit Contact"
                    >
                        <Edit2 size={14} />
                    </button>

                    {isCalling && (
                        <button
                            onClick={() => onReset(contact.id)}
                            className="p-1.5 rounded-lg bg-red-900/20 text-red-500 hover:bg-red-900/30 transition-colors"
                            title="Force Stop / Reset Status"
                        >
                            <AlertOctagon size={14} />
                        </button>
                    )}

                    <button
                        onClick={() => onCall(contact.id)}
                        disabled={isCalling}
                        className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${isCalling
                            ? "bg-cyan-500/20 text-cyan-400 cursor-wait"
                            : "bg-[#1a1a1a] text-neutral-400 hover:bg-green-900/20 hover:text-green-400"
                            }`}
                    >
                        {isCalling ? (
                            <span className="text-xs font-bold px-1">Dialing...</span>
                        ) : (
                            <>
                                <Play size={14} fill="currentColor" />
                                <span className="text-xs font-medium pr-1">Call</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
