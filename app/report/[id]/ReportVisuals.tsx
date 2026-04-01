'use client';

import React from "react";

const COLORS = {
    bg: "#ffffff", // Changed to white for report
    card: "#ffffff",
    cardHover: "#f9fafb",
    border: "#e5e7eb",
    teal: "#0d9488", // teal-600
    tealLight: "#2dd4bf",
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
        <div className="mb-5 print:mb-3">
            <div className="flex items-center gap-2.5">
                <h3 className="m-0 text-[17px] font-bold text-gray-900 dark:text-gray-100 print:text-black print:text-base">{title}</h3>
                {badge && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-teal-600/20 text-teal-600 px-2 py-0.5 rounded-full print:border print:border-teal-600 print:bg-transparent">
                        {badge}
                    </span>
                )}
            </div>
            {subtitle && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 print:text-gray-600 print:text-[10px]">{subtitle}</p>}
        </div>
    );
}

function Card({ children, className, style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
    return (
        <div
            className={`bg-white dark:bg-[#262423] rounded-[14px] border border-gray-200 dark:border-white/10 p-6 print:p-4 print:bg-white print:border-gray-200 print:shadow-none ${className || ''}`}
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
        { icon: "⏳", label: "Duração", valor: data.projectDuration ? `${data.projectDuration} ${data.projectDuration === 1 ? 'mês' : 'meses'}` : 'Não informada' },
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
            color = COLORS.teal;
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

// ─── CATEGORY → PHASE MAPPING ────────────────
const CATEGORY_PHASE_MAP: { keywords: string[], phase: string, color: string }[] = [
    { keywords: ['fundaç', 'fundacao', 'terraplan', 'demoliç', 'moviment'], phase: 'Serviços Iniciais', color: COLORS.textDim },
    { keywords: ['estrutur', 'concreto', 'alvenar', 'armad'], phase: 'Estrutura / Alvenaria', color: COLORS.teal },
    { keywords: ['cobertur', 'telhad', 'impermeab'], phase: 'Cobertura', color: COLORS.blue },
    { keywords: ['elétr', 'eletr', 'luminot', 'rede lóg', 'cabeament'], phase: 'Instalações Elétricas', color: COLORS.yellow },
    { keywords: ['hidrául', 'hidraul', 'sanitár', 'esgot', 'água'], phase: 'Instalações Hidráulicas', color: COLORS.purple },
    { keywords: ['revestim', 'cerâm', 'ceram', 'piso', 'porcelan', 'argamass'], phase: 'Revestimentos', color: COLORS.green },
    { keywords: ['pintur', 'massa', 'gesso', 'drywall', 'forro'], phase: 'Acabamentos Internos', color: '#f97316' },
    { keywords: ['esquadr', 'porta', 'janela', 'vidro', 'alumín'], phase: 'Esquadrias', color: '#8b5cf6' },
    { keywords: ['limpez', 'entrega', 'final'], phase: 'Limpeza / Entrega', color: COLORS.textMuted },
];

// ─── CRONOGRAMA (Real item weights) ────────────────
export function CronogramaEstimado({ deadline, projectType, projectDuration, total, items }: {
    deadline: string, projectType: string, projectDuration?: number, total?: number, items?: any[]
}) {
    // Try to extract number of months
    let months = projectDuration || 0;

    if (!months) {
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
            const typelower = (projectType || '').toLowerCase();
            if (typelower.includes('casa') || typelower.includes('construção') || typelower.includes('nova')) {
                months = 6;
            } else if (typelower.includes('reforma')) {
                months = 2;
            } else {
                months = 1;
            }
        } else {
            const typelower = (projectType || '').toLowerCase();
            const isComplex = typelower.includes('casa') || typelower.includes('construção') || typelower.includes('nova');

            if (isComplex && months < 2) {
                months = 5;
            }
        }
    }

    // Build phase → value map from real items
    const phaseValues: Record<string, number> = {};
    let totalFromItems = 0;

    if (items && items.length > 0) {
        items.filter(i => i.included).forEach(item => {
            const cat = (item.category || item.name || '').toLowerCase();
            const price = (item.manualPrice ?? item.price ?? 0) * (item.quantity ?? 1);

            let matched = false;
            for (const mapping of CATEGORY_PHASE_MAP) {
                if (mapping.keywords.some(kw => cat.includes(kw))) {
                    phaseValues[mapping.phase] = (phaseValues[mapping.phase] || 0) + price;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                phaseValues['Outros Serviços'] = (phaseValues['Outros Serviços'] || 0) + price;
            }
            totalFromItems += price;
        });
    }

    const hasRealData = totalFromItems > 0 && Object.keys(phaseValues).length >= 2;

    let phases: { name: string, weight: number, color: string }[];

    if (hasRealData) {
        // Sort by value descending, assign sequential timeline positions
        const sorted = Object.entries(phaseValues)
            .filter(([name]) => name !== 'Outros Serviços')
            .sort(([, a], [, b]) => b - a)
            .map(([name, val]) => {
                const mapped = CATEGORY_PHASE_MAP.find(m => m.phase === name);
                return {
                    name,
                    weight: val / totalFromItems,
                    color: mapped?.color || COLORS.textDim,
                };
            });
        // Add "Outros Serviços" at the end if it exists
        if (phaseValues['Outros Serviços']) {
            sorted.push({
                name: 'Outros Serviços',
                weight: phaseValues['Outros Serviços'] / totalFromItems,
                color: COLORS.textMuted,
            });
        }
        phases = sorted;
    } else {
        // Heuristic fallback
        phases = [
            { name: 'Serviços Iniciais', weight: 0.05, color: COLORS.textDim },
            { name: 'Estrutura / Alvenaria', weight: 0.35, color: COLORS.teal },
            { name: 'Instalações', weight: 0.20, color: COLORS.blue },
            { name: 'Acabamentos', weight: 0.35, color: COLORS.purple },
            { name: 'Limpeza / Entrega', weight: 0.05, color: COLORS.green },
        ];
    }

    // Assign timeline positions sequentially
    let cursor = 0;
    const phasesWithTime = phases.map(p => {
        const start = cursor;
        const end = cursor + p.weight;
        cursor = end;
        return { ...p, startPct: start * 100, endPct: end * 100 };
    });

    const totalC = total || totalFromItems;
    const nMonths = Math.max(1, Math.ceil(months));

    const monthlyData = Array.from({ length: nMonths }, (_, i) => {
        const monthStart = (i / nMonths) * 100;
        const monthEnd = ((i + 1) / nMonths) * 100;
        let value = 0;
        phasesWithTime.forEach(phase => {
            const overlap = Math.max(0, Math.min(monthEnd, phase.endPct) - Math.max(monthStart, phase.startPct));
            const phaseDuration = phase.endPct - phase.startPct;
            if (phaseDuration > 0 && overlap > 0) {
                value += (overlap / phaseDuration) * phase.weight * totalC;
            }
        });
        return { month: i + 1, value };
    });

    return (
        <Card>
            <SectionHeader
                title="Cronograma Físico-Financeiro"
                subtitle={`Projeção de desembolso para obra de ${nMonths} ${nMonths === 1 ? 'mês' : 'meses'}`}
            />

            {/* Visual Timeline Bars */}
            <div className="space-y-3 mb-6">
                {phasesWithTime.map((phase, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="w-[130px] text-[10px] text-gray-600 dark:text-gray-400 font-bold uppercase tracking-tight truncate">{phase.name}</div>
                        <div className="flex-1 h-3.5 relative bg-gray-100 dark:bg-gray-800/50 rounded-full overflow-hidden print:border print:border-gray-200">
                            <div style={{
                                position: 'absolute',
                                left: `${phase.startPct}%`,
                                width: `${phase.endPct - phase.startPct}%`,
                                height: '100%',
                                borderRadius: 99,
                                background: phase.color,
                                opacity: 0.85,
                            }} />
                        </div>
                        <span className="text-[10px] text-gray-400 w-10 text-right">{(phase.weight * 100).toFixed(0)}%</span>
                    </div>
                ))}
            </div>

            {/* Scale Area with Financial Values */}
            <div className="pl-[130px]">
                <div className="relative h-10 border-t border-gray-200 dark:border-gray-700">
                    {/* Vertical Grid Lines for Months */}
                    {Array.from({ length: nMonths + 1 }).map((_, i) => (
                        <div key={i} className="absolute h-[155px] -top-[145px] border-l border-dashed border-gray-200 dark:border-gray-800/50 pointer-events-none"
                            style={{ left: `${(i / nMonths) * 100}%` }} />
                    ))}

                    {/* Financial Values as Markers */}
                    {monthlyData.map((m, i) => (
                        <div key={i} className="absolute border-l border-gray-200 dark:border-gray-700 pl-1.5 pt-1"
                            style={{
                                left: `${((m.month - 1) / nMonths) * 100}%`,
                                transform: 'translateX(0)',
                                minWidth: '70px'
                            }}>
                            <div className="text-[9px] font-bold text-gray-500 dark:text-gray-400 leading-none mb-0.5">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(m.value)}
                            </div>
                            <div className="text-[7px] font-medium text-gray-400 dark:text-gray-500/60 uppercase tracking-tighter">
                                Mês {m.month}
                            </div>
                        </div>
                    ))}

                    {/* Final marker for Completion */}
                    <div className="absolute right-0 top-0 transform translate-x-1/2">
                        <div className="w-px h-1.5 bg-gray-300 dark:bg-gray-600 mx-auto" />
                        <div className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Fim</div>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Projetado para {nMonths} Meses</span>
                </div>
                <span className="text-base font-black text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalC)}
                </span>
            </div>

            {hasRealData && (
                <p className="text-[9px] text-teal-600 mt-2">✓ Distribuição baseada nos itens reais do orçamento</p>
            )}
        </Card>
    );
}

// ─── BDI (TCU Acórdão 2622/2013) ────────────────
// TCU recommended BDI ranges for civil construction
const TCU_BDI_RANGE = { min: 19.65, max: 26.52 }; // civil construction services

export function ComposicaoBDI({ bdiPct, totalDirect }: { bdiPct: number, totalDirect: number }) {
    // Dynamic proportions based on TCU decomposition:
    // Taxes: PIS 0.65%, COFINS 3%, ISS 3-5%, CPRB varies → typically 7-10% of BDI total
    // Admin: 5-8% overhead
    // Risk/contingency: 2-3%
    // Profit: remainder
    const taxPct = Math.min(bdiPct * 0.40, 10.5); // Cap at realistic ISS+PIS+COFINS range
    const adminPct = Math.min(bdiPct * 0.25, 6.0);
    const riskPct = Math.min(bdiPct * 0.12, 3.0);
    const profitPct = Math.max(0, bdiPct - taxPct - adminPct - riskPct);

    const bdiItems = [
        { label: "Tributação (PIS/COFINS/ISS)", valor: taxPct },
        { label: "Lucro / Remuneração", valor: profitPct },
        { label: "Administração Central", valor: adminPct },
        { label: "Riscos e Garantias", valor: riskPct },
    ];

    const totalWithBDI = totalDirect * (1 + bdiPct / 100);

    const inTCURange = bdiPct >= TCU_BDI_RANGE.min && bdiPct <= TCU_BDI_RANGE.max;
    const bdiStatus = bdiPct < TCU_BDI_RANGE.min
        ? { text: 'Abaixo da faixa TCU — verificar adequação', color: 'text-orange-500' }
        : bdiPct > TCU_BDI_RANGE.max
        ? { text: 'Acima da faixa TCU — justificativa recomendada', color: 'text-red-500' }
        : { text: `Dentro da faixa TCU (${TCU_BDI_RANGE.min}%–${TCU_BDI_RANGE.max}%)`, color: 'text-green-600' };

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
                            <span className="text-xs text-teal-600 font-semibold">{item.valor.toFixed(2)}%</span>
                        </div>
                    ))}
                    <div className="mt-2.5 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">BDI Total</span>
                        <span className="text-sm font-black text-teal-600">{bdiPct.toFixed(2)}%</span>
                    </div>
                    {/* TCU status badge */}
                    <div className={`mt-2 text-[10px] font-semibold ${bdiStatus.color}`}>
                        {inTCURange ? '✓' : '⚠'} {bdiStatus.text}
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1">Ref.: TCU Acórdão 2622/2013 · Obras civis</p>
                </div>

                {/* Simple Waterfall */}
                <div className="w-full max-w-[150px] p-2.5 bg-gray-50 dark:bg-gray-800 print:bg-gray-50 rounded-lg text-[11px] text-gray-700 dark:text-gray-300 print:text-black print-color-exact">
                    <div className="flex justify-between mb-1.5">
                        <span>Direto:</span>
                        <span className="font-bold">{formatCurrency(totalDirect)}</span>
                    </div>
                    <div className="flex justify-between mb-1.5 text-teal-600">
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

