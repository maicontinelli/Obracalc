'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Gem, Info, Mail, Heart, LogIn, User, LogOut, LayoutDashboard, MoreHorizontal, Sparkles, Sun, Moon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useTheme } from 'next-themes';

export default function SimpleNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const supabase = createClient();

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

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        setUser(null);
    };

    const isReportPage = pathname?.startsWith('/report/');


    return (
        <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm border-gray-200/50 dark:bg-background/95 dark:border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <Image
                                src="/logo-test.webp"
                                alt="ObraPlana Logo"
                                width={32}
                                height={32}
                                className="h-8 w-auto"
                                priority
                            />
                            <span className="font-manrope font-bold text-xl text-foreground">Obra Plana</span>
                        </Link>
                    </div>


                    <div className="flex items-center gap-2 md:gap-6">


                        {/* Links remocao instruida pelo usuario */}


                        <div className="h-6 w-px mx-2 bg-gray-200 dark:bg-gray-700" />

                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                aria-label="Alternar tema"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        )}

                        <Link
                            href="/planos"
                            title="Planos"
                            className={`transition-all p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${pathname === '/planos'
                                ? 'text-[#74D2E7] bg-gray-50 dark:bg-gray-800/50'
                                : 'text-gray-500 dark:text-gray-400'
                                } hover:text-[#74D2E7] group mr-1`}
                        >
                            <Gem
                                size={20}
                                className={`transition-all duration-300 group-hover:drop-shadow-[0_0_5px_rgba(116,210,231,0.6)] ${pathname === '/planos' ? 'fill-[#74D2E7]' : 'fill-transparent'
                                    }`}
                            />
                            <span className="sr-only">Planos</span>
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/dashboard"
                                    title="Painel"
                                    className={`transition-all p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${pathname === '/dashboard'
                                        ? 'text-orange-600 bg-gray-50 dark:bg-gray-800/50'
                                        : 'text-gray-500 dark:text-gray-400'
                                        } hover:text-orange-600 group`}
                                >
                                    <User
                                        size={20}
                                        className={`transition-all duration-300 group-hover:drop-shadow-[0_0_5px_rgba(234,88,12,0.6)] ${pathname === '/dashboard' ? 'fill-orange-600' : 'fill-transparent'
                                            }`}
                                    />
                                    <span className="sr-only">Painel</span>
                                </Link>

                                <button
                                    onClick={handleSignOut}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Sair"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 bg-[#E9813C] hover:bg-[#d67332] text-white px-4 py-2 rounded-full font-medium text-sm transition-all shadow-lg shadow-[#E9813C]/20"
                            >
                                <LogIn size={16} />
                                <span>Entrar</span>
                            </Link>
                        )}


                    </div>
                </div>
            </div>
        </nav >
    );
}
