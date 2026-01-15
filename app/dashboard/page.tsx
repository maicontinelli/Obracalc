'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import {
    User as UserIcon,
    Loader2,
    FileText,
    Calendar,
    DollarSign,
    TrendingUp,
    Search,
    Edit3,
    Trash2,
    Plus,
    Camera,
    Upload,
    Building2,
    ChevronDown,
    MapPin,
    Phone,
    Briefcase,
    Save,
    MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { LeadsIsland } from '@/components/LeadsIsland';
import { useProfile } from '@/hooks/useProfile';
import { PLAN_LIMITS } from '@/lib/plan-limits';
import { GamifiedStatus } from '@/components/GamifiedStatus';
import UnlockedLeads from '@/components/UnlockedLeads';
import Script from 'next/script';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Add TypeScript support for the custom element
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'stripe-buy-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                'buy-button-id': string;
                'publishable-key': string;
                'client-reference-id'?: string;
            };
        }
    }
}

interface Budget {
    id: string;
    title: string;
    updated_at: string;
    content: any; // JSONB content
    visibility?: 'marketplace' | 'private';
    user_id?: string;
    created_at?: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const supabase = createClient();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [budgets, setBudgets] = useState<Budget[]>([]);

    // Stats State
    const [stats, setStats] = useState({
        totalBudgets: 0,
        totalValue: 0,
        avgTicket: 0,
        thisMonth: 0
    });

