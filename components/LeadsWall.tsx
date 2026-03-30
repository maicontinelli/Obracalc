'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lock, MapPin, Calendar, Smartphone, User, Briefcase, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SubscriptionTier } from '@/lib/plan-limits';

interface Lead {
    id: string;
    created_at: string;
    project_type: string;
    work_city: string;
    work_state: string;
    client_name?: string;
    client_phone?: string;
}

interface LeadsWallProps {
    tier: SubscriptionTier;
}

export function LeadsWall({ tier }: LeadsWallProps) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                // In a real scenario, filter by region could be here.
                const { data, error } = await supabase
                    .from('anonymous_leads')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (data) {
                    setLeads(data);
                }
            } catch (error) {
                console.error('Error fetching leads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, []);

    if (loading) return <div className="animate-pulse h-48 bg-card rounded-2xl border border-border" />;

    // --- FREE TIER VIEW (Teaser) ---
    if (tier === 'free') {
        return (
            <div className="bg-gradient-to-br from-card to-muted/50 rounded-2xl p-6 border border-border relative overflow-hidden group">
                <div className="absolute inset-0 bg-teal-600/5 group-hover:bg-teal-600/10 transition-colors" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-teal-600/10 text-teal-700 dark:bg-teal-600/20 dark:text-teal-600 rounded-full flex items-center justify-center mb-4">
                        <Briefcase size={24} />
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2">Oportunidades Próximas</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-[240px] leading-relaxed">
                        Existem pessoas orçando obras <span className="text-teal-700 dark:text-teal-500 font-medium">na sua região</span>. Assine o plano Empresarial para ter acesso aos contatos.
                    </p>

                    <Link
                        href="/planos"
                        className="w-full py-2.5 bg-teal-700 hover:bg-teal-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-teal-900/20"
                    >
                        Ver Planos
                    </Link>
                </div>
            </div>
        );
    }

    // --- GENERIC LIST RENDERER (Shared for Pro/Business) ---
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-teal-700 dark:text-teal-600" />
                    <h3 className="font-bold text-foreground text-sm">Oportunidades Recentes</h3>
                </div>
                {tier === 'pro' && <div title="Acesso Limitado"><Lock size={14} className="text-muted-foreground" /></div>}
            </div>

            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                {leads.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-xs">
                        <p>Buscando oportunidades na região...</p>
                        <p className="mt-1 opacity-50">Nenhuma encontrada hoje.</p>
                    </div>
                ) : leads.map(lead => (
                    <div key={lead.id} className="p-4 hover:bg-muted/50 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-600 uppercase tracking-wide bg-teal-600/10 px-2 py-0.5 rounded-full ring-1 ring-teal-600/20">
                                {lead.project_type || 'Obra'}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Calendar size={10} />
                                {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                            </span>
                        </div>

                        <div className="mb-3">
                            {tier === 'business' ? (
                                <div className="text-foreground font-medium text-sm flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                        <User size={10} />
                                    </div>
                                    {lead.client_name || 'Cliente'}
                                </div>
                            ) : (
                                <div className="text-muted-foreground font-medium text-sm flex items-center gap-2 select-none relative overflow-hidden w-fit">
                                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                        <Lock size={10} />
                                    </div>
                                    <span className="blur-[4px] opacity-70">Nome do Cliente Oculto</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                <MapPin size={12} className="text-muted-foreground/70" />
                                {lead.work_city || 'Cidade'} <span className="text-muted-foreground/30">/</span> {lead.work_state || 'UF'}
                            </div>

                            {tier === 'business' ? (
                                <a
                                    href={`https://wa.me/55${lead.client_phone?.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-[10px] uppercase font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm hover:shadow-green-900/30"
                                >
                                    <Smartphone size={12} />
                                    Contatar
                                </a>
                            ) : (
                                <Link
                                    href="/planos"
                                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground border border-border text-[10px] uppercase font-bold rounded-lg flex items-center gap-1.5 transition-colors group-hover:border-teal-600/30 group-hover:text-teal-700 dark:group-hover:text-teal-200"
                                >
                                    <Lock size={10} />
                                    Desbloquear
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {tier === 'pro' && (
                <div className="p-3 bg-gradient-to-r from-teal-600/5 to-teal-900/5 border-t border-border text-center">
                    <Link href="/planos" className="text-xs font-bold text-teal-700 dark:text-teal-600 hover:text-teal-600 flex items-center justify-center gap-1 transition-colors">
                        Upgrade para Ver Contatos <ArrowRight size={12} />
                    </Link>
                </div>
            )}
        </div>
    );
}
