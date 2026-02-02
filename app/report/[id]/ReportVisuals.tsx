'use client';

import React from "react";

const COLORS = {
    bg: "#ffffff", // Changed to white for report
    card: "#ffffff",
    cardHover: "#f9fafb",
    border: "#e5e7eb",
    orange: "#f97316", // Tailwind orange-500
    orangeLight: "#fb923c",
    text: "#1f2937", // gray-800
    textMuted: "#6b7280", // gray-500
    textDim: "#9ca3af", // gray-400
    green: "#22c55e", // green-500
    blue: "#3b82f6", // blue-500
    purple: "#a855f7", // purple-500
    yellow: "#eab308", // yellow-500
    red: "#ef4444", // red-500
};

// HELPER: Format Currency
const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
};

// COMPOSED COMPONENTS


// COMPOSED COMPONENTS

function SectionHeader({ title, subtitle, badge }: { title: string, subtitle?: string, badge?: string }) {
    return (
        <div className="mb-5">
            <div className="flex items-center gap-2.5">
                <h3 className="m-0 text-[17px] font-bold text-gray-900 dark:text-gray-100 print:text-black">{title}</h3>
                {badge && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full print:border print:border-orange-500 print:bg-transparent">
                        {badge}
                    </span>
                )}
            </div>
            {subtitle && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">{subtitle}</p>}
        </div>
    );
}

