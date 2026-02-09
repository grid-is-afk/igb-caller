"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    CheckSquare,
    FileText,
    Users,
    Menu,
    X,
    LogOut,
    Bell,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MainLayoutProps {
    children: React.ReactNode;
    rightPanel?: React.ReactNode;
}

export function MainLayout({ children, rightPanel }: MainLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/" },
        { icon: CheckSquare, label: "Tasks", href: "/tasks" },
        { icon: FileText, label: "Reports", href: "/reports" },
        { icon: Users, label: "Clients", href: "/clients" },
    ];

    const today = new Date();
    const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 17 ? "Good afternoon" : "Good evening";

    return (
        <div className="flex h-screen w-full bg-[#050505] text-neutral-200 font-sans overflow-hidden">
            {/* Sidebar */}
            <motion.aside
                initial={{ width: 240 }}
                animate={{ width: isSidebarOpen ? 240 : 72 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="bg-[#0a0a0a] border-r border-[#1a1a1a] text-white flex flex-col z-20 relative"
            >
                {/* Sidebar glow accent */}
                <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-cyan-500/20 via-transparent to-cyan-500/10" />

                <div className="p-5 flex items-center justify-between">
                    <div className={`flex items-center gap-3 ${!isSidebarOpen && "justify-center w-full"}`}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-cyan-500/20">
                            IGB
                        </div>
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <h2 className="font-bold text-base leading-tight tracking-tight">IGB</h2>
                                    <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em]">Caller</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group
                                    ${isActive
                                        ? "bg-cyan-500/10 text-cyan-400"
                                        : "text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-300"
                                    } ${!isSidebarOpen && "justify-center"}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                    />
                                )}
                                <item.icon size={18} className="relative z-10 shrink-0" />
                                <AnimatePresence>
                                    {isSidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="font-medium text-sm relative z-10"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-[#1a1a1a] space-y-1">
                    <form action="/api/auth/signout" method="POST">
                        <button
                            type="submit"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition-all ${!isSidebarOpen && "justify-center"}`}
                        >
                            <LogOut size={18} className="shrink-0" />
                            <AnimatePresence>
                                {isSidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="font-medium text-sm"
                                    >
                                        Sign Out
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </form>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-600 hover:text-neutral-400 transition-colors ${!isSidebarOpen && "justify-center"}`}
                    >
                        {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#080808]">
                {/* Header */}
                <header className="h-14 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1a1a1a] flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-cyan-500" />
                            <span className="text-sm text-neutral-400">{greeting}</span>
                        </div>
                        <span className="text-neutral-700">·</span>
                        <span className="text-sm text-neutral-500">
                            {today.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.03] transition-colors relative">
                            <Bell size={16} />
                            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                        </button>
                    </div>
                </header>

                {/* Board Area */}
                <main className="flex-1 overflow-x-auto overflow-y-auto p-5">
                    <div className="h-full flex gap-5">
                        {children}

                        {/* Right Panel (Activity) */}
                        {rightPanel && (
                            <div className="w-72 h-full bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] overflow-hidden flex-shrink-0">
                                {rightPanel}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
