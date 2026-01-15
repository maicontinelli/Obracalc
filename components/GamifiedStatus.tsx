import React from 'react';
import { UserProfile } from '@/lib/plan-limits';
import { Leaf, Award, Wallet, ArrowRight, Zap, RefreshCw, Calendar, TrendingUp } from 'lucide-react';

interface GamifiedStatusProps {
    profile: UserProfile | null;
}

export function GamifiedStatus({ profile }: GamifiedStatusProps) {
    if (!profile) return null;

    // --- Subscription Logic ---
    const calculateDaysLeft = () => {
        if (profile.tier === 'free') return null;
        if (!profile.current_period_end) return 30; // Default assumption if missing
        const end = new Date(profile.current_period_end);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        return Math.max(0, days);
    };

    const daysLeft = calculateDaysLeft();
    const totalDays = 30; // Assuming monthly cycle
    const progressPercent = daysLeft !== null ? Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100)) : 0;

    // --- Points Logic ---
    const points = profile.points || 0;
    const nextLevel = 1000; // Example goal
    const pointsProgress = Math.min(100, (points / nextLevel) * 100);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

            {/* Left Card: Subscription Cycle */}
            <div className="bg-card dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-sm border border-border dark:border-white/10 relative overflow-hidden group">
                {/* Decoration */}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Calendar size={100} />
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-heading font-bold text-foreground">Ciclo da Assinatura</h3>
                            <p className="text-sm text-muted-foreground">Acompanhe sua renovação</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${profile.tier === 'free'
                                ? 'bg-gray-100 text-gray-500 border-gray-200'
                                : 'bg-green-100 text-green-700 border-green-200'
                            }`}>
                            {profile.tier === 'free' ? 'Vitalício' : 'Ativo'}
                        </div>
                    </div>

                    {profile.tier === 'free' ? (
                        <div className="py-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Você está no plano <strong>Grátis</strong>. Faça um upgrade para desbloquear recursos ilimitados.
                            </p>
                            <a href="/planos" className="inline-block w-full text-center bg-foreground text-background py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
                                Ver Planos Premium
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-blue-600 dark:text-blue-400">Início</span>
                                <span className={daysLeft! <= 5 ? 'text-red-500' : 'text-foreground'}>
                                    {daysLeft} dias restantes
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
                                <div
                                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${daysLeft! <= 5 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                                        }`}
                                    style={{ width: `${progressPercent}%` }}
                                >
                                    {/* Shimmer Effect */}
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                                Renovação automática prevista para a próxima fatura.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Card: Gamified Points System */}
            <div className="bg-card dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-sm border border-border dark:border-white/10 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                            <Award className="text-orange-500" size={20} />
                            Sua Conquista
                        </h3>
                        <p className="text-sm text-muted-foreground">Como você ganha e usa pontos</p>
                    </div>
                    <div className="text-right">
                        <span className="block text-2xl font-black text-orange-500">{points}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Pontos Totais</span>
                    </div>
                </div>

                {/* Gamification Flow Visualization */}
                <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -translate-y-1/2 z-0 hidden sm:block"></div>

                    <div className="grid grid-cols-3 gap-2 relative z-10">
                        {/* Step 1: Create */}
                        <div className="flex flex-col items-center group">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border-2 border-blue-100 dark:border-gray-700 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform group-hover:border-blue-500">
                                <Leaf size={20} className="text-blue-500" />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase text-center">Crie Orçamentos</span>
                            <span className="text-xs font-bold text-blue-500">+10 pts</span>
                        </div>

                        {/* Step 2: Convert */}
                        <div className="flex flex-col items-center group">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border-2 border-purple-100 dark:border-gray-700 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform group-hover:border-purple-500">
                                <RefreshCw size={20} className="text-purple-500 animate-spin-slow" />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase text-center">Indique Obras</span>
                            <span className="text-xs font-bold text-purple-500">+50 pts</span>
                        </div>

                        {/* Step 3: Profit */}
                        <div className="flex flex-col items-center group">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border-2 border-green-100 dark:border-gray-700 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform group-hover:border-green-500">
                                <Wallet size={20} className="text-green-500" />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase text-center">Resgate Prêmios</span>
                            <span className="text-xs font-bold text-green-500">= Dinheiro</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 bg-orange-50 dark:bg-orange-900/10 rounded-xl p-3 flex items-center gap-3">
                    <Zap className="text-orange-500 shrink-0" size={18} fill="currentColor" />
                    <p className="text-xs text-orange-800 dark:text-orange-200 font-medium leading-tight">
                        <strong>Dica:</strong> {profile.tier === 'free' ? 'Assinantes PRO ganham o dobro de pontos por indicação!' : 'Você está ganhando pontos em dobro por ser assinante!'}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Add simplistic spin animation if needed or rely on existing global css
