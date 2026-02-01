'use client';

import { useEffect, useState, useMemo } from 'react';
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
    const displayProviderName = (profile?.company_name || profile?.full_name) || data?.providerName || '-';
    // const displayProviderPhone = profile?.phone || data?.providerPhone || '-'; // Use data phone if profile is empty, or prefer profile if valid?
    // Actually, report data might be old. Profile is current.
    const displayProviderPhone = profile?.phone || data?.providerPhone || '-';

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
        if (!profile || profile.tier === 'free') {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000); // Auto hide after 3s
            return false;
        }
        return true;
    };

    const handlePrint = () => {
        window.print();
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

    const handleExportWord = () => {
        if (!checkPlan()) return;
        if (!data || !data.includeContract) return;

        const contractContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Contrato</title></head>
            <body>
                <h1>Contrato de Prestação de Serviços</h1>
                <p><strong>Contratante:</strong> ${data.clientName || '__________________'}</p>
                <p><strong>Contratado:</strong> ${displayProviderName}</p>
                <hr/>
                <p>Este documento contém o modelo de contrato padrão gerado via ObraPlana.</p>
                ${/* Reuse the contract text logic roughly */ ''}
                <h3>1. Objeto</h3>
                <p>Execução de serviços de ${data.projectType || 'Engenharia'}.</p>
                <h3>2. Valor</h3>
                <p>Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            (data.items?.filter((i: any) => i.included).reduce((a: number, b: any) => a + (getFinalPrice(b) * b.quantity), 0) * (1 + (data.bdi || 20) / 100))
        )}</p>
                <br/>
                <p><em>(Conteúdo completo do contrato disponível na versão PDF/HTML)</em></p>
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff', contractContent], {
            type: 'application/msword'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Contrato_${data.clientName || 'Cliente'}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportHTML = () => {
        if (!checkPlan()) return;
        if (!data) return;

        // Calculate values for export
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

        // Get DDD info
        const providerDddInfo = data.providerPhone ? getDddInfo(data.providerPhone) : null;
        const clientDddInfo = data.clientPhone ? getDddInfo(data.clientPhone) : null;

        // Generate items HTML

        // Generate items HTML
        const itemsHTML = categories.map(category => {
            const categoryItems = groupedItems[category];
            const categoryTotal = categoryItems.reduce((sum: number, item: any) => {
                const price = getFinalPrice(item);
                return sum + (price * item.quantity);
            }, 0);

            // Group items by type
            const groups: Record<string, any[]> = { composition: [], service: [], material: [] };
            categoryItems.forEach((item: any) => {
                let type = item.type;
                if (!type || (type !== 'service' && type !== 'material')) {
                    type = 'composition';
                }
                groups[type].push(item);
            });

            // Define display order and headers
            const orderedGroups = [
                { id: 'composition', title: 'Composições', icon: '🛠️', items: groups.composition },
                { id: 'service', title: 'Serviços/Mão de Obra', icon: '👷', items: groups.service },
                { id: 'material', title: 'Materiais', icon: '🧱', items: groups.material }
            ].filter(g => g.items.length > 0);

            const sectionsHTML = orderedGroups.map(g => {
                const rows = g.items.map(item => {
                    const price = getFinalPrice(item);
                    const itemTotal = price * item.quantity;
                    return `
                        <div class="item-row">
                            <div class="item-name">${item.name}</div>
                            <div class="item-unit">${item.unit}</div>
                            <div class="item-qty">${item.quantity}</div>
                            <div class="item-price">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}</div>
                            <div class="item-total">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(itemTotal)}</div>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="items-header">
                        <div><span style="font-size: 14px; margin-right: 6px; vertical-align: middle;">${g.icon}</span>${g.title}</div>
                        <div style="text-align: center;">Un.</div>
                        <div style="text-align: center;">Qtd</div>
                        <div style="text-align: right;">Unit</div>
                        <div style="text-align: right;">Total</div>
                    </div>
                    ${rows}
                `;
            }).join('');

            return `
                <div class="category-section">
                    <div class="category-header">
                        <div class="category-title">${category}</div>
                        <div class="category-total">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(categoryTotal)}</div>
                    </div>
                    ${sectionsHTML}
                </div>
            `;
        }).join('');

        // Contract HTML Generation for Export
        const contractHTML = data.includeContract ? `
            <div class="contract-page" style="page-break-before: always; padding: 40px; margin-top: 0; background: white;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <h1 style="font-size: 24px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">Contrato de Prestação de Serviços</h1>
                    <p style="font-size: 14px; color: #6b7280;">Instrumento Particular de Contratação de Obras e Serviços</p>
                </div>

                <div style="font-size: 14px; line-height: 1.6; text-align: justify; color: #374151;">
                    
                    <div style="margin-bottom: 30px;">
                        <h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; color: #111827;">1. Identificação das Partes</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                            <div>
                                <div style="font-size: 10px; font-weight: bold; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px;">Contratante (Cliente)</div>
                                <div style="font-weight: 600; margin-bottom: 4px;">${data.clientName || '__________________________________'}</div>
                                <div style="font-size: 12px; color: #4b5563;">
                                    CPF/CNPJ: ${data.clientDocument || '___________________________'}<br/>
                                    Endereço: ${data.clientAddress || '____________________________________________________'}
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 10px; font-weight: bold; color: #9ca3af; text-transform: uppercase; margin-bottom: 4px;">Contratado (Prestador)</div>
                                <div style="font-weight: 600; margin-bottom: 4px;">${displayProviderName}</div>
                                <div style="font-size: 12px; color: #4b5563;">
                                    CPF/CNPJ: ${profile?.document_id || '___________________________'}<br/>
                                    Endereço: ${profile?.address ? `${profile.address} - ${profile.city}/${profile.state}` : (profile?.city ? `${profile.city}/${profile.state}` : '____________________________________________________')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; color: #111827;">2. Objeto do Contrato</h3>
                        <p>O presente contrato tem por objeto a execução dos serviços de <strong>${data.projectType || 'Engenharia/Reforma'}</strong>, conforme detalhado no Orçamento nº <strong>${estimateId?.slice(0, 8).toUpperCase()}</strong>, anexo a este instrumento.</p>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; color: #111827;">3. Escopo dos Serviços</h3>
                        <p>Os serviços serão executados estritamente conforme a descrição, quantitativos e especificações técnicas constantes no orçamento anexo. Qualquer serviço não listado no referido documento será considerado <strong>adicional</strong>, devendo ser objeto de nova negociação e orçamento complementar.</p>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; color: #111827;">4. Prazo de Execução</h3>
                        <p>O prazo estimado para início dos serviços é <strong>${data.deadline || 'a combinar'}</strong>, contados a partir da assinatura deste contrato e do pagamento da primeira parcela (se aplicável).<br/><span style="font-size: 12px; color: #6b7280; font-style: italic;">Parágrafo único: O prazo poderá ser prorrogado em casos de força maior, chuvas intensas que impeçam trabalhos externos, ou atraso na entrega de materiais fornecidos pelo CONTRATANTE.</span></p>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; color: #111827;">5. Valor e Forma de Pagamento</h3>
                        <p>Pela execução dos serviços, o CONTRATANTE pagará ao CONTRATADO o valor total de <strong>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</strong>.</p>
                        <div style="margin-top: 8px; font-size: 12px; color: #4b5563; background: #f9fafb; padding: 12px; border: 1px dashed #d1d5db; border-radius: 4px;">
                            <strong>Condições de Pagamento:</strong><br/><br/>
                            (   ) À vista com desconto<br/>
                            (   ) Entrada de R$ ___________ + ___ parcelas de R$ ___________<br/>
                            (   ) Conforme medição quinzenal/mensal<br/><br/>
                            <strong>Dados para Pagamento:</strong><br/>
                            ${profile?.pix_key ? `PIX: ${profile.pix_key}<br/>` : ''}
                            ${profile?.bank_account ? `Banco: ${profile.bank_name || '___'} | Ag: ${profile.bank_agency || '___'} | Cc: ${profile.bank_account || '___'}` : (!profile?.pix_key ? 'Banco: _________________ | Ag: ______ | Cc: ______________' : '')}
                        </div>
                    </div>

                    <div style="margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; color: #111827;">6. Obrigações do Contratado</h3>
                            <ul style="padding-left: 20px; margin: 0; font-size: 12px;">
                                <li>Executar os serviços com zelo e técnica adequada.</li>
                                <li>Utilizar profissionais qualificados e equipamentos de segurança.</li>
                                <li>Manter o local da obra limpo e organizado.</li>
                                <li>Respeitar as normas de vizinhança.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; color: #111827;">7. Obrigações do Contratante</h3>
                            <ul style="padding-left: 20px; margin: 0; font-size: 12px;">
                                <li>Garantir livre acesso da equipe ao local.</li>
                                <li>Fornecer água, energia e local para armazenamento.</li>
                                <li>Efetuar os pagamentos nos prazos combinados.</li>
                                <li>Fornecer materiais de sua responsabilidade a tempo.</li>
                            </ul>
                        </div>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; color: #111827;">8. Alterações e Serviços Extras</h3>
                        <p>Solicitações de alterações ou serviços extras deverão ser formalizadas. O CONTRATADO apresentará os custos adicionais, que deverão ser aprovados pelo CONTRATANTE antes da execução.</p>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; color: #111827;">9. Rescisão</h3>
                        <p>O contrato poderá ser rescindido mediante aviso prévio de 7 dias. Em caso de rescisão, será realizado um levantamento dos serviços executados para acerto financeiro proporcional ("medição final").</p>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <h3 style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; color: #111827;">10. Foro</h3>
                        <p>Fica eleito o foro da comarca de <strong>${profile?.city || data.workCity || '____________________'}</strong> para dirimir quaisquer dúvidas oriundas deste contrato.</p>
                    </div>

                    <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center;">
                        <p style="margin-bottom: 40px;">${profile?.city || data.workCity || 'Cidade'}, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
                            <div>
                                <div style="border-top: 1px solid #000; width: 80%; margin: 0 auto 8px auto;"></div>
                                <div style="font-weight: bold; font-size: 14px;">${displayProviderName}</div>
                                <div style="font-size: 12px; color: #6b7280;">CONTRATADO</div>
                            </div>
                            <div>
                                <div style="border-top: 1px solid #000; width: 80%; margin: 0 auto 8px auto;"></div>
                                <div style="font-weight: bold; font-size: 14px;">${data.clientName || 'Cliente'}</div>
                                <div style="font-size: 12px; color: #6b7280;">CONTRATANTE</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        ` : '';

        const htmlContent = `
<!DOCTYPE html>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orçamento - ${data?.clientName || 'Relatório'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #f3f4f6;
            padding: 40px;
            color: #374151;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .container { 
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        /* Invoice Header - Compact */
        .invoice-header {
            background: #374151;
            color: white;
            padding: 24px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .brand-logo {
            font-size: 20px;
            font-weight: 600;
            letter-spacing: -0.5px;
            line-height: 1;
        }
        .brand-subtitle {
            font-size: 10px;
            color: #9ca3af;
            font-weight: 500;
            letter-spacing: 0.5px;
            text-transform: none;
            margin-top: 2px;
        }
        .invoice-title {
            text-align: right;
        }
        .invoice-title h1 {
            font-size: 24px;
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin: 0;
            color: white;
            opacity: 1;
        }
        .invoice-id {
            color: #d1d5db;
            font-size: 11px;
            letter-spacing: 0.5px;
            margin-top: 2px;
            text-transform: uppercase;
        }

        /* Info Grid - Compact */
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-col {
            padding: 20px 30px;
        }
        .info-col.left {
            background: #f9fafb;
            border-right: 1px solid #e5e7eb;
        }
        .col-label {
            font-size: 10px;
            font-weight: 600;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .info-row {
            margin-bottom: 8px;
        }
        .info-key {
            font-size: 9px;
            color: #6b7280;
            font-weight: 500;
            text-transform: uppercase;
            display: block;
            margin-bottom: 1px;
        }
        .info-val {
            font-size: 13px;
            color: #111827;
            font-weight: 400;
            line-height: 1.2;
        }

        /* Tables & Lists */
        .category-section { margin-top: 40px; padding: 0 40px; }
        .category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 2px solid #e5e7eb;
            margin-bottom: 20px;
        }
        .category-title {
            font-size: 16px;
            font-weight: 800;
            color: #111827;
            text-transform: uppercase;
        }
        .category-total {
            font-size: 16px;
            font-weight: 800;
            color: #111827;
        }

        .items-header {
            display: grid;
            grid-template-columns: 4fr 1fr 1fr 1.5fr 1.5fr;
            gap: 16px;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
            margin-top: 20px;
        }
        .items-header div {
            font-size: 10px;
            font-weight: 700;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .item-row {
            display: grid;
            grid-template-columns: 4fr 1fr 1fr 1.5fr 1.5fr;
            gap: 16px;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
            font-size: 12px;
            color: #374151;
        }
        .item-name { font-weight: 500; }
        .item-row div { align-self: center; }
        
        /* Footer Layout */
        .footer-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 0 40px 40px 40px;
            gap: 20px;
            margin-top: 40px;
        }
        .footer-left {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        .footer-box {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            min-width: 200px;
            width: fit-content;
        }
        .box-title {
            font-size: 10px;
            font-weight: 700;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .box-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 10px;
            color: #6b7280;
            font-weight: 500;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        .box-icon { font-size: 12px; }

        /* Totals */
        .totals-section {
            margin: 0; /* Handled by wrapper */
            display: flex;
            justify-content: flex-end;
        }
        .totals-box {
            width: 350px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 24px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 13px;
        }
        .total-final {
            display: flex;
            justify-content: space-between;
            border-top: 2px solid #e5e7eb;
            padding-top: 15px;
            margin-top: 15px;
        }
        .total-final .total-val {
            font-size: 18px;
            font-weight: 800;
            color: #059669;
        }

        @media print {
            body { padding: 0; background: white; }
            .container { box-shadow: none; border: none; border-radius: 0; max-width: 1000px; }
            .invoice-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .info-col.left { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #f9fafb !important; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Invoice Header -->
        <div class="invoice-header">
            <div class="brand">
                <img src="${window.location.origin}/logo-test.webp" alt="Logo" style="height: 32px; width: auto;">
                <div style="display: flex; flex-direction: column;">
                    <span class="brand-logo">ObraPlana</span>
                    <span class="brand-subtitle" style="color: #d1d5db; text-transform: none;">Tecnologia especialista em construção civil</span>
                </div>
            </div>
            <div class="invoice-title">
                <h1>Orçamento</h1>
                <div class="invoice-id">#${data?.id?.slice(0, 8).toUpperCase() || 'REF-001'}</div>
            </div>
        </div>

        <!-- Info Grid -->
        <div class="info-grid">
            <div class="info-col left">
                <div class="col-label">Prestador de Serviços</div>
                <div class="info-row">
                    <span class="info-key">Nome / Empresa</span>
                    <div class="info-val">${displayProviderName}</div>
                </div>
                <div class="info-row">
                    <span class="info-key">Telefone</span>
                    <div class="info-val">${displayProviderPhone}</div>
                </div>
                <div class="info-row">
                    <span class="info-key">Tipo de Obra</span>
                    <div class="info-val">${data.projectType || '-'}</div>
                </div>
                <div class="info-row">
                    <span class="info-key">Regime</span>
                    <div class="info-val" style="font-weight: 700; color: ${data.includeMaterials === false ? '#d97706' : '#059669'};">
                        ${data.includeMaterials === false ? 'APENAS MÃO DE OBRA' : 'EMPREITADA GLOBAL'}
                    </div>
                </div>
            </div>
            <div class="info-col">
                <div class="col-label">Dados do Cliente</div>
                 <div class="info-row">
                    <span class="info-key">Cliente</span>
                    <div class="info-val">${data.clientName || '-'}</div>
                </div>
                <div class="info-row">
                    <span class="info-key">Telefone</span>
                    <div class="info-val">${data.clientPhone || '-'}</div>
                </div>
                <div class="info-row">
                    <span class="info-key">Prazo Estimado</span>
                    <div class="info-val">${data.deadline || '-'}</div>
                </div>
            </div>
        </div>

        ${itemsHTML}

        <div class="footer-wrapper">
             <div class="footer-left">

                  ${(profile && (profile.pix_key || profile.bank_account)) ? `
                  <div class="footer-box">
                       <div class="box-title">Dados Bancários / Pagamento:</div>
                       <div class="flex flex-col gap-2 text-[10px] text-gray-700 uppercase tracking-wide font-medium">
                            ${profile.pix_key ? `<div class="box-item"><span class="box-icon">🔑</span> PIX: <span style="font-family: monospace;">${profile.pix_key}</span></div>` : ''}
                            ${profile.bank_account ? `
                            <div class="box-item" style="align-items: flex-start;">
                                <span class="box-icon">🏦</span>
                                <div style="display: flex; flex-direction: column;">
                                    <span>${profile.bank_name}</span>
                                    <span>Ag: ${profile.bank_agency} / Cc: ${profile.bank_account}</span>
                                </div>
                            </div>
                            ` : ''}
                       </div>
                  </div>
                  ` : ''}
                  ${(!profile || profile.tier === 'free') ? `
                  <div class="footer-box">
                       <div class="box-title">Plano Gratuito:</div>
                       <div class="box-item"><span class="box-icon">✨</span> Gerado por ObraPlana</div>
                       <div class="box-item"><span class="box-icon">🔒</span> Versão não salva na nuvem</div>
                  </div>
                  ` : ''}
             </div>
             
             <div class="totals-section">
                <div class="totals-box">
                    <div class="total-row">
                        <span style="color: #6b7280; font-weight: 600;">SUBTOTAL</span>
                        <span style="font-weight: 600;">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
                    </div>
                    <div class="total-row">
                        <span style="color: #6b7280; font-weight: 600;">BDI (${data.bdi || 20}%)</span>
                        <span style="font-weight: 600;">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bdiValue)}</span>
                    </div>
                    <div class="total-final">
                        <span style="font-weight: 700; color: #111827;">TOTAL GERAL</span>
                        <span class="total-val">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        ${contractHTML}
    </div>
    ${(!profile || profile.tier === 'free') ? '<div class="watermark">Gerado gratuitamente por ObraPlana</div>' : ''}
</body>
</html>`;

        // Try to open in new window
        const newWindow = window.open('', '_blank');

        if (newWindow && !newWindow.closed) {
            // Successfully opened new window
            newWindow.document.write(htmlContent);
            newWindow.document.close();
        } else {
            // Popup was blocked, download instead
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `orcamento-${data?.clientName || estimateId}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

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
    const ContractSection = () => data.includeContract ? (
        <div className="contract-page max-w-none mx-auto p-8 mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 print:shadow-none print:border-none print:m-0 print:p-0">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
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
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded border border-dashed border-gray-300 dark:border-gray-700">
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 print:bg-white print:min-h-0 print:h-auto">
            <style jsx global>{`
                @media print {
                    @page { 
                        margin: 7mm;
                        size: A4;
                    }
                    body { 
                        margin: 0; 
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
                    
                    /* Balanced colors for print */
                    div, span, p, h2, h3, h4, h5, h6 {
                        color: #374151 !important; /* Dark Grey base */
                    }
                    
                    /* Highlights - Black */
                    .font-bold, .font-semibold, h2, .item-total, .total-value {
                        color: #000000 !important;
                    }

                    /* Header Override - Force White on Dark BG */
                    .bg-\[\#374151\] *, .invoice-header *, .brand-logo, .invoice-title h1 {
                        color: white !important;
                    }

                    /* Secondary - Discreet Grey */
                    .text-gray-400, .text-gray-500, .uppercase.text-xs {
                        color: #4b5563 !important;
                    }

                    /* Keep Total Green */
                    .text-green-600, .text-green-600 * {
                        color: #16a34a !important;
                    }

                    /* Remove any potential footer elements */
                    *[class*="footer"], 
                    *[class*="Footer"],
                    *[id*="footer"],
                    *[id*="Footer"] {
                        display: none !important;
                    }
                    /* Ensure totals section uses condensed font sizes */
                    .space-y-3 > div {
                        font-size: 12px !important;
                    }
                    .space-y-3 span[class*="text-xs"],
                    .space-y-3 span[class*="text-sm"] {
                        font-size: 12px !important;
                    }
                    .space-y-3 span[class*="text-[10px]"] {
                        font-size: 10px !important;
                    }
                    .space-y-3 span[class*="text-base"] {
                        font-size: 16px !important;
                    }
                    .watermark {
                        text-align: center;
                        color: #9ca3af;
                        font-size: 10px;
                        margin-top: 40px;
                        margin-bottom: 20px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    @media print {
                        .watermark {
                            display: block !important;
                            position: fixed;
                            bottom: 10px;
                            left: 0;
                            width: 100%;
                        }
                        
                        /* Explicit Page Break Utility */
                        .print-page-break {
                            display: block;
                            height: 1px;
                            page-break-before: always;
                            break-before: page;
                            margin: 0;
                        }
                    }
                }
            `}</style>

            {/* Toolbar */}
            <div className="no-print bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center gap-4">
                    <button
                        onClick={() => router.push(`/editor/${estimateId}`)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                    >
                        <ArrowLeft size={14} /> Editor
                    </button>

                    <div className="flex items-center gap-4">


                        <div className="flex gap-3">
                            {/* Guest Actions (Discreet) */}
                            {!user && (
                                <>
                                    <button
                                        onClick={() => router.push('/login')}
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                                        title="Crie uma conta para salvar"
                                    >
                                        <Cloud size={14} /> <span className="hidden sm:inline">Salvar</span>
                                    </button>
                                </>
                            )}

                            <button
                                onClick={handleExportExcel}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                            >
                                <FileSpreadsheet size={14} /> Excel
                            </button>
                            {data?.includeContract && (
                                <button
                                    onClick={handleExportWord}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                                >
                                    <FileText size={14} /> Word
                                </button>
                            )}

                            <button
                                onClick={handleExportHTML}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                            >
                                <FileText size={14} /> Html
                            </button>


                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm"
                            >
                                <Printer size={14} /> Pdf
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div id="report-content" className="max-w-none mx-auto p-4 lg:p-8 print-content print:p-0 print:max-w-full">
                {/* Header - Premium Invoice Style (Compact 40%) */}
                <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden break-inside-avoid print:border print:shadow-none print:rounded-xl">
                    {/* Top Bar - Brand & Title */}
                    <div className="bg-[#374151] text-white px-6 py-4 flex justify-between items-center print:bg-[#374151] print:text-white">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo-test.webp"
                                alt="Logo ObraPlana"
                                className="h-8 w-auto"
                            />
                            <div>
                                <div className="text-xl font-semibold tracking-tight leading-none text-white">ObraPlana</div>
                                <div className="text-[10px] text-gray-300 font-medium tracking-wide mt-0.5 leading-none">Tecnologia especialista em construção civil</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <h1 className="text-2xl font-medium tracking-wide uppercase opacity-100 mb-0.5 text-white">Orçamento</h1>
                            <p className="text-xs text-gray-300 font-mono tracking-wide uppercase">#{estimateId.slice(0, 8)}</p>
                        </div>
                    </div>

                    {/* Info Grid - Split Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Prestador (Left) */}
                        <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 print:bg-white">
                            <div className="mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Prestador de Serviços</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 leading-none">Nome / Empresa</div>
                                    <div className="text-gray-900 dark:text-white font-medium text-base leading-tight">{displayProviderName}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 leading-none">Telefone</div>
                                        <div className="text-gray-800 dark:text-gray-200 font-medium text-base leading-none">{displayProviderPhone}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 leading-none">Localização</div>
                                        <div className="text-gray-800 dark:text-gray-200 font-medium text-sm leading-tight">
                                            {profile?.address ? (
                                                <span className="line-clamp-2">{profile.address}{profile.city ? ` - ${profile.city}` : ''}{profile.state ? `/${profile.state}` : ''}</span>
                                            ) : (
                                                <span onClick={() => router.push(user ? '/dashboard' : '/login')} className="text-blue-500 hover:text-blue-600 cursor-pointer text-xs print:hidden hover:underline">
                                                    {user ? 'Complete seu endereço' : 'Cadastre-se para personalizar'}
                                                </span>
                                            )}
                                            {/* Hide CTA in print, show dash if empty */}
                                            <span className="hidden print:block print:text-gray-400">
                                                {!profile?.address ? '-' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cliente (Right) */}
                        <div className="p-6 bg-white dark:bg-gray-800 print:bg-white">
                            <div className="mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Dados do Cliente</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 leading-none">Cliente</div>
                                    <div className="text-gray-900 dark:text-white font-medium text-base leading-tight">{data.clientName || '-'}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 leading-none">Telefone</div>
                                        <div className="text-gray-800 dark:text-gray-200 font-medium text-base leading-none">{data.clientPhone || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 leading-none">Prazo</div>
                                        <div className="text-gray-800 dark:text-gray-200 font-medium text-base leading-none">{data.deadline || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Resumo Cards in Header */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 pb-6 pt-2 bg-white dark:bg-gray-800 print:bg-white border-t border-gray-50 dark:border-gray-700/50">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-orange-500">🏗️</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Tipo</span>
                            </div>
                            <div className="font-bold text-sm text-gray-800 dark:text-gray-200 leading-tight">{data.projectType || 'Obra Geral'}</div>
                        </div>

                        <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-blue-500">📐</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Área Total</span>
                            </div>
                            <div className="font-bold text-sm text-gray-800 dark:text-gray-200 leading-tight">{data.projectArea ? `${data.projectArea} m²` : 'Não informada'}</div>
                        </div>

                        <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-green-500">💰</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Valor Total</span>
                            </div>
                            <div className="font-bold text-sm text-gray-800 dark:text-gray-200 leading-tight">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(total)}</div>
                        </div>

                        <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-purple-500">📊</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">BDI Estimado</span>
                            </div>
                            <div className="font-bold text-sm text-gray-800 dark:text-gray-200 leading-tight">{data.bdi || 0}%</div>
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
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                        {category}
                                    </h3>
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(categoryTotal)}
                                    </span>
                                </div>

                                {/* Sections by Type */}
                                <div className="bg-white dark:bg-gray-900">
                                    {(() => {
                                        // Group items
                                        const groups: Record<string, any[]> = { composition: [], service: [], material: [] };
                                        categoryItems.forEach((item: any) => {
                                            let type = item.type;
                                            if (!type || (type !== 'service' && type !== 'material')) {
                                                type = 'composition';
                                            }
                                            groups[type].push(item);
                                        });

                                        const orderedGroups = [
                                            { id: 'composition', title: 'Composições', icon: '🛠️', items: groups.composition },
                                            { id: 'service', title: 'Serviços', icon: '🔨', items: groups.service },
                                            { id: 'material', title: 'Materiais', icon: '🧱', items: groups.material }
                                        ].filter(g => g.items.length > 0);

                                        return orderedGroups.map(g => (
                                            <div key={g.id}>
                                                {/* Group Header as Column Header */}
                                                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 mt-2 first:mt-0">
                                                    <div className="col-span-5 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <span className="text-sm leading-none">{g.icon}</span>
                                                        <span>{g.title}</span>
                                                    </div>
                                                    <div className="col-span-1 text-center">Un.</div>
                                                    <div className="col-span-2 text-center">Qtd</div>
                                                    <div className="col-span-2 text-right">Unit</div>
                                                    <div className="col-span-2 text-right">Total</div>
                                                </div>

                                                {/* Rows */}
                                                {g.items.map((item: any) => {
                                                    const price = getFinalPrice(item);
                                                    const itemTotal = price * item.quantity;

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className="grid grid-cols-12 gap-4 px-4 py-2 text-[11px] border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                        >
                                                            <div className="col-span-5 text-gray-700 dark:text-gray-300 font-medium">
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
                                        ));
                                    })()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Section: Legend & Totals Side-by-Side */}
                <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-stretch gap-8 break-inside-avoid">

                    <div className="flex flex-col lg:flex-row gap-4">


                        {/* Branding/Watermark Island (Hidden for Paid Plans) */}
                        {/* Bank Info Island (If available) */}
                        {profile && (profile.pix_key || profile.bank_account) && (
                            <div className="w-full md:w-72 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-center">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Dados Bancários / Pagamento:</h3>
                                <div className="flex flex-col gap-2 text-[10px] text-gray-700 dark:text-gray-300 uppercase tracking-wide font-medium">
                                    {profile.pix_key && (
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400">Chave PIX</span>
                                            <span className="font-mono text-xs">{profile.pix_key}</span>
                                        </div>
                                    )}
                                    {profile.bank_account && (
                                        <div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-gray-400">Banco</span>
                                                    <span>{profile.bank_name}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-gray-400">Ag/Conta</span>
                                                    <span>{profile.bank_agency} / {profile.bank_account}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Branding/Watermark Island (Free/Anonymous) */}
                        {(!profile || profile.tier === 'free') && (
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
                                    {!user && (
                                        <div className="mt-2 text-[9px] text-blue-500 underline cursor-pointer" onClick={() => router.push('/login')}>
                                            Criar conta para remover
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Totals Box (Right) */}
                    <div className="w-full md:w-80 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-gray-700 dark:text-gray-400 uppercase text-[10px]">Subtotal</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-gray-700 dark:text-gray-400 uppercase text-[10px]">BDI ({data.bdi || 20}%)</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bdiValue)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                                <span className="text-gray-900 dark:text-white uppercase text-[10px]">Total Geral</span>
                                <span className="text-green-600 dark:text-green-400 text-base">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                </span>
                            </div>

                            <div className="mt-4 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700 text-right">
                                <div className="text-[9px] font-bold text-gray-400 uppercase mb-0.5 leading-none">Regime de Contratação</div>
                                <div className={`text-[10px] font-bold leading-none ${data.includeMaterials === false ? 'text-amber-600 dark:text-amber-500' : 'text-green-600 dark:text-green-500'}`}>
                                    {data.includeMaterials === false ? 'MÃO DE OBRA' : 'EMPREITADA (GLOBAL)'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* EXPLICIT PAGE BREAK FOR VISUALS */}
            <div className="print-page-break"></div>

            {/* NEW REPORT VISUALS SECTION */}
            <div className="space-y-6 mb-8 mt-12 print:mb-0 print:mt-0 print:block">
                <div className="no-print mb-4 border-t border-gray-200 dark:border-gray-700 pt-8"></div>

                <div className="print:mt-0">
                    {/* Resumo Executivo moved to Header - Removing duplicate */}
                </div>

                {/* Full Width Sections */}
                <CronogramaEstimado deadline={data.deadline || ''} projectType={data.projectType || ''} />
                <CurvaABC items={data.items || []} includeMaterials={data.includeMaterials !== false} />

                {/* Bottom Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ComparativoMercado total={total} />
                    <ComposicaoBDI bdiPct={data.bdi || 0} totalDirect={subtotal} />
                </div>
            </div>

            <ContractSection />

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

        </div >
    );
}