// ─── COMPARATIVO (CUB-based) ────────────────
type CubEntry = { low: number, mid: number, high: number, label: string };

const CUB_TABLE: Record<string, CubEntry> = {
    residencial:   { low: 1_750, mid: 2_450, high: 3_850, label: 'Residencial' },
    multifamiliar: { low: 2_100, mid: 2_900, high: 4_200, label: 'Multifamiliar' },
    comercial:     { low: 2_200, mid: 3_100, high: 4_800, label: 'Comercial' },
    industrial:    { low: 1_200, mid: 1_750, high: 2_600, label: 'Industrial' },
    reforma:       { low:   650, mid: 1_300, high: 2_200, label: 'Reforma' },
    galpao:        { low:   950, mid: 1_400, high: 2_100, label: 'Galpão' },
};

function detectCubCategory(type: string): CubEntry {
    const t = (type || '').toLowerCase();
    if (t.includes('reform') || t.includes('revitaliz') || t.includes('ampli')) return CUB_TABLE.reforma;
    if (t.includes('galpão') || t.includes('galpao') || t.includes('armazém') || t.includes('industrial')) return CUB_TABLE.industrial;
    if (t.includes('comercial') || t.includes('loja') || t.includes('escritório') || t.includes('sala')) return CUB_TABLE.comercial;
    if (t.includes('multi') || t.includes('apartamento') || t.includes('edifíc') || t.includes('prédio')) return CUB_TABLE.multifamiliar;
    return CUB_TABLE.residencial; // default
}

