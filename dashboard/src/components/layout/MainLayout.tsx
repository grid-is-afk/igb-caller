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
    X
} from "lucide-react";
import { motion } from "framer-motion";

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

    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] text-neutral-200 font-sans overflow-hidden">
            {/* Sidebar */}
            <motion.aside
                initial={{ width: 240 }}
                animate={{ width: isSidebarOpen ? 240 : 80 }}
                className="bg-[#111] border-r border-[#262626] text-white flex flex-col z-20"
            >
                <div className="p-6 flex items-center justify-between">
                    <div className={`flex items-center gap-3 ${!isSidebarOpen && "justify-center w-full"}`}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-white">
                            IGB
                        </div>
                        {isSidebarOpen && (
                            <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
                                <h2 className="font-bold text-lg leading-tight">IGB</h2>
                                <p className="text-xs text-neutral-500">CALLER</p>
                            </motion.div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${isActive
                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                                    } ${!isSidebarOpen && "justify-center"}`}
                            >
                                <item.icon size={20} />
                                {isSidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[#262626]">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full flex items-center justify-center p-2 text-neutral-500 hover:text-white transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
                {/* Header */}
                <header className="h-16 bg-[#111]/80 backdrop-blur-md border-b border-[#262626] flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-white">IGB Command Center</h1>
                    </div>
                </header>

                {/* Board Area */}
                <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                    <div className="h-full flex gap-6">
                        {children}

                        {/* Right Panel (Activity) */}
                        {rightPanel && (
                            <div className="w-80 h-full bg-[#111] rounded-2xl border border-[#262626] overflow-hidden flex-shrink-0">
                                {rightPanel}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
