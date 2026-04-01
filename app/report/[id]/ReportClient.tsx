'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Printer, ArrowLeft, User as UserIcon, Phone, Building2, Calendar, Sparkles, Cloud, FileSpreadsheet } from 'lucide-react';
import { getDddInfo } from '@/lib/ddd-data';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useProfile } from '@/hooks/useProfile';
import { PLAN_LIMITS } from '@/lib/plan-limits';
import { ResumoExecutivo, CurvaABC, CronogramaEstimado, ComposicaoBDI, ComparativoMercado } from './ReportVisuals';

export default function ReportClient({ estimateId }: { estimateId: string }) {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [includeContract, setIncludeContract] = useState(false);
    const [showGuestModal, setShowGuestModal] = useState(false);

    const supabase = createClient();
    const { profile, isLoading: isProfileLoading } = useProfile();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }, [supabase]);

    useEffect(() => {
        const loadReportData = async () => {
            // 1. Try Local Storage first (fastest for creator)
            const savedData = localStorage.getItem(`estimate_${estimateId}`);
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    setData(parsed);
                    setIncludeContract(!!parsed.includeContract);
                    setLoading(false);
                    return;
                } catch (e) {
                    console.error('Error parsing local data:', e);
                }
            }

            // 2. Fallback to Supabase (for Admin or shared links)
            try {
                const { data: budget, error } = await supabase
                    .from('budgets')
                    .select('content')
                    .eq('id', estimateId)
                    .single();

                if (budget && budget.content) {
                    setData(budget.content);
                    setIncludeContract(!!budget.content.includeContract);
                } else if (error) {
                    console.error('Error fetching from Supabase:', error);
                }
            } catch (err) {
                console.error('Unexpected error loading report:', err);
            } finally {
                setLoading(false);
            }
        };

        loadReportData();
    }, [estimateId, supabase]);


    // Merge Profile Data for Provider Info (Single Source of Truth)
    const displayProviderName = (profile?.full_name || profile?.company_name) || data?.providerName || '-';
    const displayProviderPhone = profile?.phone || data?.providerPhone || '-';
    const displayProviderAddress = profile?.address || data?.providerAddress || '-';
    const displayClientAddress = data?.clientAddress || '-';

    // Get DDD info for phone numbers
    const providerDddInfo = useMemo(() => displayProviderPhone ? getDddInfo(displayProviderPhone) : null, [displayProviderPhone]);
    const clientDddInfo = useMemo(() => data?.clientPhone ? getDddInfo(data.clientPhone) : null, [data?.clientPhone]);

    const getFinalPrice = (item: any) => {
        const includeMaterials = data?.includeMaterials !== false; // Default true
        if (item.manualPrice !== undefined && item.manualPrice !== null) {
            return Number(item.manualPrice);
        }
        const baseP = Number(item.price || 0);
        const rawLabor = Number(item.laborPrice || 0);
        // Sanitization logic matching BoqEditor
        const safeLabor = (rawLabor > 0 && rawLabor < baseP) ? rawLabor : baseP * 0.4;

        return includeMaterials ? baseP : safeLabor;
    };

    const checkPlan = () => {
        if (!profile || profile.tier === 'free' || profile.subscription_status === 'past_due') {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000); // Auto hide after 3s
            return false;
        }
        return true;
    };

    const handlePrint = () => {
        // Force light mode for printing
        const htmlElement = document.documentElement;
        const isDark = htmlElement.classList.contains('dark');

        if (isDark) {
            htmlElement.classList.remove('dark');
            htmlElement.style.colorScheme = 'light';
        }

        // Small delay to ensure styles update before print dialog
        setTimeout(() => {
            window.print();

            // Restore dark mode after print dialog is closed
            if (isDark) {
                htmlElement.classList.add('dark');
                htmlElement.style.colorScheme = 'dark';
            }
        }, 100);
    };

    const handleExportExcel = async () => {
        if (!checkPlan()) return;
        if (!data) return;

        const XLSX = await import('xlsx');

        // Prepare Data for Budget Sheet
        const includedItems = data.items?.filter((i: any) => i.included) || [];
        const excelRows = includedItems.map((item: any) => ({
            'Categoria': item.category,
            'Item': item.name,
            'Tipo': item.type === 'service' ? 'Serviço' : item.type === 'material' ? 'Material' : 'Composição',
            'Unidade': item.unit,
            'Quantidade': Number(item.quantity),
            'Preço Unitário': getFinalPrice(item),
            'Total': getFinalPrice(item) * Number(item.quantity)
        }));

        // Create Workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelRows);

        // Styling widths
        ws['!cols'] = [
            { wch: 20 }, // Category
            { wch: 50 }, // Name
            { wch: 15 }, // Type
            { wch: 10 }, // Unit
            { wch: 10 }, // Qty
            { wch: 15 }, // Price
            { wch: 15 }  // Total
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Orçamento");

        // Write File
        XLSX.writeFile(wb, `Orcamento_${data.clientName || 'Cliente'}.xlsx`);
    };

    // Listen for actions from SimpleNav (integrated menu)
    useEffect(() => {
        const handleAction = (e: any) => {
            const action = e.detail;

            // Block all actions for guest users
            if (!user) {
                setShowGuestModal(true);
                return;
            }

            if (action === 'print') {
                handlePrint();
            } else if (action === 'excel') {
                handleExportExcel();
            } else if (typeof action === 'object' && action.type === 'toggle-contract') {
                setIncludeContract(action.value);
            }
        };

        window.addEventListener('report-action', handleAction);

        // Sync initial state with nav
        if (!loading && data) {
            window.dispatchEvent(new CustomEvent('report-sync-state', { detail: { includeContract } }));
        }

        return () => window.removeEventListener('report-action', handleAction);
    }, [loading, data, includeContract]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando relatório...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-xl mb-6 text-gray-800">Orçamento não encontrado</p>
                    <button onClick={() => router.push('/')} className="btn btn-primary">
                        Voltar para Home
                    </button>
                </div>
            </div>
        );
    }

    const includedItems = data.items?.filter((i: any) => i.included) || [];
    const subtotal = includedItems.reduce((sum: number, item: any) => {
        const price = getFinalPrice(item);
        return sum + (Number(price) * Number(item.quantity));
    }, 0);

    const bdiValue = subtotal * ((data.bdi || 20) / 100);
    const total = subtotal + bdiValue;

    // Group items by category
    const groupedItems: Record<string, any[]> = {};
    includedItems.forEach((item: any) => {
        const category = item.category || 'OUTROS';
        if (!groupedItems[category]) {
            groupedItems[category] = [];
        }
        groupedItems[category].push(item);
    });

    const categories = Object.keys(groupedItems);

    // Helpers for Contract Dates
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

    // CONTRACT JSX (Reused logic for cleaner render)
    const ContractSection = () => includeContract ? (
        <div className="contract-page max-w-none mx-auto p-8 mt-12 bg-white dark:bg-[#262423] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 print:shadow-none print:border-none print:m-0 print:p-0">
            <style jsx>{`
                @media print {
                    .contract-page { 
                        page-break-before: always;
                        break-before: page;
                        margin-top: 0 !important;
                        padding-top: 40px !important;
                    }
                }
            `}</style>

            <div className="text-center mb-10">
                <h1 className="text-2xl font-bold uppercase text-gray-900 dark:text-gray-100">Contrato de Prestação de Serviços</h1>
                <p className="text-sm text-gray-500 mt-2">Instrumento Particular de Contratação de Obras e Serviços</p>
            </div>

            <div className="space-y-8 text-sm text-gray-800 dark:text-gray-200 leading-relaxed text-justify">

                {/* 1. Identification */}
                <section>
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase mb-2 text-xs tracking-wider">1. Identificação das Partes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-[#262423]/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Contratante (Cliente)</span>
                            <div className="font-semibold">{data.clientName || '__________________________________'}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                CPF/CNPJ: {data.clientDocument || '___________________________'}<br />
                                Endereço: {data.clientAddress || '____________________________________________________'}
                            </div>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Contratado (Prestador)</span>
                            <div className="font-semibold">{displayProviderName}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                CPF/CNPJ: {profile?.document_id || '___________________________'}<br />
                                Endereço: {profile?.address ? `${profile.address} - ${profile.city}/${profile.state}` : (profile?.city ? `${profile.city}/${profile.state}` : '____________________________________________________')}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Object */}
                <section>
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase mb-2 text-xs tracking-wider">2. Objeto do Contrato</h3>
                    <p>
                        O presente contrato tem por objeto a execução dos serviços de <strong>{data.projectType || 'Engenharia/Reforma'}</strong>, conforme detalhado no Orçamento nº <strong>{estimateId?.slice(0, 8).toUpperCase()}</strong>, anexo a este instrumento.
                    </p>
                </section>

                {/* 3. Scope */}
                <section>
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase mb-2 text-xs tracking-wider">3. Escopo dos Serviços</h3>
                    <p>
                        Os serviços serão executados estritamente conforme a descrição, quantitativos e especificações técnicas constantes no orçamento anexo. Qualquer serviço não listado no referido documento será considerado <strong>adicional</strong>, devendo ser objeto de nova negociação e orçamento complementar.
                    </p>
                </section>

                {/* 4. Prazo */}
                <section>
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase mb-2 text-xs tracking-wider">4. Prazo de Execução</h3>
                    <p>
                        O prazo estimado para início dos serviços é <strong>{data.deadline || 'a combinar'}</strong>, contados a partir da assinatura deste contrato e do pagamento da primeira parcela (se aplicável).
                        <br />
                        <span className="text-xs text-gray-500 italic">Parágrafo único: O prazo poderá ser prorrogado em casos de força maior, chuvas intensas que impeçam trabalhos externos, ou atraso na entrega de materiais fornecidos pelo CONTRATANTE.</span>
                    </p>
                </section>

                {/* 5. Valor e Pagamento */}
                <section>
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase mb-2 text-xs tracking-wider">5. Valor e Forma de Pagamento</h3>
                    <p>
                        Pela execução dos serviços, o CONTRATANTE pagará ao CONTRATADO o valor total de <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</strong>.
                    </p>
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#262423]/50 p-3 rounded border border-dashed border-gray-300 dark:border-gray-700">
                        <strong>Condições de Pagamento:</strong><br /><br />
                        (   ) À vista com desconto<br />
                        (   ) Entrada de R$ ___________ + ___ parcelas de R$ ___________<br />
                        (   ) Conforme medição quinzenal/mensal<br />
                        <br />
                        <strong>Dados para Pagamento:</strong><br />
                        {profile?.pix_key && (
                            <div className="mb-1">PIX: {profile.pix_key}</div>
                        )}
                        {profile?.bank_account ? (
                            <div>Banco: {profile.bank_name} | Ag: {profile.bank_agency} | Cc: {profile.bank_account}</div>
                        ) : !profile?.pix_key && (
                            <div>Banco: _________________ | Ag: ______ | Cc: ______________</div>
                        )}
                    </div>
                </section>

                {/* 6. Obrigações */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white uppercase mb-2 text-xs tracking-wider">6. Obrigações do Contratado</h3>
                        <ul className="list-disc pl-4 space-y-1 text-xs">
                            <li>Executar os serviços com zelo e técnica adequada.</li>
                            <li>Utilizar profissionais qualificados e equipamentos de segurança.</li>
                            <li>Manter o local da obra limpo e organizado.</li>
                            <li>Respeitar as normas do condomínio/vizinhança (horários, ruído).</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white uppercase mb-2 text-xs tracking-wider">7. Obrigações do Contratante</h3>
                        <ul className="list-disc pl-4 space-y-1 text-xs">
                            <li>Garantir livre acesso da equipe ao local da obra.</li>
                            <li>Fornecer água, energia elétrica e local para armazenamento.</li>
                            <li>Efetuar os pagamentos nos prazos combinados.</li>
                            <li>Fornecer materiais de sua responsabilidade em tempo hábil.</li>
                        </ul>
                    </div>
                </section>

                {/* 8. Adicionais */}
                <section>
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase mb-2 text-xs tracking-wider">8. Alterações e Serviços Extras</h3>
                    <p>
                        Solicitações de alterações no projeto ou serviços extras não previstos no orçamento original deverão ser formalizadas. O CONTRATADO apresentará os custos adicionais, que deverão ser aprovados pelo CONTRATANTE antes da execução.
                    </p>
                </section>

                {/* 9. Rescisão */}
                <section>
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase mb-2 text-xs tracking-wider">9. Rescisão</h3>
                    <p>
                        O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 7 dias. Em caso de rescisão, será realizado um levantamento dos serviços executados para acerto financeiro proporcional ("medição final").
                    </p>
                </section>

                {/* 10. Foro */}
                <section>
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase mb-2 text-xs tracking-wider">10. Foro</h3>
                    <p>
                        Fica eleito o foro da comarca de <strong>{profile?.city || data.workCity || '____________________'}</strong> para dirimir quaisquer dúvidas oriundas deste contrato.
                    </p>
                </section>

                {/* Signatures */}
                <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-center mb-12">
                        {profile?.city || data.workCity || 'Cidade'}, {formattedDate}.
                    </p>
                    <div className="grid grid-cols-2 gap-12 text-center">
                        <div>
                            <div className="border-t border-black dark:border-white w-3/4 mx-auto mb-2"></div>
                            <div className="font-bold text-sm">{displayProviderName}</div>
                            <div className="text-xs text-gray-500">CONTRATADO</div>
                        </div>
                        <div>
                            <div className="border-t border-black dark:border-white w-3/4 mx-auto mb-2"></div>
                            <div className="font-bold text-sm">{data.clientName || 'Cliente'}</div>
                            <div className="text-xs text-gray-500">CONTRATANTE</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    ) : null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#1c1917] print:bg-white print:min-h-0 print:h-auto">
            <style jsx global>{`
                @media print {
                    @page { 
                        margin: 0;
                        size: A4;
                    }
                    body { 
                        margin: 0;
                        padding: 10mm 10mm !important;
                        background: white !important; 
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    nav, .no-print, footer, .footer { 
                        display: none !important; 
                    }
                    .print-content { 
                        box-shadow: none !important; 
                        background: white !important;
                        max-width: 100% !important;
                        width: 100% !important;
                    }

                    /* General Text Colors for Print */
                    body, .print-content {
                        color: #111827 !important;
                    }
                    
                    /* DARK HEADER OVERRIDES - High Specificity */
                    header.bg-gray-900, 
                    div.bg-gray-900,
                    .bg-gray-900 *,
                    header.bg-gray-900 * {
                        color: white !important;
                    }
                    
                    /* Subtitles in dark header */
                    .bg-gray-900 .text-gray-300,
                    .bg-gray-900 .text-gray-400 {
                        color: #e5e7eb !important;
                    }

                    /* LABELS & SECONDARY TEXT (Grey like web version) */
                    .text-gray-400, 
                    .text-gray-500, 
                    .text-gray-600,
                    [class*="text-gray-400"],
                    [class*="text-gray-500"],
                    .uppercase.text-xs,
                    .info-key {
                        color: #9ca3af !important;
                    }

                    /* Headlines inside cards */
                    h2, h3, h4 {
                        color: #111827 !important;
                    }
                    
                    /* CONDENSE PRINT LAYOUT */
                    .print-content { 
                        font-size: 11px !important;
                    }
                    
                    .text-base { font-size: 13px !important; }
                    .text-sm { font-size: 11px !important; }
                    .text-xs { font-size: 9px !important; }
                    .text-2xl { font-size: 18px !important; }
                    
                    .p-6 { padding: 12px !important; }
                    .p-8 { padding: 16px !important; }
                    .gap-6 { gap: 12px !important; }
                    .space-y-8 { space-y: 12px !important; }
                    .space-y-6 { space-y: 10px !important; }
                    .mt-12 { margin-top: 24px !important; }
                    .mb-10 { margin-bottom: 20px !important; }

                    /* Fix truncate for email in print */
                    .truncate { 
                        overflow: visible !important; 
                        text-overflow: clip !important;
                        white-space: normal !important;
                    }

                    /* Secondary - Discreet Grey */
                    .text-gray-400, .text-gray-500, .uppercase.text-xs {
                        color: #4b5563 !important;
                    }

                    /* Remove any potential footer elements */
                    *[class*="footer"], *[class*="Footer"], *[id*="footer"], *[id*="Footer"] {
                        display: none !important;
                    }
                    
                    .watermark {
                        text-align: center;
                        color: #9ca3af;
                        font-size: 10px;
                        margin-top: 40px;
                        margin-bottom: 5px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        position: fixed;
                        bottom: 5px;
                        left: 0;
                        width: 100%;
                        display: block !important;
                    }
                    
                    /* Explicit Page Break Utility */
                    .print-page-break {
                        display: block;
                        height: 1px;
                        page-break-before: always;
                    }

                    /* Prevent mid-item/mid-card breaks */
                    .item-row,
                    .category-section,
                    .analysis-section > div,
                    .break-inside-avoid {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                    
                    /* Ensure headers/titles don't stay alone at bottom */
                    h1, h2, h3, .category-header {
                        break-after: avoid !important;
                        page-break-after: avoid !important;
                    }
                    
                    /* ensure Analysis starts on new page with visual margin */
                    .analysis-section {
                        page-break-before: always;
                    }
                    
                    /* Ensure contract starts on new page with visual margin */
                    .contract-page {
                        page-break-before: always;
                        padding-top: 20mm !important;
                        margin-top: 0 !important;
                    }
                }
            `}</style>



            {/* Report Content */}
            <div id="report-content" className="max-w-none mx-auto p-4 lg:p-8 print-content print:p-0 print:max-w-full">
                {/* Header - Premium Invoice Style (Compact 40%) */}
                <div className="mb-6 bg-white dark:bg-[#262423] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden break-inside-avoid print:border print:shadow-none print:rounded-xl print:mb-4">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
                            @page {
                                size: A4;
                                margin: 0;
                            }
                            body {
                                margin: 0;
                                padding: 10mm 15mm !important;
                            }
                            body {
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                            .print-no-break {
                                break-inside: avoid;
                            }
                        }
                    ` }} />
                    {/* Top Bar - Brand & Title */}
                    <div className="bg-[#374151] text-white px-6 py-4 flex justify-between items-center print:bg-[#374151] print:text-white print:px-5 print:py-3">
                        <div className="flex items-center gap-3">
                            <img
                                src={profile?.logo_url || "/logo-test.webp"}
                                alt={profile?.company_name || "Logo ObraPlana"}
                                className="h-8 w-auto object-contain"
                            />
                            <div>
                                <div className="text-xl font-semibold tracking-tight leading-none text-white">{profile?.company_name || "ObraPlana"}</div>
                                {!profile?.company_name && (
                                    <div className="text-[10px] text-gray-300 font-medium tracking-wide mt-0.5 leading-none">Tecnologia especialista em construção civil</div>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <h1 className="text-xl font-bold tracking-tight uppercase opacity-100 mb-0.5 text-white">Orçamento</h1>
                            <p className="text-[10px] text-gray-300 font-mono tracking-wide uppercase opacity-70">#{estimateId.slice(0, 8)}</p>
                        </div>
                    </div>

                    {/* Info Grid - Split Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 relative h-full border-b border-gray-50 dark:border-gray-800">
                        {/* Central Divider */}
                        <div className="absolute left-1/2 top-4 bottom-4 w-px bg-gray-100 dark:bg-gray-700/50 hidden md:block print:block"></div>

                        {/* Prestador (Left) */}
                        <div className="p-4 md:p-6 bg-white dark:bg-[#262423] print:bg-white print:p-4">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                <div className="col-span-1">
                                    <div className="text-[10px] font-bold print:font-normal text-gray-400 uppercase leading-none mb-1.5">
                                        Prestador
                                    </div>
                                    <div className="text-gray-900 dark:text-white font-bold print:font-normal text-[12px] leading-tight mt-0.5">
                                        {displayProviderName}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold print:font-normal text-gray-400 uppercase leading-none mb-1.5">
                                        Telefone
                                    </div>
                                    <div className="text-gray-800 dark:text-gray-200 font-bold print:font-normal text-[12px] leading-tight mt-0.5">
                                        {displayProviderPhone}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-[10px] font-bold print:font-normal text-gray-400 uppercase leading-none mb-1.5">
                                        Endereço
                                    </div>
                                    <div className="text-gray-800 dark:text-gray-200 font-bold print:font-normal text-[12px] leading-tight mt-0.5">
                                        {displayProviderAddress}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cliente (Right) */}
                        <div className="p-4 md:p-6 bg-white dark:bg-[#262423] print:bg-white print:p-4">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                <div className="col-span-1">
                                    <div className="text-[10px] font-bold print:font-normal text-gray-400 uppercase leading-none mb-1.5">
                                        Cliente
                                    </div>
                                    <div className="text-gray-900 dark:text-white font-bold print:font-normal text-[12px] leading-tight mt-0.5">
                                        {data.clientName || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold print:font-normal text-gray-400 uppercase leading-none mb-1.5">
                                        Telefone
                                    </div>
                                    <div className="text-gray-800 dark:text-gray-200 font-bold print:font-normal text-[12px] leading-tight mt-0.5">
                                        {data.clientPhone || '-'}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-[10px] font-bold print:font-normal text-gray-400 uppercase leading-none mb-1.5">
                                        Endereço
                                    </div>
                                    <div className="text-gray-800 dark:text-gray-200 font-bold print:font-normal text-[12px] leading-tight mt-0.5">
                                        {displayClientAddress}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Resumo Cards in Header */}
                    <div className="grid grid-cols-2 md:grid-cols-5 print:grid-cols-5 gap-3 p-4 md:p-6 bg-white dark:bg-[#262423] print:bg-white print:p-4 print:pt-2">
                        <div className="p-2.5 bg-gray-50/50 dark:bg-gray-700/20 rounded-lg border border-gray-100 dark:border-gray-700 print:border-none print:bg-gray-50/50">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-teal-600 text-[11px]">🏗️</span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Tipo</span>
                            </div>
                            <div className="font-bold text-[12px] text-gray-900 dark:text-gray-100 leading-tight">{data.projectType || 'Obra Geral'}</div>
                        </div>

                        <div className="p-2.5 bg-gray-50/50 dark:bg-gray-700/20 rounded-lg border border-gray-100 dark:border-gray-700 print:border-none print:bg-gray-50/50">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-amber-600 text-[11px]">⏳</span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Estimado</span>
                            </div>
                            <div className="font-bold text-[12px] text-gray-900 dark:text-gray-100 leading-tight">{data.projectDuration ? `${data.projectDuration} meses` : '-'}</div>
                        </div>

                        <div className="p-2.5 bg-gray-50/50 dark:bg-gray-700/20 rounded-lg border border-gray-100 dark:border-gray-700 print:border-none print:bg-gray-50/50">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-blue-500 text-[11px]">📐</span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Área Total</span>
                            </div>
                            <div className="font-bold text-[12px] text-gray-900 dark:text-gray-100 leading-tight">{data.projectArea ? `${data.projectArea} m²` : '-'}</div>
                        </div>

                        <div className="p-2.5 bg-gray-50/50 dark:bg-gray-700/20 rounded-lg border border-gray-100 dark:border-gray-700 print:border-none print:bg-gray-50/50">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-purple-500 text-[11px]">📊</span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase">BDI</span>
                            </div>
                            <div className="font-bold text-[12px] text-gray-900 dark:text-gray-100 leading-tight">{data.bdi || 0}%</div>
                        </div>

                        <div className="p-2.5 bg-gray-50/50 dark:bg-gray-700/20 rounded-lg border border-gray-100 dark:border-gray-700 print:border-none print:bg-gray-50/50">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-green-500 text-[11px]">💰</span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Valor Total</span>
                            </div>
                            <div className="font-bold text-[12px] text-gray-900 dark:text-gray-100 leading-tight">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(total)}</div>
                        </div>
                    </div>
                </div>

                {/* REMOVED VISUALS FROM TOP - MOVED TO BOTTOM */}

                {/* Items - Condensed Table Style */}
                <div className="space-y-6">
                    {categories.map((category) => {
                        const categoryItems = groupedItems[category];
                        const categoryTotal = categoryItems.reduce((sum: number, item: any) => {
                            const price = getFinalPrice(item);
                            return sum + (price * item.quantity);
                        }, 0);

                        return (
                            <div key={category}>
                                {/* Category Header */}
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-[#262423] border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                        {category}
                                    </h3>
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(categoryTotal)}
                                    </span>
                                </div>

                                {/* Sections by Type */}
                                {/* Items List for Category */}
                                <div className="bg-white dark:bg-[#262423]">
                                    {/* Column Headers (Once per category) */}
                                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider bg-white dark:bg-[#262423] border-b border-gray-100 dark:border-gray-800">
                                        <div className="col-span-5 text-gray-600 dark:text-gray-400">Descrição</div>
                                        <div className="col-span-1 text-center">Un.</div>
                                        <div className="col-span-2 text-center">Qtd</div>
                                        <div className="col-span-2 text-right">Unit</div>
                                        <div className="col-span-2 text-right">Total</div>
                                    </div>

                                    {/* Rows */}
                                    {categoryItems.map((item: any) => {
                                        const price = getFinalPrice(item);
                                        const itemTotal = price * item.quantity;

                                        return (
                                            <div
                                                key={item.id}
                                                className="grid grid-cols-12 gap-4 px-4 py-2 print:py-1.5 text-[11px] border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                            >
                                                <div className="col-span-5 text-gray-700 dark:text-gray-300 font-medium leading-tight">
                                                    {item.name}
                                                </div>
                                                <div className="col-span-1 text-center text-gray-400 dark:text-gray-500 text-[10px] uppercase">{item.unit}</div>
                                                <div className="col-span-2 text-center text-gray-600 dark:text-gray-400">{item.quantity}</div>
                                                <div className="col-span-2 text-right text-gray-500 dark:text-gray-400">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                                                </div>
                                                <div className="col-span-2 text-right text-gray-700 dark:text-gray-300 font-semibold">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(itemTotal)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>

            {/* NEW REPORT VISUALS SECTION */}
            <div className="analysis-section space-y-6 mb-8 mt-12 print:mb-0 print:mt-0 print:block">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-12 pb-6 print:pt-6 print:pb-3 text-center">
                    <h2 className="text-2xl font-bold uppercase text-gray-900 dark:text-gray-100 print:text-gray-900 mb-2">
                        ANÁLISE E PROJEÇÃO
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600 mx-auto leading-relaxed">
                        Indicadores com projeção de custos para controle de prazos e posicionamento estratégico.
                    </p>
                </div>

                <div className="print:mt-0">
                    {/* Resumo Executivo moved to Header - Removing duplicate */}
                </div>

                {/* Full Width Sections with Visual Buffers for Print */}
                <div className="break-inside-avoid print:pt-8">
                    <CronogramaEstimado deadline={data.deadline || ''} projectType={data.projectType || ''} projectDuration={data.projectDuration} total={total} items={data.items || []} />
                </div>

                <div className="break-inside-avoid print:pt-8">
                    <CurvaABC items={data.items || []} includeMaterials={data.includeMaterials !== false} />
                </div>

                {/* Footer Section: Legend & Totals Side-by-Side - Moved here as requested */}
                <div className="mt-8 print:mt-4 print:pt-[20px] grid grid-cols-1 print:grid-cols-2 md:grid-cols-2 gap-6 print:gap-4 break-inside-avoid items-stretch">
                    <ComposicaoBDI bdiPct={data.bdi || 0} totalDirect={subtotal} />
                    <ComparativoMercado total={total} area={data.projectArea || 0} projectType={data.projectType || ''} id={estimateId} />
                </div>

            </div>

            {includeContract && <ContractSection />}

            {showToast && (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-[100] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <Sparkles className="text-amber-400" size={18} />
                    <span className="text-sm font-medium">Funcionalidade exclusiva dos planos pagos</span>
                    <button
                        onClick={() => router.push('/planos')}
                        className="ml-2 text-xs bg-white text-gray-900 px-2 py-1 rounded-full font-bold hover:bg-gray-100 transition-colors"
                    >
                        Ver Planos
                    </button>
                </div>
            )}

            {/* Guest Modal */}
            {showGuestModal && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowGuestModal(false)}
                >
                    <div
                        className="bg-white dark:bg-[#1e1c1a] rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-5">
                            <Cloud className="text-teal-600" size={26} />
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Crie sua conta gratuita
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            Para exportar, salvar e acessar todas as funcionalidades do relatório, você precisa de uma conta. É grátis e leva menos de 1 minuto.
                        </p>

                        <button
                            onClick={() => {
                                window.open('/login', '_blank');
                                setShowGuestModal(false);
                            }}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-teal-600/20 mb-3"
                        >
                            Criar conta grátis
                        </button>

                        <button
                            onClick={() => setShowGuestModal(false)}
                            className="w-full text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-1"
                        >
                            Agora não
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
