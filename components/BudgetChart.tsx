'use client';

import { useMemo, useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    ResponsiveContainer,
    Tooltip,
    CartesianGrid
} from 'recharts';

interface BudgetChartProps {
    budgets: any[];
}

export function BudgetChart({ budgets }: BudgetChartProps) {
    const [period, setPeriod] = useState(14); // Default 14 days

    const chartData = useMemo(() => {
        // 1. Create a map of existing data
        const dataMap = budgets.reduce((acc: any, budget: any) => {
            const date = new Date(budget.updated_at);
            const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD for consistency

            // Calculate Total
            const totalValue = budget.content?.items?.filter((i: any) => i.included).reduce((sum: number, item: any) => {
                return sum + ((item.manualPrice ?? item.price) * item.quantity);
            }, 0) * (1 + (budget.content?.bdi || 0) / 100) || 0;

            if (!acc[dateKey]) {
                acc[dateKey] = 0;
            }
            acc[dateKey] += totalValue;
            return acc;
        }, {});

        // 2. Generate the last N days continuously
        const result = [];
        const today = new Date();

        for (let i = period - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const dateLabel = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

            result.push({
                date: dateLabel,
                fullDate: key,
                value: dataMap[key] || 0 // Fill gaps with 0
            });
        }
        return result;
    }, [budgets, period]);

    // Custom "Balloon" Label using Recharts' Label or simply relying on Tooltip
    // For Area charts, Tooltips are cleaner. Let's keep the tooltip logic focused.

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Fluxo de Orçamentos</h3>
                    <p className="text-xs text-gray-400">Valor total aprovado nos últimos dias</p>
                </div>
                {/* Simple Period Selector */}
                <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                    {[7, 14, 30].map((d) => (
                        <button
                            key={d}
                            onClick={() => setPeriod(d)}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${period === d ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {d} dias
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 10 }}
                            dy={10}
                            minTickGap={30} // Prevent overlap
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-gray-900/90 backdrop-blur text-white text-xs p-3 rounded-lg shadow-xl border border-white/10">
                                            <p className="font-bold opacity-50 mb-1">{label}</p>
                                            <p className="text-lg font-bold">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(payload[0].value))}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#f97316"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#0D9488' }}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
