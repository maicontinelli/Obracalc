'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Search, Calendar, User, Phone, CheckCircle, ArrowRight, Wallet, Lock, MessageSquare, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Mock data generator for fallback if DB columns don't exist yet
const MOCK_LEADS = Array.from({ length: 8 }).map((_, i) => ({
    id: `mock-${i}`,
    title: i % 2 === 0 ? 'Reforma Completa Apartamento' : 'Construção Residencial 200m²',
    city: i % 3 === 0 ? 'São Paulo' : 'Campinas',
    state: 'SP',
    budget_value: 15000 * (i + 1), // Example value
    created_at: new Date().toISOString(),
    client_name: 'Cliente Oculto',
    description: 'Procuro empreiteiro para execução global. Projeto pronto.',
    distance: `${(i * 2.5).toFixed(1)} km`,
    lead_fee: i % 2 === 0 ? 75 : 135 // Points: 7.50 * 10 = 75 pts, 13.50 * 10 = 135 pts
}));

export default function MarketplacePage() {
    const supabase = createClient();
    const router = useRouter();
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    // New States for Points & Unlock
    const [userPoints, setUserPoints] = useState<number | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [unlockedLeads, setUnlockedLeads] = useState<Record<string, any>>({});
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchDeepData = async () => {
            try {
                // 1. Fetch User Points & ID
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setCurrentUserId(user.id);
                    const { data: profile } = await supabase.from('profiles').select('points').eq('id', user.id).single();
                    setUserPoints(profile?.points || 0);
                }

                // 2. Fetch Leads
                const { data, error } = await supabase
                    .from('budgets')
                    .select('*')
                    .eq('visibility', 'marketplace')
                    .order('created_at', { ascending: false });

                if (!error && data && data.length > 0) {
                    setLeads(data);
                } else {
                    console.log('Using mock leads');
                    setLeads(MOCK_LEADS);
                }
            } catch (e) {
                console.error(e);
                setLeads(MOCK_LEADS);
            } finally {
                setLoading(false);
            }
        };

        fetchDeepData();
    }, []);

    const handleUnlock = async (lead: any) => {
        if (!userPoints || userPoints < (lead.lead_fee || 75)) {
            alert('Saldo de pontos insuficiente! Recarregue sua carteira.');
            // router.push('/recharge'); // Future
            return;
        }

        if (!confirm(`Confirmar desbloqueio por ${lead.lead_fee || 75} pts?`)) return;

        setProcessingId(lead.id);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            const res = await fetch('/api/marketplace/unlock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token || ''}`
                },
                body: JSON.stringify({
                    leadId: lead.id,
                    leadFee: lead.lead_fee || 75
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Erro ao desbloquear');

            // Success!
            setUserPoints(data.remainingPoints);
            setUnlockedLeads(prev => ({
                ...prev,
                [lead.id]: data.contact
            }));

            // alert('Lead desbloqueado com sucesso!');

        } catch (error: any) {
            alert(error.message);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background pb-20">
            {/* Header */}
            <header className="bg-white dark:bg-[#1A1A1A] border-b border-border dark:border-white/5 sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                            <ArrowRight className="rotate-180 text-gray-500" size={20} />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Wallet className="text-primary" size={20} />
                                Marketplace
                            </h1>
                            <p className="text-xs text-muted-foreground hidden sm:block">
                                Oportunidades verificadas
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-indigo-500 group cursor-pointer hover:bg-indigo-700 transition-colors">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold text-white">
                                {userPoints !== null ? `${userPoints} pts` : '...'}
                            </span>
                            {/* Tooltip hint */}
                            <span className="hidden group-hover:block text-[10px] text-indigo-200 ml-1">Saldo</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Search & Filters */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por cidade, tipo de obra..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-border dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm placeholder:text-muted-foreground"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                        {['Todos', 'Reforma', 'Construção', 'Serviços'].map(f => (
                            <button key={f} className="px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-border dark:border-white/10 rounded-xl text-xs font-medium hover:border-primary hover:text-primary transition-colors whitespace-nowrap">
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {leads.map((lead) => {
                        const isUnlocked = unlockedLeads[lead.id];
                        const fee = lead.lead_fee || 75;
                        const isMyLead = currentUserId === lead.user_id;

                        // Mock Logic: "João Silva" -> "João S******"
                        const clientName = lead.client_name || lead.title || 'Cliente';
                        const firstName = clientName.split(' ')[0];
                        const maskedName = isUnlocked ? clientName : `${firstName} ******`;

                        // Services Summary (Real Data)
                        let displayServices: string[] = [];
                        let extraServicesCount = 0;

                        if (lead.services_summary && Array.isArray(lead.services_summary)) {
                            displayServices = lead.services_summary.slice(0, 4);
                            extraServicesCount = Math.max(0, lead.services_summary.length - 4);
                        } else if (lead.id.startsWith('mock-')) {
                            displayServices = ['Instalações Elétricas', 'Pintura Interna', 'Piso Porcelanato', 'Demolição'];
                            extraServicesCount = 12;
                        } else {
                            displayServices = ['Detalhes sob consulta'];
                        }

                        return (
                            <div key={lead.id} className={`bg-white dark:bg-[#1A1A1A] rounded-2xl border ${isUnlocked ? 'border-green-500/50 shadow-green-500/10' : 'border-border dark:border-white/10'} overflow-hidden hover:shadow-lg transition-all group flex flex-col ${isMyLead ? 'opacity-75 border-dashed' : ''}`}>
                                {/* Card Header */}
                                <div className="p-5 border-b border-border dark:border-white/10 bg-gray-50/50 dark:bg-white/5 relative">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="px-2 py-1 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider rounded-md text-muted-foreground">
                                            {lead.id.startsWith('mock-') ? 'Simulação' : 'Verificado'}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-full">
                                            <MapPin size={12} /> {lead.city || lead.work_city || 'Não inf.'}/{lead.state || lead.work_state || 'UF'}
                                        </span>
                                    </div>

                                    {/* Highlighted Budget Value */}
                                    <div className="mb-1">
                                        <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest block mb-0.5">Valor Estimado da Obra</span>
                                        <h3 className="text-2xl font-black text-green-600 dark:text-green-500 tracking-tight">
                                            {(lead.total_value || lead.budget_value) ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(lead.total_value || lead.budget_value) : 'Sob Consulta'}
                                        </h3>
                                    </div>

                                    <h4 className="font-medium text-foreground text-sm opacity-90 line-clamp-1 group-hover:text-primary transition-colors">
                                        {lead.title}
                                    </h4>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 space-y-5 flex-grow">

                                    {/* Services Summary (The "Meat") */}
                                    <div>
                                        <span className="text-[10px] uppercase text-muted-foreground font-bold block mb-2">Escopo Previsto</span>
                                        <div className="flex flex-wrap gap-2">
                                            {displayServices.map(s => (
                                                <span key={s} className="px-2 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-md text-[10px] font-medium text-foreground">
                                                    {s}
                                                </span>
                                            ))}
                                            {extraServicesCount > 0 && (
                                                <span className="px-2 py-1 bg-gray-50 dark:bg-transparent border border-dashed border-gray-300 dark:border-white/10 rounded-md text-[10px] text-muted-foreground">
                                                    +{extraServicesCount} outros
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-border dark:bg-white/5"></div>


                                    {isUnlocked ? (
                                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800 animate-in fade-in zoom-in duration-300">
                                            <div className="flex items-center gap-2 mb-3 text-green-700 dark:text-green-400 font-bold text-sm">
                                                <CheckCircle size={16} /> Contato Revelado
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-foreground">
                                                    <User size={14} className="text-muted-foreground" />
                                                    <span className="font-bold">{unlockedLeads[lead.id].client_name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-foreground font-mono bg-white/50 dark:bg-black/20 p-1.5 rounded border border-green-100 dark:border-green-800/30">
                                                    <Phone size={14} className="text-muted-foreground" />
                                                    {unlockedLeads[lead.id].client_phone}
                                                </div>
                                                <div className="flex gap-2">
                                                    <a
                                                        href={`https://wa.me/55${unlockedLeads[lead.id].client_phone.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        className="flex-1 mt-2 text-center bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <MessageSquare size={14} /> WhatsApp
                                                    </a>
                                                    {/* Report Button Stub */}
                                                    <button
                                                        onClick={() => alert('Função de denúncia: Em análise')}
                                                        className="mt-2 w-10 flex items-center justify-center bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg border border-red-200 dark:border-red-900/50 transition-colors"
                                                        title="Denunciar Lead Falso"
                                                    >
                                                        <AlertCircle size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex gap-3 items-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/5">
                                                <div className="w-10 h-10 rounded-full bg-white dark:bg-black/20 flex items-center justify-center shrink-0 border border-gray-100 dark:border-white/5 shadow-sm">
                                                    <User size={18} className="text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{maskedName}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-500 font-medium">
                                                            <CheckCircle size={10} />
                                                            <span>Telefone Verificado</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ml-auto text-[10px] text-muted-foreground">
                                                    há 2h
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 pt-1">
                                                <div className="flex flex-col">
                                                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex flex-col">
                                                        <span className="text-[10px] text-muted-foreground font-normal uppercase">Investimento</span>
                                                        {fee} pts
                                                    </div>
                                                </div>

                                                {(() => {
                                                    const unlocks = lead.unlock_count || 0;
                                                    const remaining = 3 - unlocks;
                                                    const isSoldOut = remaining <= 0;

                                                    if (isMyLead) {
                                                        return (
                                                            <div className="flex-1 py-3 text-center text-xs font-medium text-muted-foreground bg-gray-100 dark:bg-white/5 rounded-xl border border-dashed border-gray-300 dark:border-white/10">
                                                                Seu Próprio Lead
                                                            </div>
                                                        );
                                                    }

                                                    if (isSoldOut) {
                                                        return (
                                                            <div className="flex-1 py-3 text-center text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 cursor-not-allowed">
                                                                Esgotado
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div className="flex-1 flex flex-col gap-1">
                                                            <button
                                                                onClick={() => handleUnlock(lead)}
                                                                disabled={processingId === lead.id}
                                                                className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                                                            >
                                                                {processingId === lead.id ? (
                                                                    <span className="animate-pulse">Processando...</span>
                                                                ) : (
                                                                    <>
                                                                        <Lock size={16} />
                                                                        Desbloquear
                                                                    </>
                                                                )}
                                                            </button>
                                                            {remaining === 1 && (
                                                                <span className="text-[10px] text-center text-orange-500 font-bold animate-pulse">
                                                                    🔥 Última vaga!
                                                                </span>
                                                            )}
                                                            {remaining > 1 && (
                                                                <span className="text-[10px] text-center text-muted-foreground">
                                                                    Restam {remaining} vagas
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    );
}
