'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions';
import { Lock, User, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [errorMessage, dispatch] = useFormState(authenticate, undefined);

    return (
        <div className="w-full flex min-h-screen items-center justify-center bg-[#050505]">
            <div className="w-full max-w-sm p-8 bg-[#0a0a0a] border border-[#262626] rounded-xl shadow-2xl">
                <h1 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                    <Lock className="text-cyan-500" /> Administrative Login
                </h1>

                <form action={dispatch} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-2">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-neutral-500" size={18} />
                            <input
                                name="username"
                                className="w-full bg-[#111] border border-[#262626] rounded pl-10 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                placeholder="Admin username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-neutral-500" size={18} />
                            <input
                                name="password"
                                type="password"
                                className="w-full bg-[#111] border border-[#262626] rounded pl-10 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <LoginButton />

                    {errorMessage && (
                        <div className="text-red-500 text-sm text-center bg-red-950/20 p-2 rounded border border-red-900/50">
                            {errorMessage}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <button
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 rounded transition-colors flex justify-center items-center gap-2"
            disabled={pending}
        >
            {pending && <Loader2 size={16} className="animate-spin" />}
            {pending ? 'Verifying...' : 'Access Dashboard'}
        </button>
    );
}
