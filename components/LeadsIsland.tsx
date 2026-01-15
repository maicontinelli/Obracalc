'use client';

import { useState } from 'react';
import { Users, DollarSign, Share2, Briefcase, ChevronRight, Lock, Eye, AlertCircle, CheckCircle, Wallet } from 'lucide-react';
import Link from 'next/link';

interface LeadsIslandProps {
    tier: 'free' | 'pro' | 'business';
    budgetsCount: number;
    points: number;
}

export function LeadsIsland({ tier, budgetsCount, points }: LeadsIslandProps) {
    const [activeTab, setActiveTab] = useState<'indicate' | 'capture'>('capture');

    // Logic: Pro users get their subscription value back as credits
    const subscriptionValue = tier === 'pro' ? 29.90 : tier === 'business' ? 149.90 : 0;
    const credits = subscriptionValue;

    // Visual Mock Data for MVP behavior visualization
    const potentialCommission = budgetsCount * 1500 * 0.05; // 5% de R$ 1500 ticket medio
    const leadsNearby = 12;

    const commissionRate = "5%";

    return (
        <div className="bg-card dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-border dark:border-white/10 overflow-hidden flex flex-col h-full">
            {/* Header Tabs */}
            <div className="flex border-b border-border dark:border-white/10">
                <button
                    onClick={() => setActiveTab('capture')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'capture'
                        ? 'bg-card dark:bg-[#1A1A1A] text-primary border-b-2 border-primary'
                        : 'bg-muted/30 dark:bg-black/20 text-muted-foreground hover:bg-muted/50 dark:hover:bg-white/5'
                        }`}
                >
                    <Briefcase size={14} />
                    Buscar Obras
                </button>
                <button
                    onClick={() => setActiveTab('indicate')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'indicate'
                        ? 'bg-card dark:bg-[#1A1A1A] text-primary border-b-2 border-primary'
                        : 'bg-muted/30 dark:bg-black/20 text-muted-foreground hover:bg-muted/50 dark:hover:bg-white/5'
                        }`}
                >
                    <Share2 size={14} />
                    Meus Leads
                </button>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-grow flex flex-col">

                {/* --- TAB: CAPTURE (Marketplace) --- */}
                {activeTab === 'capture' && (
                    <div className="flex flex-col h-full">
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-foreground mb-1">Encontrar Oportunidades</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Use seus pontos para desbloquear contatos.
                            </p>
                        </div>

                        {/* ObraPoints Card */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-4 flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <Users size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Meus Pontos</span>
                                <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
                                    {points} <span className="text-sm font-bold text-indigo-600/60 dark:text-indigo-400/60">pts</span>
                                </div>
                                <div className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 font-medium">
                                    Renova mensalmente
                                </div>
                            </div>
                        </div>

                        <div className="relative flex-grow bg-muted/30 dark:bg-black/20 rounded-xl border border-dashed border-border dark:border-white/10 p-4 flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Briefcase size={24} />
                            </div>
                            <h4 className="text-lg font-bold text-foreground">{leadsNearby}</h4>
                            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Obras na Região</span>

                            {tier === 'free' && (
                                <div className="absolute inset-0 bg-background/60 dark:bg-[#1A1A1A]/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 rounded-xl">
                                    <Lock size={20} className="text-muted-foreground mb-2" />
                                    <span className="text-xs font-bold text-muted-foreground text-center">Exclusivo para Assinantes</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 space-y-2">
                            {tier === 'free' ? (
                                <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
                                    <AlertCircle size={12} className="shrink-0 mt-0.5" />
                                    <p>Assine e ganhe pontos todo mês para contatar clientes reais.</p>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
                                    <CheckCircle size={12} className="shrink-0 mt-0.5 text-green-500" />
                                    <p>Sua assinatura garante <strong>{tier === 'pro' ? 300 : 1500} pts</strong> mensais.</p>
                                </div>
                            )}

                            {tier === 'business' || tier === 'pro' ? (
                                <Link href="/marketplace" className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                                    Acessar Marketplace <ChevronRight size={14} />
                                </Link>
                            ) : (
                                <Link href="/planos" className="w-full py-2 bg-orange-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
                                    Desbloquear Acesso <Lock size={12} />
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TAB: INDICATE (My Wallet/Earnings) --- */}
                {activeTab === 'indicate' && (
                    <div className="flex flex-col h-full">
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-foreground mb-1">Seus Ganhos</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Rentabilize seus orçamentos. Acompanhe seus ganhos aqui.
                            </p>
                        </div>

                        {/* Wallet Balance Card - Visual Only for now */}
                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl p-4 flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                                <Wallet size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">Saldo em Carteira</span>
                                <div className="text-2xl font-black text-green-700 dark:text-green-300">
                                    R$ 0,00
                                </div>
                                <div className="text-[10px] text-green-600/80 dark:text-green-400/80 font-medium">
                                    Disponível para abater fatura
                                </div>
                            </div>
                        </div>

                        {/* Status List */}
                        <div className="space-y-3 flex-grow">
                            <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">Performance do Mês</h4>
                            <div className="flex justify-between items-center text-xs p-2 hover:bg-muted/50 rounded-lg cursor-pointer group">
                                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span>Orçamentos Enviados</span>
                                </div>
                                <span className="font-bold">{budgetsCount}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs p-2 hover:bg-muted/50 rounded-lg cursor-pointer group">
                                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    <span>Leads Vendidos</span>
                                </div>
                                <span className="font-bold">0</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border dark:border-white/10">
                            {tier === 'free' ? (
                                <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-900/30">
                                    <div className="flex gap-2">
                                        <Lock size={14} className="text-orange-600 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-orange-800 dark:text-orange-200 leading-relaxed">
                                            Assinantes Pro ganham comissão em saldo real por leads gerados.
                                        </p>
                                    </div>
                                    <Link href="/planos" className="block mt-2 text-center text-[10px] font-bold text-orange-600 uppercase hover:underline">
                                        Fazer Upgrade e Lucrar
                                    </Link>
                                </div>
                            ) : (
                                <button className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-colors">
                                    Configurar Conta de Recebimento
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Add some fake Tailwind class to force new compilation if needed, though 'use client' handles it.
// Styles: Minimalist, clean, using existing design system tokens.