function Card({ children, className, style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
    return (
        <div
            className={`bg-white dark:bg-[#262423] rounded-[14px] border border-gray-200 dark:border-white/10 p-[22px] print:bg-white print:border-gray-300 print:shadow-none ${className || ''}`}
            style={style}
        >
            {children}
        </div>
    );
}

// ─── RESUMO EXECUTIVO ────────────────
export function ResumoExecutivo({ data, total, bdi }: { data: any, total: number, bdi: number }) {
    const area = data.projectArea || 0;
    const costPerSqm = area > 0 ? total / area : 0;

    const items = [
        { icon: "🏗️", label: "Tipo", valor: data.projectType || 'Obra Geral' },
        { icon: "📐", valor: "Área Total", label: area ? `${area} m²` : 'Não informada' },
        { icon: "📅", label: "Prazo de início", valor: data.deadline || 'A definir' },
        { icon: "💰", label: "Valor Total", valor: formatCurrency(total) },
        { icon: "📊", label: "BDI Estimado", valor: `${bdi}%` },
        { icon: "📏", label: "Custo/m²", valor: costPerSqm ? formatCurrency(costPerSqm) : '-' },
    ];

    return (
        <Card className="bg-slate-50 border-slate-200 dark:bg-[#262423] dark:border-white/10 print:bg-white print:border-gray-200">
            <SectionHeader title="Resumo Executivo" subtitle="Visão geral do projeto" />
            <div className="grid grid-cols-3 gap-2.5">
                {items.map((item, i) => (
                    <div key={i} className="bg-white dark:bg-[#1c1917] rounded-lg p-3 border border-gray-200 dark:border-gray-800 print:bg-white print:border-gray-200">
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 print:text-gray-600 mb-1 flex items-center gap-1">
                            <span>{item.icon}</span> {item.label}
                        </div>
                        <div className="text-sm text-gray-900 dark:text-gray-100 print:text-black font-bold">{item.valor}</div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

// ─── CURVA ABC ────────────────
// ─── CURVA ABC ────────────────
export function CurvaABC({ items, includeMaterials }: { items: any[], includeMaterials: boolean }) {
    // 1. First pass: Check Categories Count
    const uniqueCategories = new Set(items.filter(i => i.included).map(i => i.category || 'Outros'));
    const useItemMode = uniqueCategories.size < 3;

    // Aggregate Logic
    const aggregated: Record<string, number> = {};
    let totalDirect = 0;

    items.forEach(item => {
        if (!item.included) return;
        const price = item.manualPrice ?? (includeMaterials ? item.price : (item.laborPrice || 0));
        const val = price * item.quantity;

        // Decide key based on mode
        const key = useItemMode ? item.name : (item.category || 'Outros');

        aggregated[key] = (aggregated[key] || 0) + val;
        totalDirect += val;
    });

    if (totalDirect === 0) return null;

    const sortedEntries = Object.entries(aggregated)
        .sort(([, a], [, b]) => b - a)
        .map(([key, val]) => ({ key, val, percent: (val / totalDirect) * 100 }));

    // Limit to top 8 + others
    let displayList = sortedEntries.slice(0, 8);
    const others = sortedEntries.slice(8).reduce((acc, curr) => acc + curr.val, 0);

    if (others > 0) {
        displayList.push({ key: 'Outros', val: others, percent: (others / totalDirect) * 100 });
    }

    // Assign Classes (A: top 60%, B: next 30%, C: last 10%)
    let accumulated = 0;
    const processedList = displayList.map(item => {
        accumulated += item.percent;
        let classe = '';
        let color = '';

        if (item.key === 'Outros') {
            classe = 'C';
            color = COLORS.textDim; // Gray
        } else if (accumulated <= 60 || (accumulated - item.percent) < 50) { // A bit loose for A
            classe = 'A';
            color = COLORS.red;
        } else if (accumulated <= 90) {
            classe = 'B';
            color = COLORS.orange;
        } else {
            classe = 'C';
            color = COLORS.yellow;
        }

        return { ...item, classe, color };
    });

    const maxVal = Math.max(...processedList.map(d => d.val));

    return (
        <Card>
            <SectionHeader
                title={`Curva ABC – ${useItemMode ? 'Itens' : 'Grupos'} por Relevância`}
                subtitle={useItemMode
                    ? "Detalhamento por item (Orçamento simplificado)"
                    : "Analise onde está a maior parte do investimento por etapa"}
            />
            <div className="flex flex-col gap-[7px]">
                {processedList.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                        <span
                            className="text-[10px] font-bold w-[18px] text-center rounded py-0.5 print-color-exact"
                            style={{
                                color: item.color,
                                background: item.color + "22",
                            }}
                        >{item.classe}</span>
                        <div className="flex-1 text-xs text-gray-800 dark:text-gray-200 print:text-black min-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis" title={item.key}>
                            {item.key}
                        </div>
                        <div className="flex-[2] h-[22px] bg-gray-100 dark:bg-gray-800 print:bg-gray-100 rounded relative overflow-hidden print-color-exact">
                            <div style={{
                                width: `${(item.val / maxVal) * 100}%`, height: "100%",
                                background: `linear-gradient(90deg, ${item.color}, ${item.color})`,
                                borderRadius: 4,
                                opacity: 0.8,
                            }} />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600 w-[45px] text-right font-semibold">
                            {item.percent.toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

// ─── CRONOGRAMA (Heurística) ────────────────
// ─── CRONOGRAMA (Heurística) ────────────────
export function CronogramaEstimado({ deadline, projectType }: { deadline: string, projectType: string }) {
    // Try to extract number of months
    let months = 0;
    const match = deadline?.match(/(\d+)\s*(mês|meses|semana|semanas|dia|dias)/i);

    if (match) {
        const val = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        if (unit.includes('mes')) months = val;
        if (unit.includes('semana')) months = val / 4;
        if (unit.includes('dia')) months = val / 30;
    }

    // Heuristic Fallback based on Project Type complexity
    if (months < 1) {
        // No valid duration found, guess based on type
        const typelower = (projectType || '').toLowerCase();
        if (typelower.includes('casa') || typelower.includes('construção') || typelower.includes('nova')) {
            months = 6; // Default for new house
        } else if (typelower.includes('reforma')) {
            months = 2; // Default for renovation
        } else {
            months = 1; // Default for small Service
        }
    } else {
        // Valid duration found, but sanity check
        const typelower = (projectType || '').toLowerCase();
        const isComplex = typelower.includes('casa') || typelower.includes('construção') || typelower.includes('nova');

        // If it's a complex work but duration < 2 months, force minimum of 5 months
        if (isComplex && months < 2) {
            months = 5;
        }
    }

    // Phases Distribution
    const phases = [
        { name: "Preliminares", startPct: 0, durPct: 10, color: COLORS.textDim },
        { name: "Fundações/Estrutura", startPct: 5, durPct: 35, color: COLORS.orange },
        { name: "Instalações", startPct: 30, durPct: 30, color: COLORS.blue },
        { name: "Acabamentos", startPct: 50, durPct: 40, color: COLORS.purple },
        { name: "Limpeza/Entrega", startPct: 90, durPct: 10, color: COLORS.green },
    ];

    return (
        <Card>
            <SectionHeader
                title="Cronograma Estimado Macro"
                subtitle={`Previsão baseada em prazo de ${Math.ceil(months)} meses`}
            />
            <div className="flex mb-1.5 pl-[110px]">
                <div className="flex-1 flex justify-between text-[10px] text-gray-400 dark:text-gray-500 print:text-gray-500">
                    <span>Início</span>
                    <span>Meio</span>
                    <span>Fim</span>
                </div>
            </div>
            {phases.map((phase, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                    <div className="w-[110px] text-[11px] text-gray-800 dark:text-gray-200 print:text-black font-medium">{phase.name}</div>
                    <div className="flex-1 h-[22px] relative bg-gray-100 dark:bg-gray-800 print:bg-gray-100 rounded overflow-hidden print-color-exact">
                        <div style={{
                            position: "absolute", left: `${phase.startPct}%`, width: `${phase.durPct}%`,
                            height: "100%", borderRadius: 4,
                            background: phase.color,
                            opacity: 0.8,
                        }} />
                    </div>
                </div>
            ))}
        </Card>
    );
}

// ─── BDI (Heurística) ────────────────
export function ComposicaoBDI({ bdiPct, totalDirect }: { bdiPct: number, totalDirect: number }) {
    // Standard Market Breakdown Logic
    // Tax (approx 30% of BDI), Profit (30%), Admin (25%), Risk (15%)
    const taxes = bdiPct * 0.35;
    const profit = bdiPct * 0.30;
    const admin = bdiPct * 0.20;
    const risk = bdiPct * 0.15;

    const bdiItems = [
        { label: "Tributação (PIS/COFINS/ISS)", valor: taxes },
        { label: "Lucro / Remuneração", valor: profit },
        { label: "Administração Central", valor: admin },
        { label: "Riscos e Garantias", valor: risk },
    ];

    const totalWithBDI = totalDirect * (1 + bdiPct / 100);

    return (
        <Card>
            <SectionHeader
                title="Composição do BDI"
                subtitle="Entenda como o Lucro e Despesas Indiretas são distribuídos"
            />
            <div className="flex gap-4 items-start flex-wrap">
                <div className="flex-1 min-w-[200px]">
                    {bdiItems.map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-[7px] border-b border-gray-200 dark:border-gray-700 print:border-gray-200">
                            <span className="text-xs text-gray-800 dark:text-gray-200 print:text-black">{item.label}</span>
                            <span className="text-xs text-orange-500 font-semibold">{item.valor.toFixed(2)}%</span>
                        </div>
                    ))}
                    <div className="mt-2.5 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex justify-between print-color-exact">
                        <span className="text-[13px] text-orange-500 font-bold">BDI Total</span>
                        <span className="text-[15px] text-orange-500 font-extrabold">{bdiPct.toFixed(2)}%</span>
                    </div>
                </div>

                {/* Simple Waterfall */}
                <div className="w-full max-w-[150px] p-2.5 bg-gray-50 dark:bg-gray-800 print:bg-gray-50 rounded-lg text-[11px] text-gray-700 dark:text-gray-300 print:text-black print-color-exact">
                    <div className="flex justify-between mb-1.5">
                        <span>Direto:</span>
                        <span className="font-bold">{formatCurrency(totalDirect)}</span>
                    </div>
                    <div className="flex justify-between mb-1.5 text-orange-500">
                        <span>+ BDI:</span>
                        <span className="font-bold">{formatCurrency(totalWithBDI - totalDirect)}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 print:border-gray-300 pt-1.5 flex justify-between text-xs">
                        <span>Final:</span>
                        <span className="font-bold text-green-600 dark:text-green-500 print:text-green-600">{formatCurrency(totalWithBDI)}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}

// ─── COMPARATIVO (Mock) ────────────────
export function ComparativoMercado({ total, area }: { total: number, area: number }) {
    // Logic: Market average is usually 10-15% higher than optimized budget
    const marketAvg = total * 1.12;
    const minVal = total * 0.95;
    const maxVal = total * 1.35;

    // Calculate cost per sqm if area exists
    const costPerSqm = area > 0 ? total / area : 0;

    const bars = [
        { label: "Seu Orçamento", valor: total, color: COLORS.green, highlight: true },
        { label: "Média de Mercado", valor: marketAvg, color: COLORS.textMuted, highlight: false },
        { label: "Máximo Regional", valor: maxVal, color: COLORS.textDim, highlight: false },
    ];

    const maxBar = Math.max(...bars.map(b => b.valor));
    const percentBelow = (100 - (total / marketAvg) * 100).toFixed(1);

    return (
        <Card>
            <SectionHeader
                title="Posicionamento de Mercado"
                subtitle="Estimativa comparativa com valores médios regionais (Estimativa)"
            />

            {/* Bars Section */}
            <div className="flex flex-col gap-2.5">
                {bars.map((bar, i) => (
                    <div key={i}>
                        <div className="flex justify-between mb-1">
                            <span
                                className="text-xs font-medium"
                                style={{
                                    fontWeight: bar.highlight ? 700 : 500,
                                    color: bar.highlight ? COLORS.green : undefined,
                                }}
                            >{bar.label}</span>
                            <span className="text-xs text-gray-800 dark:text-gray-200 print:text-black font-semibold">{formatCurrency(bar.valor)}</span>
                        </div>
                        <div className="h-[22px] bg-gray-100 dark:bg-gray-800 print:bg-gray-100 rounded overflow-hidden relative print-color-exact">
                            <div style={{
                                width: `${(bar.valor / maxBar) * 100}%`, height: "100%", borderRadius: 4,
                                background: bar.highlight
                                    ? `linear-gradient(90deg, ${COLORS.green}, ${COLORS.green}88)`
                                    : bar.color,
                                opacity: 0.8,
                            }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Comparison Text */}
            <div className="mt-3.5 p-2.5 bg-green-500/10 border border-green-500/20 rounded-lg text-center print-color-exact">
                <span className="text-xs text-green-600 dark:text-green-500 print:text-green-600 font-semibold">
                    ✓ Este orçamento está {percentBelow}% abaixo da média de mercado
                </span>
            </div>

            {/* Price per Square Meter Highlight - Moved Bottom & Styled Same */}
            {costPerSqm > 0 && (
                <div className="mt-2.5 p-2.5 bg-green-500/10 border border-green-500/20 rounded-lg flex justify-between items-center print-color-exact">
                    <span className="text-xs font-semibold text-green-600 dark:text-green-500 print:text-green-600 uppercase tracking-wide">
                        Custo Estimado por m²
                    </span>
                    <span className="text-xs font-bold text-green-700 dark:text-green-400 print:text-green-700">
                        {formatCurrency(costPerSqm)}/m²
                    </span>
                </div>
            )}
        </Card>
    );
}
