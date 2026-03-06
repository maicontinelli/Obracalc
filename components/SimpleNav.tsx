'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Gem, Info, Mail, Heart, LogIn, User, LogOut, LayoutDashboard, MoreHorizontal, Sparkles, Sun, Moon, Home, ArrowLeft, FileSpreadsheet, Printer, Cloud } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useMemo } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useTheme } from 'next-themes';

export default function SimpleNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [includeContract, setIncludeContract] = useState(false);
    const supabase = createClient();

    // Detect if we are on a report page
    const isReportPage = pathname.startsWith('/report/');
    const estimateId = isReportPage ? pathname.split('/')[2] : null;

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Listen for contract state changes from ReportClient
    useEffect(() => {
        if (!isReportPage) return;

        const handleStateSync = (e: any) => {
            if (e.detail?.includeContract !== undefined) {
                setIncludeContract(e.detail.includeContract);
            }
        };

        window.addEventListener('report-sync-state', handleStateSync);
        return () => window.removeEventListener('report-sync-state', handleStateSync);
    }, [isReportPage]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        setUser(null);
    };

    const triggerAction = (action: string) => {
        window.dispatchEvent(new CustomEvent('report-action', { detail: action }));
    };

    const toggleContract = () => {
        const newState = !includeContract;
        setIncludeContract(newState);
        window.dispatchEvent(new CustomEvent('report-action', { detail: { type: 'toggle-contract', value: newState } }));
    };

    return (
        <div className="fixed top-4 left-0 right-0 z-50 pointer-events-none px-4">
            <div className="max-w-7xl mx-auto flex justify-center sm:justify-end items-center pointer-events-none">
                {/* Single Island - Ordered: [Report Actions] | Home, Dashboard | Planos, Theme, Logout/Login */}
                <div className="flex items-center gap-1 sm:gap-1.5 bg-white/80 dark:bg-[#1a1918]/80 backdrop-blur-md p-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] pointer-events-auto">

                    {/* --- REPORT ACTIONS --- */}
                    {isReportPage && estimateId && (
                        <>
                            {/* Back to Editor */}
                            <Link
                                href={`/editor/${estimateId}`}
                                title="Voltar ao Editor"
                                className="transition-all p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-orange-500 group"
                            >
                                <ArrowLeft size={18} />
                                <span className="sr-only">Editor</span>
                            </Link>

                            <div className="h-4 w-px mx-0.5 bg-gray-200/50 dark:bg-white/10" />

                            {/* Contract Toggle */}
                            <div className="flex items-center gap-2 px-1.5 sm:px-3 py-1">
                                <span className="text-[10px] font-bold uppercase tracking-tight text-gray-600 dark:text-gray-400 hidden xs:block select-none">Contrato</span>
                                <button
                                    type="button"
                                    onClick={toggleContract}
                                    title="Incluir Contrato"
                                    className={`relative inline-flex h-5 w-9 sm:w-10 items-center rounded-full transition-all duration-200 focus:outline-none ${includeContract ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-all duration-200 ${includeContract ? 'translate-x-4.5 sm:translate-x-5.5' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="h-4 w-px mx-0.5 bg-gray-200/50 dark:bg-white/10" />

                            {/* Export Excel */}
                            <button
                                type="button"
                                onClick={() => triggerAction('excel')}
                                title="Exportar Excel"
                                className="transition-all p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-green-600"
                            >
                                <FileSpreadsheet size={18} />
                            </button>

                            {/* Export PDF (Print) */}
                            <button
                                type="button"
                                onClick={() => triggerAction('print')}
                                title="Exportar PDF"
                                className="transition-all p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-primary"
                            >
                                <Printer size={18} />
                            </button>

                            {/* Guest Save Button */}
                            {!user && (
                                <Link
                                    href="/login"
                                    target="_blank"
                                    title="Salvar Orçamento"
                                    className="transition-all p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-white/5 text-orange-500"
                                >
                                    <Cloud size={18} />
                                </Link>
                            )}

                            <div className="h-6 w-px mx-1 bg-gray-300 dark:bg-white/20" />
                        </>
                    )}

                    {/* --- STANDARD NAV ITEMS --- */}
                    {/* Hide some items on mobile if on report page to save space */}
                    {(!isReportPage || mounted) && (
                        <>
                            {/* 1. Home */}
                            <Link
                                href="/"
                                title="Início"
                                className={`transition-all p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-white/5 group flex ${pathname === '/'
                                    ? 'text-orange-500'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-orange-500'
                                    }`}
                            >
                                <Home size={18} />
                                <span className="sr-only">Início</span>
                            </Link>

                            {/* 2. Dashboard (If logged in) */}
                            {user && (
                                <Link
                                    href="/dashboard"
                                    title="Painel"
                                    className={`transition-all p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-white/5 group flex ${pathname === '/dashboard'
                                        ? 'text-orange-500'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-orange-500'
                                        }`}
                                >
                                    <User
                                        size={18}
                                        className={`transition-all duration-300 group-hover:drop-shadow-[0_0_5px_rgba(234,88,12,0.4)] ${pathname === '/dashboard' ? 'fill-orange-500' : 'fill-transparent'
                                            }`}
                                    />
                                    <span className="sr-only">Painel</span>
                                </Link>
                            )}

                            {(!isReportPage) && (
                                <div className="h-4 w-px mx-0.5 bg-gray-200/50 dark:bg-white/10" />
                            )}

                            {/* 3. Planos */}
                            <Link
                                href="/planos"
                                title="Planos"
                                className={`transition-all p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-white/5 group flex ${pathname === '/planos'
                                    ? 'text-[#74D2E7]'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-[#74D2E7]'
                                    }`}
                            >
                                <Gem
                                    size={18}
                                    className={`transition-all duration-300 group-hover:drop-shadow-[0_0_5px_rgba(116,210,231,0.6)] ${pathname === '/planos' ? 'fill-[#74D2E7]' : 'fill-transparent'
                                        }`}
                                />
                                <span className="sr-only">Planos</span>
                            </Link>

                            <div className="h-4 w-px mx-0.5 bg-gray-200/50 dark:bg-white/10" />

                            {/* 4. Utilities (Theme Switcher) */}
                            {mounted && (
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100/50 dark:hover:bg-white/5"
                                    aria-label="Alternar tema"
                                    title="Alternar Tema"
                                >
                                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                </button>
                            )}

                            {/* 5. Logout / Login */}
                            {user ? (
                                <button
                                    onClick={handleSignOut}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100/50 dark:hover:bg-white/5"
                                    title="Sair"
                                >
                                    <LogOut size={18} />
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    className="ml-1 flex items-center gap-2 bg-[#FF6600] hover:bg-[#E55C00] text-white px-4 py-1.5 rounded-full font-medium text-xs sm:text-sm transition-all shadow-lg shadow-[#FF6600]/20 active:scale-95"
                                    title="Entrar"
                                >
                                    <LogIn size={14} />
                                    <span className="hidden xs:block">Entrar</span>
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>

    );
}