    // Profile State
    const [isProfileExpanded, setIsProfileExpanded] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [showOnboardingMessage, setShowOnboardingMessage] = useState(false);
    const { profile, isLoading: isProfileLoading } = useProfile();
    const [profileData, setProfileData] = useState({
        full_name: '',
        company_name: '',
        phone: '',
        city: '',
        state: '',
        profession: '',
        registration_number: '',
        team_size: '',
        avatar_url: ''
    });
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // Load Data
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/login');
                    return;
                }

                setUser(user);

                // 1. Fetch Profile Data from public.profiles table (Single Source of Truth)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                let currentProfileData = {
                    full_name: '',
                    company_name: '',
                    phone: '',
                    city: '',
                    state: '',
                    profession: '',
                    registration_number: '',
                    team_size: '',
                    avatar_url: ''
                };

                if (profile) {
                    currentProfileData = {
                        full_name: profile.full_name || '',
                        company_name: profile.company_name || '',
                        phone: profile.phone || '',
                        city: profile.city || '',
                        state: profile.state || '',
                        profession: profile.profession || '',
                        registration_number: profile.registration_number || '',
                        team_size: profile.team_size || '',
                        avatar_url: profile.avatar_url || ''
                    };
                } else if (user.user_metadata) {
                    // Fallback to auth metadata if profile is empty (migration)
                    currentProfileData = {
                        full_name: user.user_metadata.full_name || '',
                        company_name: user.user_metadata.company_name || '',
                        phone: user.user_metadata.phone || '',
                        city: user.user_metadata.city || '',
                        state: user.user_metadata.state || '',
                        profession: '',
                        registration_number: '',
                        team_size: '',
                        avatar_url: user.user_metadata.avatar_url || ''
                    };
                }

                setProfileData(currentProfileData);

                // Check if profile is incomplete (using full_name as proxy)
                if (!currentProfileData.full_name) {
                    // setIsProfileExpanded(true); // Don't auto-expand in new layout to keep it clean
                    setShowOnboardingMessage(true);
                }

                // 2. Fetch Budgets
                const { data: budgetsData, error } = await supabase
                    .from('budgets')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false });

                if (budgetsData) {
                    setBudgets(budgetsData);

                    // Calculate Stats
                    const totalVal = budgetsData.reduce((acc, curr) => {
                        const val = curr.content?.items?.filter((i: any) => i.included).reduce((sum: number, item: any) => sum + ((item.manualPrice ?? item.price) * item.quantity), 0) * (1 + (curr.content?.bdi || 0) / 100) || 0;
                        return acc + val;
                    }, 0);

                    // Count this month
                    const now = new Date();
                    const thisMonthCount = budgetsData.filter(b => {
                        const d = new Date(b.created_at || now);
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    }).length;

                    setStats({
                        totalBudgets: budgetsData.length,
                        totalValue: totalVal,
                        avgTicket: budgetsData.length > 0 ? totalVal / budgetsData.length : 0,
                        thisMonth: thisMonthCount
                    });
                }

            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [router, supabase]);

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0 || !user) {
                return;
            }
            setIsUploadingAvatar(true);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));

            // Auto-save to profile
            await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            alert('Erro ao fazer upload da imagem.');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSavingProfile(true);
        setShowOnboardingMessage(false);

        try {
            const payload = {
                id: user.id,
                email: user.email || '',
                full_name: profileData.full_name,
                company_name: profileData.company_name,
                phone: profileData.phone,
                city: profileData.city,
                state: profileData.state,
                profession: profileData.profession,
                registration_number: profileData.registration_number,
                team_size: profileData.team_size,
                avatar_url: profileData.avatar_url,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase.from('profiles').upsert(payload);

            if (error) throw error;

            alert('Perfil atualizado com sucesso!');
            setIsProfileExpanded(false);

        } catch (error: any) {
            console.error('Exceção ao salvar:', error);
            alert(`Erro ao salvar: ${error.message}`);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const toggleBudgetVisibility = async (budget: Budget) => {
        const newVisibility: 'marketplace' | 'private' = budget.visibility === 'marketplace' ? 'private' : 'marketplace';

        // Optimistic Update
        const updatedBudgets = budgets.map(b =>
            b.id === budget.id ? { ...b, visibility: newVisibility } : b
        );
        setBudgets(updatedBudgets);

        try {
            const { error } = await supabase
                .from('budgets')
                .update({ visibility: newVisibility })
                .eq('id', budget.id);

            if (error) throw error;
        } catch (error) {
            console.error('Error toggling visibility:', error);
            setBudgets(budgets); // Revert
            alert('Erro ao atualizar visibilidade.');
        }
    };

    const handleDeleteBudget = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este orçamento?')) return;
        const { error } = await supabase.from('budgets').delete().eq('id', id);
        if (!error) {
            setBudgets(prev => prev.filter(b => b.id !== id));
            localStorage.removeItem(`estimate_${id}`);
        }
    };

    const handleNewBudget = () => {
        if (profile?.tier === 'free' && budgets.length >= PLAN_LIMITS.free.max_estimates) {
            alert('Você atingiu o limite de 3 orçamentos gratuítos. Faça o upgrade para criar mais.');
            router.push('/planos');
            return;
        }
        const id = crypto.randomUUID();
        router.push(`/editor/${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    // Modern "Crextio-inspired" Dashboard Layout
    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-black font-sans box-border p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">

                {/* 1. Header & Welcome Pill */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">
                            Olá, {profileData.full_name?.split(' ')[0] || 'Parceiro'}
                        </h1>
                        <p className="text-muted-foreground text-sm">Bem-vindo ao seu painel de controle.</p>
                    </div>

                    {/* Quick Stats Pill (Gamification Summary) */}
                    <div className="flex items-center gap-6 bg-white dark:bg-[#1A1A1A] px-6 py-2.5 rounded-full shadow-sm border border-border dark:border-white/5 overflow-x-auto max-w-full">
                        <div className="flex flex-col items-center min-w-[80px]">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Orçamentos</span>
                            <span className="text-lg font-bold text-primary">{stats.totalBudgets}</span>
                        </div>
                        <div className="w-px h-8 bg-border dark:bg-white/10" />
                        <div className="flex flex-col items-center min-w-[80px]">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Pontos</span>
                            <span className="text-lg font-bold text-green-600">{profile?.points || 0}</span>
                        </div>
                        <div className="w-px h-8 bg-border dark:bg-white/10" />
                        <div className="flex flex-col items-center min-w-[80px]">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                {profile?.tier === 'free' ? 'Plano Grátis' : 'Assinante'}
                            </span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${profile?.tier !== 'free' || i <= (PLAN_LIMITS.free.max_estimates - budgets.length) ? 'bg-green-500' : 'bg-gray-200'}`} />)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Main Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Col 1: Profile "Lora style" (Width: 3/12 or 4/12) */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-[2rem] p-4 shadow-sm border border-white/40 dark:border-white/5 relative overflow-hidden group">
                            {/* Large Image Area */}
                            <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-gray-100 dark:bg-gray-800 isolate">
                                {profileData.avatar_url ? (
                                    <img src={profileData.avatar_url} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                        <UserIcon size={64} strokeWidth={1} />
                                        <span className="text-xs">Sem foto</span>
                                    </div>
                                )}

                                {/* Gradient Overlay */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent z-10" />

                                {/* Upload Trigger Overlay */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20 cursor-pointer">
                                    <label className="cursor-pointer flex flex-col items-center gap-2 text-white">
                                        <Camera size={24} />
                                        <span className="text-xs font-bold">Alterar Foto</span>
                                        <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" disabled={isUploadingAvatar} />
                                    </label>
                                </div>
                                {isUploadingAvatar && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30"><Loader2 className="animate-spin text-white" /></div>}

                                {/* Text Info Overlay */}
                                <div className="absolute bottom-4 left-4 right-4 z-20 text-white">
                                    <h2 className="text-xl font-bold truncate">{profileData.full_name || 'Seu Nome'}</h2>
                                    <p className="text-xs text-white/80 uppercase tracking-wider">{profileData.profession || 'Profissional'}</p>
                                </div>

                                {/* Floating Action Button Badge */}
                                <div className="absolute top-4 right-4 z-20">
                                    <button
                                        onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                                        className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2 rounded-full transition-colors border border-white/20"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Info List / Status */}
                            <div className="mt-4 px-2 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                                        <Phone size={14} />
                                    </div>
                                    <span className="truncate">{profileData.phone || 'Sem telefone'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                        <MapPin size={14} />
                                    </div>
                                    <span className="truncate">{profileData.city || 'Sem cidade'} • {profileData.state || 'UF'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                                        <Briefcase size={14} />
                                    </div>
                                    <span className="truncate">{profileData.company_name || 'Sem empresa'}</span>
                                </div>
                            </div>

                            {/* New Budget Main CTA */}
                            <div className="mt-6">
                                <button
                                    onClick={handleNewBudget}
                                    className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <Plus size={20} />
                                    <span>Novo Orçamento</span>
                                </button>
                            </div>

                            {/* Edit Drawer Inline */}
                            {isProfileExpanded && (
                                <div className="absolute inset-0 z-50 bg-white dark:bg-[#1A1A1A] p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-10 overflow-auto">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold">Editar Dados</h3>
                                        <button onClick={() => setIsProfileExpanded(false)} className="text-muted-foreground p-1"><ChevronDown /></button>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 ml-1">Nome Completo</p>
                                            <input value={profileData.full_name} onChange={e => setProfileData({ ...profileData, full_name: e.target.value })} placeholder="Seu nome" className="w-full p-2 text-sm bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>

                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 ml-1">Telefone</p>
                                            <input value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} placeholder="(00) 00000-0000" className="w-full p-2 text-sm bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 ml-1">Cidade</p>
                                                <input value={profileData.city} onChange={e => setProfileData({ ...profileData, city: e.target.value })} placeholder="Sua cidade" className="w-full p-2 text-sm bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                            </div>
                                            <div className="w-20">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 ml-1">UF</p>
                                                <input value={profileData.state} onChange={e => setProfileData({ ...profileData, state: e.target.value })} placeholder="UF" className="w-full p-2 text-sm bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" maxLength={2} />
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 ml-1">Empresa</p>
                                            <input value={profileData.company_name} onChange={e => setProfileData({ ...profileData, company_name: e.target.value })} placeholder="Nome da sua empresa" className="w-full p-2 text-sm bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>
                                    </div>

                                    <button onClick={handleSaveProfile} disabled={isSavingProfile} className="mt-auto bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-600/20 active:scale-95 transition-all">{isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Col 2: Content Area (Width: 9/12 or 8/12) */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-6">

                        {/* Upper Row: Gamification (Progress) + Stats (Time Tracker) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* 1. Gamified Subscription/Usage Status (Matches "Progress" card) */}
                            <div className="md:col-span-2 bg-white dark:bg-[#1A1A1A] rounded-[2rem] p-6 shadow-sm border border-white/40 dark:border-white/5 relative overflow-hidden">
                                <GamifiedStatus profile={profile} />
                            </div>

                            {/* 2. Leads Island / Upsell (Moved from Bottom) */}
                            <div className="h-full">
                                {profile?.tier === 'free' ? (
                                    <div className="h-full bg-[#1e1e1e] text-white rounded-[2rem] p-6 shadow-sm border border-white/5 flex flex-col relative overflow-hidden">
                                        <div className="mb-6 z-10">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold">Desbloquear Pro</h3>
                                                <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded-lg">PRO</span>
                                            </div>
                                            <p className="text-white/60 text-xs leading-relaxed">
                                                Remova todos os limites e acesse leads exclusivos da sua região.
                                            </p>
                                        </div>

                                        <div className="mt-auto space-y-3 z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">✓</div>
                                                <span className="text-sm font-medium">Orçamentos Ilimitados</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">✓</div>
                                                <span className="text-sm font-medium">Leads de Obra</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 z-10">
                                            {/* @ts-ignore */}
                                            {React.createElement('stripe-buy-button', {
                                                'buy-button-id': "buy_btn_1SmI1UGZfnvqYwvYe4CkkPeR",
                                                'publishable-key': "pk_live_51SjhneGZfnvqYwvYOVvYwYQUTYIN0moIbzXVaI5OABheROlSEXyVYillwArRFcYvqyxrHoJZqyJIJZ6lgTcyA41q00xIrcoteu",
                                                'client-reference-id': user?.id,
                                                'style': { width: '100%' }
                                            })}
                                        </div>

                                        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />
                                    </div>
                                ) : (
                                    <div className="h-full">
                                        <LeadsIsland tier={profile?.tier || 'free'} budgetsCount={budgets.filter(b => b.visibility === 'marketplace').length} points={profile?.points || 0} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lower Row: Leads Island (Dark Card) + Budgets (Calendar/List) */}
                        {/* Lower Row: Budgets List (Full Width) */}
                        <div className="space-y-6">

                            {/* 4. Recent Budgets List */}
                            <div className="w-full bg-white dark:bg-[#1A1A1A] rounded-[2rem] p-6 shadow-sm border border-white/40 dark:border-white/5">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg">Orçamentos Recentes</h3>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-muted rounded-xl transition-colors"><Search size={18} className="text-muted-foreground" /></button>
                                        <button className="p-2 hover:bg-muted rounded-xl transition-colors"><MoreVertical size={18} className="text-muted-foreground" /></button>
                                    </div>
                                </div>

                                {/* List Implementation */}
                                {/* List Headers */}
                                <div className="hidden md:grid grid-cols-12 gap-4 px-3 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    <div className="col-span-6 pl-16">Cliente / Obra</div>
                                    <div className="col-span-2 text-center">Indicação</div>
                                    <div className="col-span-3 text-right pr-4">Valor</div>
                                    <div className="col-span-1 text-center">Editar</div>
                                </div>
                                <div className="space-y-4">
                                    {budgets.length === 0 ? (
                                        <div className="text-center py-10 text-muted-foreground">
                                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>Nenhum orçamento encontrado</p>
                                        </div>
                                    ) : budgets.slice(0, 5).map(budget => (
                                        <div
                                            key={budget.id}
                                            onClick={() => {
                                                if (profile?.tier !== 'free') router.push(`/editor/${budget.id}`);
                                                else alert('Upgrade necessário. A edição de orçamentos salvos é exclusiva para assinantes.');
                                            }}
                                            className="group grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/30 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-black/5 dark:hover:border-white/5"
                                        >
                                            {/* Client Info (Col-6) */}
                                            <div className="col-span-12 md:col-span-6 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    {budget.content?.clientName ? <span className="font-bold text-lg uppercase">{budget.content.clientName.charAt(0)}</span> : <Building2 size={24} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-foreground truncate">{budget.content?.clientName || budget.title || 'Sem título'}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>{new Date(budget.updated_at).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span>{budget.content?.items?.length || 0} itens</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Toggle (Col-2 Centered) */}
                                            <div className="col-span-6 md:col-span-2 flex justify-center" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => toggleBudgetVisibility(budget)}
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${budget.visibility === 'marketplace' ? 'bg-green-500' : 'bg-gray-200'
                                                        }`}
                                                    title={budget.visibility === 'marketplace' ? 'Público no Marketplace' : 'Privado'}
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${budget.visibility === 'marketplace' ? 'translate-x-5' : 'translate-x-0'
                                                            }`}
                                                    />
                                                </button>
                                            </div>

                                            {/* Value (Col-3 Centered) */}
                                            <div className="col-span-6 md:col-span-3 flex justify-end pr-4 font-bold text-sm">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                                    budget.content?.items?.filter((i: any) => i.included).reduce((sum: number, item: any) => sum + ((item.manualPrice ?? item.price) * item.quantity), 0) * (1 + (budget.content?.bdi || 0) / 100) || 0
                                                )}
                                            </div>

                                            {/* Edit (Col-1 Centered) */}
                                            <div className="hidden md:flex col-span-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (profile?.tier !== 'free') router.push(`/editor/${budget.id}`);
                                                    else alert('Upgrade necessário');
                                                }} className="p-2 bg-white shadow-sm rounded-xl hover:text-primary"><Edit3 size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {budgets.length > 5 && (
                                    <div className="mt-4 pt-4 border-t border-border/50 text-center">
                                        <button className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">Ver todos ({budgets.length})</button>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                <Script async src="https://js.stripe.com/v3/buy-button.js" strategy="lazyOnload" />
            </div>
        </div>
    );
}
