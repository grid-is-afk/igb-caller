'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions';
import { Lock, User, Loader2, Zap } from 'lucide-react';

export default function LoginPage() {
    const [errorMessage, dispatch] = useFormState(authenticate, undefined);

    return (
        <div className="w-full flex min-h-screen items-center justify-center bg-[#050505] relative overflow-hidden">
            {/* Background gradient effects */}
            <div className="absolute top-1/4 -left-32 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px]" />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-cyan-500/20 mb-4">
                        IGB
                    </div>
                    <h2 className="text-sm text-neutral-500 flex items-center gap-1.5">
                        <Zap size={12} className="text-cyan-500" />
                        Command Center
                    </h2>
                </div>

                <div className="p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl shadow-2xl shadow-black/50">
                    <h1 className="text-lg font-bold text-white mb-1 text-center">Welcome back</h1>
                    <p className="text-sm text-neutral-500 mb-6 text-center">Sign in to access your dashboard</p>

                    <form action={dispatch} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-neutral-600" size={16} />
                                <input
                                    name="username"
                                    className="w-full bg-[#080808] border border-[#1a1a1a] rounded-xl pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-neutral-600"
                                    placeholder="Admin username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 text-neutral-600" size={16} />
                                <input
                                    name="password"
                                    type="password"
                                    className="w-full bg-[#080808] border border-[#1a1a1a] rounded-xl pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-neutral-600"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <LoginButton />

                        {errorMessage && (
                            <div className="text-red-400 text-xs text-center bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                                {errorMessage}
                            </div>
                        )}
                    </form>
                </div>

                <p className="text-center text-[11px] text-neutral-700 mt-4">
                    IGB Caller · Automated outreach platform
                </p>
            </div>
        </div>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <button
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-2.5 rounded-xl transition-all flex justify-center items-center gap-2 text-sm shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 disabled:opacity-50"
            disabled={pending}
        >
            {pending && <Loader2 size={14} className="animate-spin" />}
            {pending ? 'Signing in...' : 'Sign In'}
        </button>
    );
}
