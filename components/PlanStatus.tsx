import Link from 'next/link';
import { Sparkles, Zap, Lock, Crown, ChevronRight, TrendingUp } from 'lucide-react';
import { SubscriptionTier, PLAN_LIMITS } from '@/lib/plan-limits';

interface PlanStatusProps {
    tier: SubscriptionTier;
    usageCount: number;
}

export function PlanStatus({ tier = 'free', usageCount }: PlanStatusProps) {
    const isFree = tier === 'free';
    const limit = PLAN_LIMITS.free.max_estimates;
    const progress = Math.min((usageCount / limit) * 100, 100);

    if (tier === 'business') {
        return (
            <div className="bg-gray-900 dark:bg-black border border-white/10 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/5">
                            <Crown size={24} className="text-white" />
                        </div>
                        <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/5 text-gray-300">
                            Empresarial
                        </span>
                    </div>

                    <h3 className="text-xl font-bold mb-1 text-white tracking-tight">Plano Empresarial</h3>
                    <p className="text-gray-400 text-sm mb-6 font-medium">
                        Sua empresa está operando com potência máxima. Acesso ilimitado e gestão ativa.
                    </p>

                    <div className="flex items-center gap-3 text-sm font-medium bg-white/5 p-3 rounded-xl border border-white/5 text-gray-300">
                        <TrendingUp size={16} />
                        <span>{usageCount} Orçamentos gerados</span>
                    </div>
                </div>
            </div>
        );
    }

    if (tier === 'pro') {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-[#1A1A1A] dark:to-[#1A1A1A] border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-125 duration-700"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                            <Zap size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="bg-blue-100/50 dark:bg-blue-900/20 px-3 py-1 rounded-full text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider border border-blue-200/50 dark:border-blue-800/30">
                            Pro Member
                        </span>
                    </div>

                    <h3 className="text-xl font-bold mb-1 text-foreground">Conta Profissional</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                        Você desbloqueou orçamentos ilimitados e remoção da marca d'água.
                    </p>

                    <div className="flex items-center gap-2 bg-background/50 dark:bg-white/5 p-3 rounded-xl border border-blue-100 dark:border-white/5 mb-2">
                        <Sparkles size={16} className="text-blue-500 dark:text-blue-400" />
                        <span className="text-sm font-medium text-foreground">{usageCount} Orçamentos criados</span>
                    </div>
                </div>
            </div>
        );
    }

    // FREE PLAN (Default)
    return (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border relative overflow-hidden group">
            {/* Progress Background Effect */}
            <div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-teal-600 to-red-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
            ></div>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-foreground">Conta Gratuita</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mt-1">
                        Nível Iniciante
                    </p>
                </div>
                <div className="relative">
                    <svg className="w-12 h-12 transform -rotate-90">
                        <circle
                            className="text-muted/20"
                            strokeWidth="4"
                            stroke="currentColor"
                            fill="transparent"
                            r="20"
                            cx="24"
                            cy="24"
                        />
                        <circle
                            className="text-teal-600 transition-all duration-1000 ease-out"
                            strokeWidth="4"
                            strokeDasharray={126}
                            strokeDashoffset={126 - (126 * progress) / 100}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="20"
                            cx="24"
                            cy="24"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                        {Math.round(progress)}%
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Orçamentos</span>
                    <span className="font-bold text-foreground">{usageCount} <span className="text-muted-foreground font-normal">/ {limit}</span></span>
                </div>

                {/* Visual Bar */}
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${progress >= 100 ? 'bg-red-500' : 'bg-teal-600'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {usageCount >= limit && (
                    <p className="text-xs text-red-500 font-medium flex items-center gap-1 animate-pulse">
                        <Lock size={12} /> Limite atingido
                    </p>
                )}
            </div>

            <Link
                href="/planos"
                className="group/btn relative w-full flex items-center justify-between bg-foreground text-background hover:bg-foreground/90 px-4 py-3 rounded-xl font-semibold text-sm transition-all overflow-hidden"
            >
                <span className="relative z-10 flex items-center gap-2">
                    <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                    Fazer Upgrade
                </span>
                <ChevronRight size={16} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />

                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
            </Link>
        </div>
    );
}