export function ComparativoMercado({ total, area, projectType, id }: {
    total: number, area: number, projectType?: string, id?: string
}) {
    const cub = detectCubCategory(projectType || '');
    const costPerSqm = area > 0 ? total / area : 0;

    const hasSqm = area > 0 && costPerSqm > 0;

    // Position on spectrum (0–1, where 0 = at/below low, 1 = at/above high)
    const position = hasSqm
        ? Math.max(0, Math.min(1, (costPerSqm - cub.low) / (cub.high - cub.low)))
        : null;

    const getStatus = (pos: number | null) => {
        if (pos === null) return null;
        if (pos < 0.33) return { text: 'Abaixo da média de mercado', color: 'text-green-600', icon: '✓' };
        if (pos < 0.66) return { text: 'Dentro da média de mercado', color: 'text-blue-600', icon: '●' };
        return { text: 'Acima da média de mercado', color: 'text-orange-500', icon: '▲' };
    };

    const status = getStatus(position);

    return (
        <Card>
            <SectionHeader
                title="Posicionamento de Mercado"
                subtitle="Comparativo com referências CUB SINDUSCON"
            />

            {/* Cost per sqm highlight */}
            {hasSqm && (
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-800/50">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        Custo por m²
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-green-600 dark:text-green-500 print:text-green-600">
                            {formatCurrency(costPerSqm)}/m²
                        </span>
                        {status && (
                            <span className={`text-[10px] font-semibold ${status.color}`}>
                                {status.icon} {status.text}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Spectrum gauge when area is available */}
            {hasSqm ? (
                <div className="mt-2">
                    <div className="flex justify-between text-[9px] text-gray-400 mb-1">
                        <span>Econômico</span>
                        <span>Padrão</span>
                        <span>Premium</span>
                    </div>
                    <div className="relative h-5 bg-gradient-to-r from-green-200 via-blue-200 to-orange-200 dark:from-green-900/30 dark:via-blue-900/30 dark:to-orange-900/30 rounded-full overflow-visible mb-1">
                        {/* Reference ticks */}
                        {[0, 0.5, 1].map((pos, i) => (
                            <div key={i} className="absolute top-0 bottom-0 w-px bg-white/60 dark:bg-black/30" style={{ left: `${pos * 100}%` }} />
                        ))}
                        {/* User's position marker */}
                        {position !== null && (
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-teal-600 shadow-lg z-10 -translate-x-1/2"
                                style={{ left: `${Math.max(5, Math.min(95, position * 100))}%` }}
                            />
                        )}
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-500">
                        <span>{formatCurrency(cub.low)}/m²</span>
                        <span>{formatCurrency(cub.mid)}/m²</span>
                        <span>{formatCurrency(cub.high)}/m²</span>
                    </div>
                </div>
            ) : (
                /* Fallback: compare total vs estimated market range */
                <div className="flex flex-col gap-2.5 mt-2">
                    {[
                        { label: 'Seu Orçamento', valor: total, color: COLORS.green, highlight: true },
                        { label: `Referência CUB ${cub.label} — Padrão`, valor: cub.mid * (total / cub.mid), color: COLORS.textMuted, highlight: false },
                        { label: `Referência CUB ${cub.label} — Premium`, valor: cub.high * (total / cub.mid), color: COLORS.textDim, highlight: false },
                    ].map((bar, i) => {
                        const maxBar = cub.high * (total / cub.mid);
                        return (
                            <div key={i}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs font-medium" style={{ fontWeight: bar.highlight ? 700 : 500, color: bar.highlight ? COLORS.green : undefined }}>{bar.label}</span>
                                    <span className="text-xs text-gray-800 dark:text-gray-200 print:text-black font-semibold">{formatCurrency(bar.valor)}</span>
                                </div>
                                <div className="h-[22px] bg-gray-100 dark:bg-gray-800 print:bg-gray-100 rounded overflow-hidden relative print-color-exact">
                                    <div style={{
                                        width: `${(bar.valor / maxBar) * 100}%`, height: '100%', borderRadius: 4,
                                        background: bar.highlight ? `linear-gradient(90deg, ${COLORS.green}, ${COLORS.green}88)` : bar.color,
                                        opacity: 0.8,
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                    <p className="text-[9px] text-gray-400 mt-1">Área não informada — informe a área do projeto para comparação precisa por m²</p>
                </div>
            )}

            <p className="text-[9px] text-gray-400 mt-3">Base: CUB {cub.label} SINDUSCON 2025 · Valores de referência nacional</p>
        </Card>
    );
}
