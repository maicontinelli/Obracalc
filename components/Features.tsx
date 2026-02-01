'use client';

import { Calculator, FileText, Camera, Map, ScanEye, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { cn } from "@/lib/utils";

export function Features() {
    const router = useRouter();

    const handleStartStart = () => {
        const newId = crypto.randomUUID();
        router.push(`/editor/${newId}?type=obra_nova`);
    };

    return (
        <section className="py-24 bg-gray-50 dark:bg-[#0A0A0A] relative overflow-hidden">
            {/* Background Gradient Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6 tracking-tight">
                        Fluxo completo <span className="text-[#22c55e]">inteligente</span>
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                        Do orçamento preciso ao contrato de prestação de serviço. Tudo conectado em uma única plataforma.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)] max-w-6xl mx-auto">

                    {/* Feature 1: Orçamento Inteligente (Main - Large) */}
                    <div className="md:col-span-2 md:row-span-2">
                        <div onClick={handleStartStart} className="h-full cursor-pointer group">
                            <SpotlightCard className="h-full flex flex-col justify-between p-8 md:p-10 border-neutral-200 dark:border-white/10 hover:border-primary/50 transition-colors duration-500">
                                <div className="space-y-4">
                                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                        <Calculator className="w-7 h-7 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                                        Orçamentos SINAPI
                                    </h3>
                                    <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                                        Gere orçamentos com preços oficiais da Caixa Econômica. Precisão automática para todas as etapas da obra.
                                    </p>
                                </div>

                                <div className="mt-8 flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold group-hover:gap-4 transition-all">
                                    <span>Criar orçamento agora</span>
                                    <ArrowRight className="w-5 h-5" />
                                </div>

                                {/* Decorative UI Element mockup */}
                                <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-gradient-to-tl from-green-500/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            </SpotlightCard>
                        </div>
                    </div>

                    {/* Feature 2: Diagnóstico Visual (Tall) */}
                    <div className="md:col-span-1 md:row-span-2">
                        <Link href="/novo-diagnostico" className="h-full block group">
                            <SpotlightCard className="h-full flex flex-col p-8 border-neutral-200 dark:border-white/10 hover:border-orange-500/50 transition-colors duration-500" spotlightColor="rgba(255, 102, 0, 0.2)">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                                        <ScanEye className="w-6 h-6 text-[#FF6600]" />
                                    </div>
                                    <span className="px-3 py-1 bg-orange-500/10 text-[#FF6600] text-xs font-bold rounded-full uppercase tracking-wider">Beta</span>
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-3">
                                    Diagnóstico com IA
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                                    Tire uma foto e deixe nossa IA identificar patologias e sugerir correções técnicas instantaneamente.
                                </p>

                                <div className="mt-auto relative w-full h-32 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden border border-neutral-200 dark:border-white/5 group-hover:shadow-lg transition-all">
                                    {/* Abstract Phone/Camera UI Mockup */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-[#FF6600]/50 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-[#FF6600] rounded-full animate-pulse" />
                                    </div>
                                    <div className="absolute bottom-2 left-2 right-2 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700">
                                        <div className="w-2/3 h-full bg-[#FF6600] rounded-full" />
                                    </div>
                                </div>
                            </SpotlightCard>
                        </Link>
                    </div>

                    {/* Feature 3: Relatório Fotográfico */}
                    <div className="md:col-span-1">
                        <Link href="/relatorio-fotografico" className="h-full block group">
                            <SpotlightCard className="h-full p-6 border-neutral-200 dark:border-white/10 hover:border-indigo-500/50 transition-colors duration-500" spotlightColor="rgba(99, 102, 241, 0.2)">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Camera className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">Relatório de Obra</h3>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    Documentação fotográfica profissional organizada em segundos.
                                </p>
                            </SpotlightCard>
                        </Link>
                    </div>

                    {/* Feature 4: Topografia */}
                    <div className="md:col-span-1">
                        <Link href="/topografia" className="h-full block group">
                            <SpotlightCard className="h-full p-6 border-neutral-200 dark:border-white/10 hover:border-red-500/50 transition-colors duration-500" spotlightColor="rgba(239, 68, 68, 0.2)">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Map className="w-5 h-5 text-red-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">Topografia</h3>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    Memoriais descritivos e planilhas técnicas automáticas.
                                </p>
                            </SpotlightCard>
                        </Link>
                    </div>

                    {/* Feature 5: Call to Action small */}
                    <div className="md:col-span-1">
                        <Link href="/login" className="h-full block group">
                            <SpotlightCard className="h-full p-6 flex flex-col justify-between bg-neutral-900 border-neutral-800 hover:border-violet-500/50 transition-colors" spotlightColor="rgba(139, 92, 246, 0.15)">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="px-3 py-1 bg-violet-500/10 text-violet-400 text-xs font-bold rounded-full border border-violet-500/20">
                                            PRO
                                        </div>
                                        <div className="text-violet-400">
                                            <Zap className="w-5 h-5 fill-violet-500/20" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-lg text-white">Desbloqueie tudo</h3>
                                        <p className="text-sm text-neutral-400 leading-snug">
                                            Logo e contatos ilimitados, relatórios sem marca d'água e muito mais.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-neutral-300 font-medium group-hover:text-violet-300 transition-colors">
                                    <span>Ver Planos</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </SpotlightCard>
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
