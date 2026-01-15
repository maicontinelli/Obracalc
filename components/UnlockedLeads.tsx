'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Phone, User, Calendar, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function UnlockedLeads() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchUnlockedLeads = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 1. Get Unlock Transactions
                const { data: transactions, error: txError } = await supabase
                    .from('transactions')
                    .select('reference_id, created_at')
                    .eq('user_id', user.id)
                    .eq('type', 'unlock')
                    .order('created_at', { ascending: false });

                console.log('UnlockedLeads Debug - Transactions:', transactions);
                console.log('UnlockedLeads Debug - Error:', txError);

                if (txError || !transactions || transactions.length === 0) {
                    setLoading(false);
                    return;
                }

                // 2. Get Budget Details for these IDs
                const budgetIds = transactions.map(t => t.reference_id);
                console.log('UnlockedLeads Debug - Budget IDs:', budgetIds);

                // Using RPC to bypass RLS (since we bought access)
                const { data: budgets, error: budgetError } = await supabase
                    .rpc('get_unlocked_budgets', { budget_ids: budgetIds });

                console.log('UnlockedLeads Debug - Budgets Found:', budgets);

                if (budgetError) {
                    console.error('Error fetching budget details:', budgetError);
                    setLoading(false);
                    return;
                }

                // 3. Merge Data (Transaction Date + Budget Info)
                const merged = transactions.map(tx => {
                    const budget = budgets?.find((b: any) => b.id === tx.reference_id);
                    return {
                        ...budget, // might be undefined if budget was deleted
                        purchase_date: tx.created_at,
                        tx_id: tx.reference_id // fallback ID
                    };
                }).filter(item => item.client_name); // Filter out deleted/not found budgets

                setLeads(merged);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUnlockedLeads();
    }, [supabase]);

    if (loading) return <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">Carregando contatos...</div>;

    if (leads.length === 0) return null; // Don't show if empty

    return (
        <div className="w-full bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <User className="text-primary" size={20} />
                        Meus Contatos Desbloqueados
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Lista de clientes que você adquiriu no Marketplace
                    </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                    {leads.length} contatos
                </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-white/5">
                {leads.map((lead, idx) => (
                    <div key={`${lead.id}-${idx}`} className="p-5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">

                        {/* Client Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-foreground text-base capitalize">{lead.client_name}</h4>
                                <span className="text-[10px] bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-muted-foreground uppercase tracking-wide">
                                    {lead.project_type || 'Obra'}
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2 text-sm text-muted-foreground">
                                <a href={`tel:${lead.client_phone}`} className="flex items-center gap-1.5 text-green-600 dark:text-green-500 hover:underline font-medium bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded-md w-fit">
                                    <Phone size={14} />
                                    {lead.client_phone}
                                </a>
                                <div className="flex items-center gap-1.5 ">
                                    <MapPin size={14} />
                                    {lead.work_city} - {lead.work_state}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <Calendar size={14} />
                                    Comprado em {new Date(lead.purchase_date).toLocaleDateString('pt-BR')}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right mr-2 hidden md:block">
                                <span className="text-[10px] text-muted-foreground uppercase block">Valor Estimado</span>
                                <span className="font-bold text-foreground">
                                    {lead.total_value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(lead.total_value) : 'Sob Consulta'}
                                </span>
                            </div>

                            <Link
                                href={`/report/${lead.id}`} // Or maybe a simplified view? Or the editor view?
                                className="p-2 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-muted-foreground transition-colors"
                                title="Ver Orçamento"
                            >
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
