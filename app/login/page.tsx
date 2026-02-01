'use client';

import { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle, ArrowRight, Sparkles, Mail, Lock, User, Chrome } from 'lucide-react';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    // Changed initial state to 'signup' so "Criar" is default
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
    const [loginMethod, setLoginMethod] = useState<'password' | 'magic'>('password');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isRecovery, setIsRecovery] = useState(false);

    const handleRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?next=/dashboard` : undefined,
            });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Instruções enviadas! Verifique seu email.' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erro ao enviar email.' });
        } finally {
            setLoading(false);
        }
    };

    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams?.get('next');
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}` : '';

    const supabase = createClient();

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
            },
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (authMode === 'signup') {
                // SIGN UP FLOW
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName },
                        emailRedirectTo: redirectUrl,
                    },
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Cadastro realizado! Verifique seu email para confirmar a conta.' });
            } else {
                // LOGIN FLOW
                if (loginMethod === 'magic') {
                    const { error } = await supabase.auth.signInWithOtp({
                        email,
                        options: { emailRedirectTo: redirectUrl },
                    });
                    if (error) throw error;
                    setMessage({ type: 'success', text: 'Link mágico enviado! Verifique sua caixa de entrada.' });
                } else {
                    const { error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });
                    if (error) throw error;
                    router.push(next ? decodeURIComponent(next) : '/dashboard');
                    router.refresh();
                }
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Ocorreu um erro durante a autenticação.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-64px)] w-full bg-background relative overflow-hidden">

            {/* FULL PAGE BACKGROUND IMAGE */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <Image
                    src="/login-bg-v6.webp"
                    alt="Background"
                    fill
                    className="object-contain object-left opacity-50 dark:opacity-30 blur-[1px]"
                    priority
                />
            </div>


            {/* LEFT SIDE - Content Only */}
            <div className="hidden lg:flex w-1/2 flex-col justify-start items-start p-12 z-10 h-full pt-0 pb-4">

                {/* Top: Title */}
                <div className="max-w-lg text-[#1a1a1a] dark:text-white mt-10">
                    <h1 className="text-5xl font-heading font-bold leading-tight tracking-tight drop-shadow-sm">
                        Construa o futuro com inteligência.
                    </h1>
                </div>

                {/* Bottom: Subtitle & Approvals - Spaced by ~5cm + 6cm (approx 400px or mt-96) */}
                <div className="max-w-lg space-y-6 mt-96">
                    <p className="text-lg text-[#333333] dark:text-gray-100 font-manrope font-medium leading-relaxed drop-shadow-sm">
                        Junte-se a milhares de engenheiros e arquitetos que utilizam o ObraPlana para criar orçamentos precisos em segundos.
                    </p>

                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-white/20 bg-gray-200 dark:bg-white/10 backdrop-blur-sm" />
                            ))}
                        </div>
                        <div className="text-sm font-bold text-[#1a1a1a] dark:text-white drop-shadow-md">
                            4.9/5 <span className="font-medium opacity-90">de aprovação</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - Form Island */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 relative z-10">

                <div className="w-full max-w-[420px] bg-white dark:bg-[#333130] p-8 lg:p-10 relative z-10 rounded-2xl shadow-sm border border-border">

                    {/* Google Button - Top Placement */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#333130] text-[#5f6368] dark:text-[#D3D4D6] border border-[#B6B8BC] dark:border-[#444] hover:bg-[#F8F9FA] dark:hover:bg-[#403e3d] p-3 rounded-xl transition-all duration-200 font-medium text-sm h-12 mb-6 group"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-5 h-5" />
                        ) : (
                            <>
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Continuar com Google</span>
                            </>
                        )}
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-[#D3D4D6] dark:border-[#444]" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest">
                            <span className="bg-white dark:bg-[#333130] px-4 text-[#919599] font-medium">ou {loginMethod === 'magic' ? 'link' : 'email'}</span>
                        </div>
                    </div>

                    {/* Tab Switcher - Moved Here */}
                    <div className="grid grid-cols-3 gap-1 mb-8 bg-gray-100 dark:bg-black/20 p-1 rounded-xl">
                        {/* 1. Criar */}
                        <button
                            type="button"
                            onClick={() => { setAuthMode('signup'); setLoginMethod('password'); setMessage(null); }}
                            className={`text-xs font-semibold py-2.5 rounded-lg transition-all ${authMode === 'signup'
                                ? 'bg-white dark:bg-[#444] text-[#222120] dark:text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <span className="flex items-center justify-center gap-1.5">
                                <User size={12} className="mb-0.5" />
                                Criar
                            </span>
                        </button>

                        {/* 2. Entrar */}
                        <button
                            type="button"
                            onClick={() => { setAuthMode('login'); setLoginMethod('password'); setMessage(null); }}
                            className={`text-xs font-semibold py-2.5 rounded-lg transition-all ${authMode === 'login' && loginMethod === 'password'
                                ? 'bg-white dark:bg-[#444] text-[#222120] dark:text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <span className="flex items-center justify-center gap-1.5">
                                <Lock size={12} className="mb-0.5" />
                                Entrar
                            </span>
                        </button>

                        {/* 3. Mágico */}
                        <button
                            type="button"
                            onClick={() => { setAuthMode('login'); setLoginMethod('magic'); setMessage(null); }}
                            className={`text-xs font-semibold py-2.5 rounded-lg transition-all ${authMode === 'login' && loginMethod === 'magic'
                                ? 'bg-white dark:bg-[#444] text-[#222120] dark:text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <span className="flex items-center justify-center gap-1.5">
                                <Sparkles size={12} className="mb-0.5" />
                                Mágico
                            </span>
                        </button>
                    </div>

                    {/* Main Form or Recovery Form */}
                    {isRecovery ? (
                        <form onSubmit={handleRecovery} className="space-y-5 animate-in slide-in-from-right-4 fade-in">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recuperar Senha</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Informe seu email para receber o link de acesso.</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#919599] uppercase ml-1">Email Cadastrado</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B6B8BC]" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#D3D4D6] dark:border-[#444] bg-[#F8F9FA] dark:bg-[#1a1a1a] text-[#222120] dark:text-white placeholder-[#B6B8BC] focus:ring-2 focus:ring-[#F6A24A]/20 focus:border-[#F6A24A] transition-all outline-none text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#E9813C] hover:bg-[#d46d2a] text-white font-bold p-3.5 rounded-xl transition-all shadow-lg shadow-[#E9813C]/20 hover:shadow-[#E9813C]/40 active:scale-[0.98] h-12 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Enviar Instruções'}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setIsRecovery(false); setMessage(null); }}
                                className="w-full text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium py-2 transition-colors"
                            >
                                Voltar para Login
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleEmailAuth} className="space-y-5">

                            {/* Auth Mode Tabs included in form flow logic somewhat, but functionally separated above */}
                            {authMode === 'signup' && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in">
                                    <label className="text-xs font-bold text-[#919599] uppercase ml-1">Nome Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B6B8BC]" />
                                        <input
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Ex: Ana Silva"
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#D3D4D6] dark:border-[#444] bg-[#F8F9FA] dark:bg-[#1a1a1a] text-[#222120] dark:text-white placeholder-[#B6B8BC] focus:ring-2 focus:ring-[#F6A24A]/20 focus:border-[#F6A24A] transition-all outline-none text-sm font-medium"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#919599] uppercase ml-1">Email Profissional</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B6B8BC]" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#D3D4D6] dark:border-[#444] bg-[#F8F9FA] dark:bg-[#1a1a1a] text-[#222120] dark:text-white placeholder-[#B6B8BC] focus:ring-2 focus:ring-[#F6A24A]/20 focus:border-[#F6A24A] transition-all outline-none text-sm font-medium"
                                    />
                                </div>
                            </div>

                            {/* Password or Magic Info */}
                            {loginMethod === 'password' ? (
                                <div className="space-y-1.5 animate-in slide-in-from-top-1 fade-in">
                                    <label className="text-xs font-bold text-[#919599] uppercase ml-1 flex justify-between">
                                        Senha
                                        {authMode === 'login' && (
                                            <button
                                                type="button"
                                                onClick={() => { setIsRecovery(true); setMessage(null); }}
                                                className="text-[#F6A24A] hover:text-[#D85B2F] normal-case font-medium transition-colors"
                                            >
                                                Esqueceu?
                                            </button>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B6B8BC]" />
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="******"
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#D3D4D6] dark:border-[#444] bg-[#F8F9FA] dark:bg-[#1a1a1a] text-[#222120] dark:text-white placeholder-[#B6B8BC] focus:ring-2 focus:ring-[#F6A24A]/20 focus:border-[#F6A24A] transition-all outline-none text-sm font-medium"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 text-xs text-blue-600 dark:text-blue-300 flex items-start gap-2 animate-in fade-in">
                                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p>Enviaremos um link seguro para o seu email. Você poderá entrar sem precisar de senha.</p>
                                </div>
                            )}

                            {/* Primary Action Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#E9813C] hover:bg-[#d46d2a] text-white font-bold p-3.5 rounded-xl transition-all shadow-lg shadow-[#E9813C]/20 hover:shadow-[#E9813C]/40 active:scale-[0.98] h-12 flex items-center justify-center gap-2 mt-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        <span>{authMode === 'login' ? (loginMethod === 'magic' ? 'Enviar Link de Acesso' : 'Entrar na Conta') : 'Criar Conta Grátis'}</span>
                                        <ArrowRight size={18} className="opacity-80" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Footer Links (Termos, etc if needed, but removing old toggles) */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400">
                            Ao continuar, você concorda com nossos <br /> <a href="#" className="underline hover:text-gray-500">Termos</a> e <a href="#" className="underline hover:text-gray-500">Privacidade</a>.
                        </p>
                    </div>

                    {/* Messages */}
                    {message && (
                        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] p-3 rounded-lg flex items-center gap-2 text-xs font-medium shadow-lg animate-in slide-in-from-bottom-2 ${message.type === 'success'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-600 border border-red-200'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                            <p>{message.text}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center bg-white dark:bg-[#1a1a1a]">
                <Loader2 className="animate-spin text-[#D85B2F] w-8 h-8" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
