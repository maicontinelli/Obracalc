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

function SectionHeader({ title, subtitle, badge }: { title: string, subtitle?: string, badge?: string }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: 17, color: COLORS.text, fontWeight: 700 }}>{title}</h3>
                {badge && (
                    <span style={{
                        fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
                        background: COLORS.orange + "22", color: COLORS.orange,
                        padding: "3px 8px", borderRadius: 20,
                    }}>{badge}</span>
                )}
            </div>
            {subtitle && <p style={{ margin: "4px 0 0", fontSize: 12, color: COLORS.textMuted }}>{subtitle}</p>}
        </div>
    );
}

function Card({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) {
    return (
        <div style={{
            background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.border}`,
            padding: 22, ...style
        }}>
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
        { icon: "📅", label: "Prazo", valor: data.deadline || 'A definir' },
        { icon: "💰", label: "Valor Total", valor: formatCurrency(total) },
        { icon: "📊", label: "BDI Estimado", valor: `${bdi}%` },
        { icon: "📏", label: "Custo/m²", valor: costPerSqm ? formatCurrency(costPerSqm) : '-' },
    ];

    return (
        <Card style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <SectionHeader title="Resumo Executivo" subtitle="Visão geral do projeto" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {items.map((item, i) => (
                    <div key={i} style={{
                        background: '#ffffff', borderRadius: 8, padding: "12px 14px",
                        border: `1px solid ${COLORS.border}`,
                    }}>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 3 }}>
                            {item.icon} {item.label}
                        </div>
                        <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 700 }}>{item.valor}</div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

// ─── CURVA ABC ────────────────
export function CurvaABC({ items, includeMaterials }: { items: any[], includeMaterials: boolean }) {
    // Aggregate Logic
    const categories: Record<string, number> = {};
    let totalDirect = 0;

    items.forEach(item => {
        if (!item.included) return;
        const price = item.manualPrice ?? (includeMaterials ? item.price : (item.laborPrice || 0));
        const val = price * item.quantity;
        const cat = item.category || 'Outros';

        categories[cat] = (categories[cat] || 0) + val;
        totalDirect += val;
    });

    if (totalDirect === 0) return null;

    const sortedCats = Object.entries(categories)
        .sort(([, a], [, b]) => b - a)
        .map(([cat, val]) => ({ cat, val, percent: (val / totalDirect) * 100 }));

    // Limit to top 8 + others
    let displayList = sortedCats.slice(0, 8);
    const others = sortedCats.slice(8).reduce((acc, curr) => acc + curr.val, 0);

    if (others > 0) {
        displayList.push({ cat: 'Outros', val: others, percent: (others / totalDirect) * 100 });
    }

    // Assign Classes (A: top 60%, B: next 30%, C: last 10%)
    let accumulated = 0;
    const processedList = displayList.map(item => {
        accumulated += item.percent;
        let classe = 'C';
        let color = COLORS.textDim;

        if (accumulated <= 60 || (accumulated - item.percent) < 50) { // A bit loose for A
            classe = 'A';
            color = COLORS.orange;
        } else if (accumulated <= 90) {
            classe = 'B';
            color = COLORS.yellow;
        }

        return { ...item, classe, color };
    });

    const maxVal = Math.max(...processedList.map(d => d.val));

    return (
        <Card>
            <SectionHeader
                title="Curva ABC – Itens por Relevância"
                subtitle="Analise onde está a maior parte do investimento"
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {processedList.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                            fontSize: 10, fontWeight: 700, color: item.color,
                            width: 18, textAlign: "center",
                            background: item.color + "22", borderRadius: 4, padding: "2px 0",
                        }}>{item.classe}</span>
                        <div style={{ flex: 1, fontSize: 12, color: COLORS.text, minWidth: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.cat}</div>
                        <div style={{
                            flex: 2, height: 22, background: '#f3f4f6', borderRadius: 4, overflow: "hidden", position: 'relative'
                        }}>
                            <div style={{
                                width: `${(item.val / maxVal) * 100}%`, height: "100%",
                                background: `linear-gradient(90deg, ${item.color}, ${item.color})`,
                                borderRadius: 4,
                                opacity: 0.8,
                            }} />
                        </div>
                        <span style={{ fontSize: 12, color: COLORS.textMuted, width: 45, textAlign: "right", fontWeight: 600 }}>
                            {item.percent.toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

// ─── CRONOGRAMA (Heurística) ────────────────
export function CronogramaEstimado({ deadline, projectType }: { deadline: string, projectType: string }) {
    // Try to extract number of months
    let months = 4; // Default
    const match = deadline?.match(/(\d+)\s*(mês|meses|semana|semanas|dia|dias)/i);
    if (match) {
        const val = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        if (unit.includes('mes')) months = val;
        if (unit.includes('semana')) months = val / 4;
        if (unit.includes('dia')) months = val / 30;
    }

    // Cap min valid duration
    if (months < 1) months = 1;

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
            <div style={{ display: "flex", marginBottom: 6 }}>
                <div style={{ width: 110 }} />
                <div style={{ flex: 1, display: "flex", justifyContent: 'space-between', fontSize: 10, color: COLORS.textDim }}>
                    <span>Início</span>
                    <span>Meio</span>
                    <span>Fim</span>
                </div>
            </div>
            {phases.map((phase, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 5 }}>
                    <div style={{ width: 110, fontSize: 11, color: COLORS.text, fontWeight: 500 }}>{phase.name}</div>
                    <div style={{ flex: 1, height: 22, position: "relative", background: '#f3f4f6', borderRadius: 4 }}>
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
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                    {bdiItems.map((item, i) => (
                        <div key={i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "7px 0", borderBottom: `1px solid ${COLORS.border}`,
                        }}>
                            <span style={{ fontSize: 12, color: COLORS.text }}>{item.label}</span>
                            <span style={{ fontSize: 12, color: COLORS.orange, fontWeight: 600 }}>{item.valor.toFixed(2)}%</span>
                        </div>
                    ))}
                    <div style={{
                        marginTop: 10, padding: "10px 12px", background: COLORS.orange + "15",
                        border: `1px solid ${COLORS.orange}44`, borderRadius: 8,
                        display: "flex", justifyContent: "space-between",
                    }}>
                        <span style={{ fontSize: 13, color: COLORS.orange, fontWeight: 700 }}>BDI Total</span>
                        <span style={{ fontSize: 15, color: COLORS.orange, fontWeight: 800 }}>{bdiPct.toFixed(2)}%</span>
                    </div>
                </div>

                {/* Simple Waterfall */}
                <div style={{ width: '100%', maxWidth: 150, padding: 10, background: '#f8fafc', borderRadius: 8, fontSize: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span>Direto:</span>
                        <span style={{ fontWeight: 'bold' }}>{formatCurrency(totalDirect)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, color: COLORS.orange }}>
                        <span>+ BDI:</span>
                        <span style={{ fontWeight: 'bold' }}>{formatCurrency(totalWithBDI - totalDirect)}</span>
                    </div>
                    <div style={{ borderTop: '1px solid #ddd', paddingTop: 5, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span>Final:</span>
                        <span style={{ fontWeight: 'bold', color: COLORS.green }}>{formatCurrency(totalWithBDI)}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}

// ─── COMPARATIVO (Mock) ────────────────
export function ComparativoMercado({ total }: { total: number }) {
    // Logic: Market average is usually 10-15% higher than optimized budget
    const marketAvg = total * 1.12;
    const minVal = total * 0.95;
    const maxVal = total * 1.35;

    const bars = [
        { label: "Seu Orçamento", valor: total, color: COLORS.green, highlight: true },
        { label: "Média de Mercado", valor: marketAvg, color: COLORS.textMuted, highlight: false },
        { label: "Máximo Regional", valor: maxVal, color: COLORS.textDim, highlight: false },
    ];

    const maxBar = Math.max(...bars.map(b => b.valor));

    return (
        <Card>
            <SectionHeader
                title="Posicionamento de Mercado"
                subtitle="Estimativa comparativa com valores médios regionais (Estimativa)"
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {bars.map((bar, i) => (
                    <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{
                                fontSize: 12, fontWeight: bar.highlight ? 700 : 500,
                                color: bar.highlight ? COLORS.green : COLORS.textMuted,
                            }}>{bar.label}</span>
                            <span style={{ fontSize: 12, color: COLORS.text, fontWeight: 600 }}>{formatCurrency(bar.valor)}</span>
                        </div>
                        <div style={{ height: 22, background: '#f3f4f6', borderRadius: 4, overflow: "hidden", position: 'relative' }}>
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
            <div style={{
                marginTop: 14, padding: "10px 12px", background: COLORS.green + "12",
                border: `1px solid ${COLORS.green}33`, borderRadius: 8, textAlign: "center",
            }}>
                <span style={{ fontSize: 12, color: COLORS.green, fontWeight: 600 }}>
                    ✓ Seu preço está {(100 - (total / marketAvg) * 100).toFixed(1)}% abaixo da média estimada
                </span>
            </div>
        </Card>
    );
}
