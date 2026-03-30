'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Printer, Cloud, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DiagnosticoData {
    id: string;
    image: string;
    formData: {
        objetivo: string;
        padrao: string;
        instalacoes: string;
        ocupacao: string;
        area: string;
        observacoes?: string;
    };
    resultado: {
        analise_geral: {
            ambiente_identificado: string;
            area_estimada_m2: number;
            complexidade_obra: string;
        };
        grupos_servicos: Array<{
            id_grupo: number;
            quadrante_foco: number; // 1-9
            titulo_amigavel: string;
            diagnostico_visual?: string;
            itens: Array<{
                servico: string;
                quantidade: number;
                unidade: string;
                material_sugerido?: string;
                preco_unitario: number;
                preco_total: number;
            }>;
        }>;
    };
    createdAt: string;
}

// Mapeamento quadrante → posição CSS (com transform para centralização perfeita)
const getQuadrantePosition = (quadrante: number): { top: string; left: string; transform: string } => {
    const posicoes: Record<number, { top: string; left: string; transform: string }> = {
        1: { top: '15%', left: '15%', transform: 'translate(-50%, -50%)' },
        2: { top: '15%', left: '50%', transform: 'translate(-50%, -50%)' },
        3: { top: '15%', left: '85%', transform: 'translate(-50%, -50%)' },
        4: { top: '50%', left: '15%', transform: 'translate(-50%, -50%)' },
        5: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
        6: { top: '50%', left: '85%', transform: 'translate(-50%, -50%)' },
        7: { top: '85%', left: '15%', transform: 'translate(-50%, -50%)' },
        8: { top: '85%', left: '50%', transform: 'translate(-50%, -50%)' },
        9: { top: '85%', left: '85%', transform: 'translate(-50%, -50%)' }
    };
    return posicoes[quadrante] || { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
};

// Anti-sobreposição: Ajusta posição se houver colisão
const getAdjustedPosition = (
    quadrante: number,
    index: number,
    totalInQuadrant: number
): { top: string; left: string; transform: string } => {
    const base = getQuadrantePosition(quadrante);

    // Se houver apenas 1 pin neste quadrante, use posição padrão
    if (totalInQuadrant === 1) return base;

    // Se houver 2 ou mais, deslocar levemente (offset em círculo)
    const angle = (index * 360) / totalInQuadrant;
    const offsetX = Math.cos((angle * Math.PI) / 180) * 25; // 25px de raio
    const offsetY = Math.sin((angle * Math.PI) / 180) * 25;

    return {
        ...base,
        transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`
    };
};

export default function EditorDiagnostico({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [data, setData] = useState<DiagnosticoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedGrupo, setSelectedGrupo] = useState<number | null>(null);
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }, [supabase]);

    useEffect(() => {
        const saved = localStorage.getItem(`diagnostic_${id}`);
        if (saved) {
            setData(JSON.parse(saved));
        }
        setLoading(false);
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando diagnóstico...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-xl mb-6 text-gray-800">Diagnóstico não encontrado</p>
                    <button onClick={() => router.push('/')} className="px-4 py-2 bg-teal-600 text-white rounded-lg">
                        Voltar para Home
                    </button>
                </div>
            </div>
        );
    }

    const { resultado, image, formData } = data;
    const totalGeral = resultado.grupos_servicos.reduce(
        (sum, grupo) => sum + grupo.itens.reduce((s, item) => s + item.preco_total, 0),
        0
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 print:bg-white print:min-h-0 print:h-auto font-inter">
            <style jsx global>{`
                @media print {
                    @page { 
                        margin: 7mm;
                        size: A4;
                    }
                    :root {
                        color-scheme: light;
                    }
                    body { 
                        margin: 0; 
                        background-color: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    nav, .no-print, footer, .footer { 
                        display: none !important; 
                    }
                    .print-content { 
                        box-shadow: none !important; 
                        background-color: white !important;
                        color: black !important;
                        max-width: 100% !important;
                        width: 100% !important;
                        padding: 0 !important;
                    }

                    /* Force all backgrounds to white/light for print */
                    .bg-gray-50, .bg-gray-100, .bg-gray-800, .bg-gray-900, .dark\\:bg-gray-800, .dark\\:bg-gray-900 {
                        background-color: white !important;
                        border-color: #e5e7eb !important; /* gray-200 */
                    }

                    /* Header Specifics - Force Dark BG for Header, White Text */
                    .bg-\\[\\#374151\\], .dark\\:bg-\\[\\#374151\\] {
                        background-color: #374151 !important;
                        color: white !important;
                    }
                    .bg-\\[\\#374151\\] *, .invoice-header * {
                        color: white !important;
                    }

                    /* Force all other text to black/dark gray */
                    div:not(.bg-\\[\\#374151\\] *), 
                    span:not(.bg-\\[\\#374151\\] *), 
                    p, h2, h3, h4, h5, h6,
                    .text-gray-900, .dark\\:text-white, .dark\\:text-gray-200, .dark\\:text-gray-300 {
                        color: #111827 !important; /* gray-900 */
                    }

                    /* Keep subtle texts subtle but visible */
                    .text-gray-400, .text-gray-500, .dark\\:text-gray-400, .dark\\:text-gray-500 {
                        color: #6b7280 !important; /* gray-500 */
                    }

                    /* Exceptions (Green total, Blue suggestion) */
                    .text-green-600 { color: #16a34a !important; }
                    .text-blue-600 { color: #2563eb !important; }
                    .text-teal-600, .text-teal-700 { color: #ea580c !important; }

                    /* Borders */
                    .border, .border-b, .border-t, .border-l, .border-r {
                        border-color: #e5e7eb !important;
                    }

                    /* Watermark */
                    .watermark {
                        display: block !important;
                        position: fixed;
                        bottom: 10px;
                        left: 0;
                        width: 100%;
                        text-align: center;
                        color: #9ca3af;
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    
                    /* Hide buttons */
                    button { display: none !important; }
                }
            `}</style>

            {/* Toolbar - No Print */}
            <div className="no-print bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50">
                <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center gap-4">
                    <button
                        onClick={() => router.push('/novo-diagnostico')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                    >
                        <ArrowLeft size={18} /> Novo Diagnóstico
                    </button>

                    <div className="flex gap-3">
                        {!user && (
                            <>
                                <button
                                    onClick={() => router.push('/login')}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm hidden sm:flex"
                                >
                                    <Cloud size={18} /> Salvar na Nuvem
                                </button>
                            </>
                        )}
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm"
                        >
                            <Printer size={18} /> Gerar PDF / Imprimir
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1000px] mx-auto p-4 lg:p-8 print-content">

                {/* Header Style ReportClient */}
                <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden print:border print:shadow-none print:rounded-xl user-select-none">
                    <div className="bg-[#374151] text-white px-6 py-4 flex justify-between items-center print:bg-[#374151] print:text-white">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo-test.webp"
                                alt="Logo"
                                className="h-8 w-auto"
                            />
                            <div>
                                <div className="text-xl font-semibold tracking-tight leading-none text-white">ObraPlana</div>
                                <div className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-green-300 font-bold tracking-wide uppercase mt-0.5 leading-none">Inteligência Artificial</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <h1 className="text-2xl font-medium tracking-wide uppercase opacity-100 mb-0.5 text-white">Relatório Visual</h1>
                            <p className="text-xs text-gray-300 font-mono tracking-wide uppercase">#{id.slice(0, 8)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Dados da Análise */}
                        <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 print:bg-gray-50">
                            <div className="mb-3 pb-1 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Dados da Análise</h3>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <div className="text-[9px] font-medium text-gray-400 uppercase mb-0.5 leading-none">Ambiente Detectado</div>
                                    <div className="text-gray-900 dark:text-white font-normal text-sm leading-tight">{resultado.analise_geral.ambiente_identificado}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[9px] font-medium text-gray-400 uppercase mb-0.5 leading-none">Complexidade</div>
                                        <div className="text-gray-800 dark:text-gray-200 font-normal text-sm leading-none">{resultado.analise_geral.complexidade_obra}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-medium text-gray-400 uppercase mb-0.5 leading-none">Área Estimada</div>
                                        <div className="text-gray-800 dark:text-gray-200 font-normal text-sm leading-none">{resultado.analise_geral.area_estimada_m2} m²</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Parâmetros Selecionados */}
                        <div className="p-5 bg-white dark:bg-gray-800 print:bg-white">
                            <div className="mb-3 pb-1 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">Parâmetros do Cliente</h3>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <div className="text-[9px] font-medium text-gray-400 uppercase mb-0.5 leading-none">Objetivo</div>
                                    <div className="text-gray-900 dark:text-white font-normal text-sm leading-tight capitalize">{formData.objetivo}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[9px] font-medium text-gray-400 uppercase mb-0.5 leading-none">Padrão</div>
                                        <div className="text-gray-800 dark:text-gray-200 font-normal text-sm leading-none capitalize">{formData.padrao}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-medium text-gray-400 uppercase mb-0.5 leading-none">Ocupação</div>
                                        <div className="text-gray-800 dark:text-gray-200 font-normal text-sm leading-none capitalize">{formData.ocupacao}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Analysis - Print Optimized */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 mb-6 break-inside-avoid print:border print:shadow-none print:mb-4">
                    <div className="relative inline-block w-full rounded-lg overflow-hidden">
                        <img
                            src={image}
                            alt="Visual Analysis"
                            className="w-full h-auto max-h-[400px] object-cover print:max-h-[350px] object-center"
                        />
                        {/* Pins Overlay */}
                        {(() => {
                            const quadranteCount: Record<number, number> = {};
                            const quadranteIndex: Record<number, number> = {};
                            resultado.grupos_servicos.forEach((grupo) => {
                                const q = grupo.quadrante_foco;
                                quadranteCount[q] = (quadranteCount[q] || 0) + 1;
                            });

                            return resultado.grupos_servicos.map((grupo) => {
                                const q = grupo.quadrante_foco;
                                const currentIndex = quadranteIndex[q] || 0;
                                quadranteIndex[q] = currentIndex + 1;

                                const pos = getAdjustedPosition(q, currentIndex, quadranteCount[q]);
                                const isSelected = selectedGrupo === grupo.id_grupo;

                                return (
                                    <button
                                        key={grupo.id_grupo}
                                        onClick={() => setSelectedGrupo(grupo.id_grupo)}
                                        className={`absolute transition-all duration-200 ${isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'}`}
                                        style={{
                                            top: pos.top,
                                            left: pos.left,
                                            transform: pos.transform
                                        }}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md text-xs print:w-6 print:h-6 print:text-[10px] ${isSelected ? 'bg-teal-700 ring-2 ring-teal-300' : 'bg-teal-600'}`}>
                                            {grupo.id_grupo}
                                        </div>
                                    </button>
                                );
                            });
                        })()}
                    </div>
                    {/* Caption for Print */}
                    <div className="hidden print:block text-[9px] text-center text-gray-400 mt-1 uppercase tracking-wider">
                        Mapa Visual de Serviços Identificados
                    </div>
                </div>

                {/* Service Groups List */}
                <div className="space-y-6">
                    {resultado.grupos_servicos.map((grupo) => (
                        <div key={grupo.id_grupo} className={`break-inside-avoid transition-all ${selectedGrupo === grupo.id_grupo ? 'ring-2 ring-teal-600 rounded-lg' : ''}`}>
                            {/* Group Header */}
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                                        {grupo.id_grupo}
                                    </div>
                                    <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                        {grupo.titulo_amigavel}
                                    </h3>
                                </div>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(grupo.itens.reduce((s, item) => s + item.preco_total, 0))}
                                </span>
                            </div>

                            {grupo.diagnostico_visual && (
                                <div className="px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                                    <p className="text-[11px] text-gray-500 italic">Análise: {grupo.diagnostico_visual}</p>
                                </div>
                            )}

                            {/* Items Table */}
                            <div className="bg-white dark:bg-gray-900">
                                <div className="grid grid-cols-[4fr_1fr_1fr_1.5fr] gap-4 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Serviço</div>
                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide text-center">Qtd</div>
                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide text-right">Unit</div>
                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide text-right">Total</div>
                                </div>

                                {grupo.itens.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-[4fr_1fr_1fr_1.5fr] gap-4 px-4 py-3 border-b border-gray-50 dark:border-gray-800 text-xs items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-gray-200">{item.servico}</div>
                                            {item.material_sugerido && (
                                                <div className="text-[10px] text-blue-600 mt-0.5">💡 {item.material_sugerido}</div>
                                            )}
                                        </div>
                                        <div className="text-center text-gray-600">{item.quantidade} {item.unidade}</div>
                                        <div className="text-right text-gray-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco_unitario)}</div>
                                        <div className="text-right font-medium text-gray-900 dark:text-gray-200">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco_total)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Section: Legend & Totals Side-by-Side - Harmonized with ReportClient */}
                <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-stretch gap-8 break-inside-avoid">

                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Visual Legend Island */}
                        <div className="w-full md:w-72 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-center">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Legenda Visual:</h3>
                            <div className="flex flex-col gap-2 text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-teal-600"></div>
                                    <span>Área de Intervenção Identificada</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">💡</span>
                                    <span>Sugestão Gemini AI</span>
                                </div>
                            </div>
                        </div>

                        {/* Branding Island (if !user) */}
                        {!user && (
                            <div className="w-full md:w-72 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-center">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Plano Gratuito:</h3>
                                <div className="flex flex-col gap-2 text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">✨</span>
                                        <span>Gerado por ObraPlana</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">🔒</span>
                                        <span>Versão não salva na nuvem</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Totals Box */}
                    <div className="w-full md:w-80 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-gray-700 dark:text-gray-400 uppercase text-[10px]">Subtotal Serviços</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGeral)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                                <span className="text-gray-900 dark:text-white uppercase text-[10px]">Total Estimado</span>
                                <span className="text-green-600 dark:text-green-400 text-base">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGeral)}
                                </span>
                            </div>
                            <p className="text-[9px] text-gray-400 mt-2 text-center leading-tight">
                                *Valores estimados. Não substitui orçamento técnico.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
            <div className="watermark hidden">Gerado pela IA ObraPlana</div>
        </div >
    );
}
