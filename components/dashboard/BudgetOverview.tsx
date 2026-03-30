'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, DollarSign, Briefcase, Calculator } from 'lucide-react';

interface Budget {
    id: string;
    title: string;
    updated_at: string;
    content: any;
}

interface BudgetOverviewProps {
    budgets: Budget[];
}

export function BudgetOverview({ budgets }: BudgetOverviewProps) {
    const data = useMemo(() => {
        if (!budgets.length) return [];

        // Sort by date (oldest first for chart)
        const sorted = [...budgets].sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());

        return sorted.map(b => {
            const total = b.content?.items?.filter((i: any) => i.included).reduce((sum: number, item: any) => sum + ((item.manualPrice ?? item.price) * item.quantity), 0) * (1 + (b.content?.bdi || 0) / 100) || 0;
            const material = b.content?.items?.filter((i: any) => i.included && i.type === 'material').reduce((sum: number, item: any) => sum + ((item.manualPrice ?? item.price) * item.quantity), 0) || 0;
            const labor = b.content?.items?.filter((i: any) => i.included && i.type === 'service').reduce((sum: number, item: any) => sum + ((item.manualPrice ?? item.price) * item.quantity), 0) || 0;

            return {
                name: b.content?.clientName || b.title || 'Sem nome',
                date: new Date(b.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                total,
                material,
                labor
            };
        });
    }, [budgets]);

    const stats = useMemo(() => {
        if (!data.length) return { avg: 0, max: 0, materialPct: 0 };
        const totalVal = data.reduce((acc, curr) => acc + curr.total, 0);
        const totalMat = data.reduce((acc, curr) => acc + curr.material, 0);
        return {
            avg: totalVal / data.length,
            max: Math.max(...data.map(d => d.total)),
            materialPct: (totalMat / totalVal) * 100
        };
    }, [data]);

    if (!budgets.length) return null;

    return (
        <div className="bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/40 dark:border-white/5 w-full relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Key Stats */}
                <div className="lg:col-span-1 flex flex-col justify-between space-y-6">
                    <div>
                        <h3 className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                            <TrendingUp size={16} className="text-primary" />
                            Insights da Carteira
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5">
                                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Ticket Médio</p>
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30">
                                        <DollarSign size={14} />
                                    </div>
                                    <span className="text-xl font-bold">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.avg)}
                                    </span>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>

                {/* Right: Chart */}
                <div className="lg:col-span-2 min-h-[200px] relative">
                    <h4 className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-4 absolute top-0 left-0 z-10">
                        Evolução dos Orçamentos
                    </h4>
                    <div className="h-[200px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        color: '#333'
                                    }}
                                    itemStyle={{ color: '#333', fontWeight: 'bold' }}
                                    formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))}
                                    labelStyle={{ color: '#666', marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#0D9488"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
