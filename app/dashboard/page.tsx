'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import {
    User as UserIcon,
    Loader2,
    FileText,
    Search,
    Edit3,
    Trash2,
    Plus,
    Camera,
    MapPin,
    Map,
    Sparkles,
    Phone,
    Briefcase,
    ChevronDown,
    Building2,
    CheckCircle2,
    PauseCircle,
    Clock,
    Circle,
    X,
    AlertTriangle,
    Download,
    BarChart3,
    Mail,
    DollarSign,
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { BudgetOverview } from '@/components/dashboard/BudgetOverview';
import { downloadReceipt } from '@/lib/receipt';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';



interface Budget {
    id: string;
    title: string;
    updated_at: string;
    content: any;
    user_id?: string;
    created_at?: string;
}

const efficiencyData = [
    { name: 'Seg', work: 7, saved: 5 },
    { name: 'Ter', work: 8, saved: 4 },
    { name: 'Qua', work: 9, saved: 6 },
    { name: 'Qui', work: 8, saved: 5 },
    { name: 'Sex', work: 7.5, saved: 4.5 },
    { name: 'Sab', work: 8, saved: 5.5 },
    { name: 'Dom', work: 9, saved: 6.5 },
];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-2xl border border-white/10 flex flex-col items-center">
                <span>{payload[0].value} Hours</span>
                <div className="w-1.5 h-1.5 bg-black rotate-45 -mb-2 mt-px" />
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const router = useRouter();
    const supabase = createClient();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [isSubscriptionExpanded, setIsSubscriptionExpanded] = useState(false);

    // Simple Stats
    const [stats, setStats] = useState({
        totalBudgets: 0,
        totalValue: 0,
        avgPrice: 0,
        timeSavedHours: 0
    });

    // Profile State
    const [isProfileExpanded, setIsProfileExpanded] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [showOnboardingMessage, setShowOnboardingMessage] = useState(false);
    const { profile } = useProfile(); // tier loading
    const [profileData, setProfileData] = useState({
        full_name: '',
        company_name: '',
        phone: '',
        cep: '',
        address: '',
        city: '',
        state: '',
        profession: '',
        registration_number: '',
        team_size: '',
        avatar_url: '',
        logo_url: '',
        document_id: '',
        pix_key: '',
        bank_name: '',
        bank_agency: '',
        bank_account: ''
    });
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // Subscription State
    const [subscriptionInfo, setSubscriptionInfo] = useState<{
        tier: string;
        periodEnd: string | null;
        daysRemaining: number | null;
        guaranteeExpiresAt: string | null;
        inGuaranteeWindow: boolean;
        paymentFailures: number;
        status: string | null;
    }>({
        tier: 'free',
        periodEnd: null,
        daysRemaining: null,
        guaranteeExpiresAt: null,
        inGuaranteeWindow: false,
        paymentFailures: 0,
        status: null,
    });
    const [isCanceling, setIsCanceling] = useState(false);
    const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

    // Load Data
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);

                // Check for openProfile params
                const params = new URLSearchParams(window.location.search);
                if (params.get('openProfile') === 'true') {
                    setIsProfileExpanded(true);
                }

                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/login');
                    return;
                }

                setUser(user);

                // 1. Fetch Profile
                const { data: dbProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (dbProfile) {
                    // Update Subscription Info
                    // Note: 'tier' in DB can be 'pro' or 'business'.
                    // Prioritize DB value. Fallback to business for admin if DB is empty/null.
                    const tier = dbProfile.tier || (user.email === 'maicontinelli@gmail.com' ? 'business' : 'free');
                    let daysRemaining: number | null = null;

                    if (dbProfile.current_period_end) {
                        const end = new Date(dbProfile.current_period_end);
                        const now = new Date();
                        const diffTime = end.getTime() - now.getTime();
                        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                    }

                    const guaranteeExpiresAt = dbProfile.guarantee_expires_at ?? null;
                    const inGuaranteeWindow = guaranteeExpiresAt
                        ? new Date() < new Date(guaranteeExpiresAt)
                        : false;

                    setSubscriptionInfo({
                        tier,
                        periodEnd: dbProfile.current_period_end,
                        daysRemaining,
                        guaranteeExpiresAt,
                        inGuaranteeWindow,
                        paymentFailures: dbProfile.payment_failures ?? 0,
                        status: dbProfile.subscription_status ?? null,
                    });

                    setProfileData({
                        full_name: dbProfile.full_name || '',
                        company_name: dbProfile.company_name || '',
                        phone: dbProfile.phone || '',
                        cep: dbProfile.cep || '',
                        address: dbProfile.address || '',
                        city: dbProfile.city || '',
                        state: dbProfile.state || '',
                        profession: dbProfile.profession || '',
                        registration_number: dbProfile.registration_number || '',
                        team_size: dbProfile.team_size || '',
                        avatar_url: dbProfile.avatar_url || '',
                        logo_url: dbProfile.logo_url || '',
                        document_id: dbProfile.document_id || '',
                        pix_key: dbProfile.pix_key || '',
                        bank_name: dbProfile.bank_name || '',
                        bank_agency: dbProfile.bank_agency || '',
                        bank_account: dbProfile.bank_account || ''
                    });

                    if (!dbProfile.full_name) setShowOnboardingMessage(true);
                } else if (user.user_metadata) {
                    // Default for new user (no profile yet)
                    setSubscriptionInfo({
                        tier: user.email === 'maicontinelli@gmail.com' ? 'business' : 'free',
                        periodEnd: null,
                        daysRemaining: null,
                        guaranteeExpiresAt: null,
                        inGuaranteeWindow: false,
                        paymentFailures: 0,
                        status: null,
                    });

                    setProfileData({
                        full_name: user.user_metadata.full_name || '',
                        company_name: user.user_metadata.company_name || '',
                        phone: user.user_metadata.phone || '',
                        cep: user.user_metadata.cep || '',
                        address: user.user_metadata.address || '',
                        city: user.user_metadata.city || '',
                        state: user.user_metadata.state || '',
                        profession: '',
                        registration_number: '',
                        team_size: '',
                        avatar_url: user.user_metadata.avatar_url || '',
                        logo_url: '',
                        document_id: '',
                        pix_key: '',
                        bank_name: '',
                        bank_agency: '',
                        bank_account: ''
                    });
                }

                // 2. Fetch Budgets
                const { data: budgetsData } = await supabase
                    .from('budgets')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false });

                if (budgetsData) {
                    setBudgets(budgetsData);

                    const totalVal = budgetsData.reduce((acc, curr) => {
                        const val = curr.content?.items?.filter((i: any) => i.included).reduce((sum: number, item: any) => sum + ((item.manualPrice ?? item.price) * item.quantity), 0) * (1 + (curr.content?.bdi || 0) / 100) || 0;
                        return acc + val;
                    }, 0);

                    const totalArea = budgetsData.reduce((acc, curr) => {
                        const area = parseFloat(curr.content?.totalArea || '0');
                        return acc + (isNaN(area) ? 0 : area);
                    }, 0);

                    const totalItems = budgetsData.reduce((acc, curr) => {
                        const items = curr.content?.items || [];
                        return acc + items.length;
                    }, 0);

                    // Assume 4 minutes saved per item (4 min = ~0.066 hours)
                    const timeSavedHours = Math.round(totalItems * (4 / 60));

                    setStats({
                        totalBudgets: budgetsData.length,
                        totalValue: totalVal,
                        avgPrice: totalArea > 0 ? (totalVal / totalArea) : (totalVal > 0 ? 1500 : 0), // Fallback average if area is 0
                        timeSavedHours: timeSavedHours
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

    // Handle Avatar
    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0 || !user) return;
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
            await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            alert('Erro ao fazer upload da imagem.');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0 || !user) return;
            setIsUploadingLogo(true);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/logo_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setProfileData(prev => ({ ...prev, logo_url: publicUrl }));
            await supabase.from('profiles').update({ logo_url: publicUrl }).eq('id', user.id);

        } catch (error: any) {
            console.error('Error uploading logo:', error);
            alert('Erro ao fazer upload da logo.');
        } finally {
            setIsUploadingLogo(false);
        }
    };

    // Handle Profile Save
    // Handle Profile Save
    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSavingProfile(true);
        setSaveSuccess(false);
        setShowOnboardingMessage(false);

        try {
            const payload = {
                id: user.id,
                email: user.email || '',
                updated_at: new Date().toISOString(),
                ...profileData
            };

            const { error } = await supabase.from('profiles').upsert(payload);
            if (error) throw error;

            setSaveSuccess(true);
            setTimeout(() => {
                setIsProfileExpanded(false);
                setSaveSuccess(false);
            }, 2000);

        } catch (error: any) {
            alert(`Erro ao salvar: ${error.message}`);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm(
            'Tem certeza que deseja cancelar sua assinatura?\n\nVocê receberá o reembolso integral em até 7 dias úteis.'
        )) return;

        setIsCanceling(true);
        try {
            const res = await fetch('/api/subscription/cancel', { method: 'POST' });
            const result = await res.json();

            if (!res.ok) {
                alert(result.error || 'Não foi possível cancelar. Tente novamente.');
                return;
            }

            setSubscriptionInfo(prev => ({
                ...prev,
                tier: 'free',
                status: 'canceled',
                inGuaranteeWindow: false,
                guaranteeExpiresAt: null,
            }));

            alert(result.message);
        } catch (err: any) {
            alert(`Erro técnico: ${err.message}`);
        } finally {
            setIsCanceling(false);
        }
    };

    const handleDownloadReceipt = async () => {
        setIsDownloadingReceipt(true);
        try {
            const planName = subscriptionInfo.tier === 'business' ? 'Empresarial' : 'Profissional';
            const amount = subscriptionInfo.tier === 'business' ? 'R$ 79,00' : 'R$ 39,00';
            // Estimate purchase date = periodEnd minus 1 year
            const purchaseDate = subscriptionInfo.periodEnd
                ? new Date(new Date(subscriptionInfo.periodEnd).getTime() - 365 * 24 * 60 * 60 * 1000).toISOString()
                : new Date().toISOString();

            await downloadReceipt({
                userName: profileData.full_name || user?.email || 'Cliente',
                userEmail: user?.email || '',
                plan: planName,
                amount,
                paymentDate: purchaseDate,
                document: profileData.document_id || undefined,
            });
        } catch (err: any) {
            alert(`Erro ao gerar recibo: ${err.message}`);
        } finally {
            setIsDownloadingReceipt(false);
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
        // Simple limit check - keep logic for now but maybe relax in future
        if (profile?.tier === 'free' && budgets.length >= 2) {
            alert('Limite de 2 orçamentos no plano grátis.');
            router.push('/planos');
            return;
        }
        const id = crypto.randomUUID();
        router.push(`/editor/${id}`);
    };

    const handleFeatureAction = (href: string) => {
        if (!profile || profile.tier === 'free' || profile.subscription_status === 'past_due') {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }
        router.push(href);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background font-sans box-border p-4 md:p-8 relative overflow-hidden">


            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-40 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] invert dark:invert-0 opacity-10"></div>
                <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[120px]"></div>
                <div className="absolute top-[40%] -left-[10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-[1600px] mx-auto space-y-6 relative z-10">

                {/* Past-due hard block banner */}
                {subscriptionInfo.status === 'past_due' && (
                    <div className="flex items-start gap-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-2xl p-4 text-sm">
                        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                        <div className="flex-1">
                            <p className="font-bold text-red-700 dark:text-red-400">Acesso suspendeu por falta de pagamento.</p>
                            <p className="text-red-600 dark:text-red-500 text-xs mt-0.5">Regularize sua assinatura para recuperar o acesso completo às funcionalidades pagas.</p>
                        </div>
                        <button
                            onClick={() => router.push('/planos')}
                            className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Regularizar
                        </button>
                    </div>
                )}

                {/* Soft block / Warning banner (1st failure) */}
                {subscriptionInfo.status === 'active' && subscriptionInfo.paymentFailures === 1 && (
                    <div className="flex items-start gap-4 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 text-sm">
                        <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                        <div className="flex-1">
                            <p className="font-bold text-orange-700 dark:text-orange-400">Problema no pagamento identificado.</p>
                            <p className="text-orange-700 dark:text-orange-500 text-xs mt-0.5">Houve uma falha na sua renovação. Tente regularizar em até 48h para evitar a suspensão do acesso.</p>
                        </div>
                        <button
                            onClick={() => router.push('/planos')}
                            className="shrink-0 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Verificar Pagamento
                        </button>
                    </div>
                )}

                {/* 1. Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-medium text-foreground tracking-tight">
                                Olá, {profileData.full_name?.split(' ')[0] || 'Parceiro'}
                            </h1>


                        </div>
                        <p className="text-muted-foreground text-sm font-light">Seus orçamentos em um lugar.</p>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => handleFeatureAction('/relatorio-fotografico')}
                            className="bg-white dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-white/10 text-foreground border border-border px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all active:scale-95 text-xs shadow-sm"
                        >
                            <Camera size={16} className="text-[#6366F1]" />
                            <span>Relatório de Obra</span>
                        </button>
                        <button
                            onClick={() => handleFeatureAction('/topografia')}
                            className="bg-white dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-white/10 text-foreground border border-border px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all active:scale-95 text-xs shadow-sm"
                        >
                            <Map size={16} className="text-[#C2410C]" />
                            <span>Topografia</span>
                        </button>
                        <button
                            onClick={() => handleFeatureAction('/novo-diagnostico')}
                            className="bg-white dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-white/10 text-foreground border border-border px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all active:scale-95 text-xs shadow-sm"
                        >
                            <Sparkles size={16} className="text-[#FF6600]" />
                            <span>Orçamento por Imagem</span>
                        </button>
                        <button
                            onClick={handleNewBudget}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all active:scale-95 text-xs shadow-lg shadow-blue-600/20"
                        >
                            <Plus size={16} />
                            <span>Novo Orçamento</span>
                        </button>
                    </div>
                </div>

                {/* 2. Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 auto-rows-min gap-6 items-start">

                    {/* 1. Profile */}
                    <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 order-1 lg:order-1">
                        <div className={`bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white/40 dark:border-white/5 relative overflow-hidden transition-all duration-300 ${!isProfileExpanded ? 'p-1.5' : 'p-6'}`}>

                            {!isProfileExpanded ? (
                                <div className="h-[400px] sm:h-[360px] relative transition-all duration-500 overflow-hidden rounded-[2.2rem] group/card">
                                    {/* Full Photo Background */}
                                    <div className="absolute inset-0 z-0">
                                        {profileData.avatar_url ? (
                                            <img
                                                src={profileData.avatar_url}
                                                alt="Profile"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-gray-400">
                                                <UserIcon size={64} strokeWidth={1} />
                                            </div>
                                        )}
                                        {/* Gradient Overlay for legibility */}
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
                                        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/40 to-transparent z-10" />
                                    </div>

                                    {/* Top-Right Floating Edit Button */}
                                    <button
                                        onClick={() => setIsProfileExpanded(true)}
                                        className="absolute top-4 right-4 z-20 p-2.5 bg-black/20 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-black/40 transition-all active:scale-95 shadow-sm"
                                        title="Editar Perfil"
                                    >
                                        <Edit3 size={16} />
                                    </button>


                                    {/* Bottom Info Overlay (Glassmorphism) exactly like image */}
                                    <div className="absolute bottom-3 left-3 right-3 z-20">
                                        <div className="bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/40 dark:border-white/20 rounded-[1.8rem] p-3.5 flex items-center justify-between shadow-lg">
                                            <div className="flex-1 min-w-0 pr-2 pl-2">
                                                <h2 className="text-white text-[17px] font-bold leading-tight truncate">
                                                    {profileData.full_name || 'Seu Nome'}
                                                </h2>
                                                <p className="text-white/80 text-[11px] font-medium tracking-wide truncate mt-0.5">
                                                    {profileData.profession || 'Engenheiro Civil'}
                                                </p>
                                            </div>

                                            <div className="flex gap-2.5 shrink-0">

                                                <div
                                                    onClick={() => setIsProfileExpanded(true)}
                                                    className="w-10 h-10 flex-shrink-0 rounded-full bg-black text-white flex items-center justify-center border border-white/20 cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-md overflow-hidden p-1.5"
                                                    title="Logo da Empresa (Ver Mais)"
                                                >
                                                    {profileData.logo_url ? (
                                                        <img src={profileData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <Building2 size={16} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-black/5 dark:border-white/5">
                                        <h3 className="font-bold text-lg text-foreground">Editar Perfil</h3>
                                        <button onClick={() => setIsProfileExpanded(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors" aria-label="Fechar">
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-800 pb-8">

                                        {/* Avatar & Logo Upload Section (Modern Layout) */}
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                                                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-black/5 dark:border-white/10">
                                                    {profileData.avatar_url ? <img src={profileData.avatar_url} alt="Foto de perfil" className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6 m-auto text-gray-400 mt-4" />}
                                                    {isUploadingAvatar && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white w-4 h-4" /></div>}
                                                </div>
                                                <div className="flex-1">
                                                    <label className="cursor-pointer bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-foreground text-xs font-bold px-4 py-2 rounded-xl transition-colors inline-block">
                                                        Alterar Foto
                                                        <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" disabled={isUploadingAvatar} />
                                                    </label>
                                                    <p className="text-[10px] text-muted-foreground mt-1.5">Foto do seu perfil pessoal</p>
                                                </div>
                                            </div>

                                            {profile?.tier !== 'free' && (
                                                <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                                                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-black/5 dark:border-white/10 p-1">
                                                        {profileData.logo_url ? (
                                                            <img src={profileData.logo_url} alt="Logo empresa" className="w-full h-full object-contain" />
                                                        ) : (
                                                            <Building2 className="w-6 h-6 m-auto text-gray-400 mt-3" />
                                                        )}
                                                        {isUploadingLogo && (
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                <Loader2 className="animate-spin text-white w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold px-4 py-2 rounded-xl transition-colors inline-block">
                                                            Alterar Logo
                                                            <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" disabled={isUploadingLogo} />
                                                        </label>
                                                        <p className="text-[10px] text-muted-foreground mt-1.5">Aparece nos seus relatórios em PDF</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Form Fields Section */}
                                        <div className="space-y-4 bg-white/30 dark:bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-black/5 dark:border-white/5">
                                            <h4 className="text-[10px] font-bold uppercase text-primary/70 tracking-widest flex items-center gap-2 mb-2"><UserIcon size={12} /> Dados Pessoais</h4>
                                            <div className="space-y-3">
                                                <input value={profileData.full_name || ''} onChange={e => setProfileData({ ...profileData, full_name: e.target.value })} placeholder="Nome Completo" className="w-full px-4 py-3 text-sm bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40" />
                                                <input value={profileData.company_name || ''} onChange={e => setProfileData({ ...profileData, company_name: e.target.value })} placeholder="Nome da Empresa (Emissão de laudos)" className="w-full px-4 py-3 text-sm bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40" />
                                                <input value={profileData.profession || ''} onChange={e => setProfileData({ ...profileData, profession: e.target.value })} placeholder="Profissão (Ex: Engenheiro, Arquiteto...)" className="w-full px-4 py-3 text-sm bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40" />

                                                <div className="grid grid-cols-2 gap-3">
                                                    <input
                                                        value={profileData.document_id || ''}
                                                        onChange={e => {
                                                            const numbers = e.target.value.replace(/\D/g, '');
                                                            let formatted = numbers;
                                                            if (numbers.length <= 11) {
                                                                formatted = numbers
                                                                    .replace(/(\d{3})(\d)/, '$1.$2')
                                                                    .replace(/(\d{3})(\d)/, '$1.$2')
                                                                    .replace(/(\d{3})(\d{1,2})/, '$1-$2');
                                                            } else {
                                                                formatted = numbers
                                                                    .replace(/(\d{2})(\d)/, '$1.$2')
                                                                    .replace(/(\d{3})(\d)/, '$1.$2')
                                                                    .replace(/(\d{3})(\d)/, '$1/$2')
                                                                    .replace(/(\d{4})(\d{1,2})/, '$1-$2');
                                                            }
                                                            setProfileData({ ...profileData, document_id: formatted.slice(0, 18) });
                                                        }}
                                                        placeholder="CPF/CNPJ"
                                                        className="w-full px-4 py-3 text-sm bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40"
                                                        maxLength={18}
                                                    />
                                                    <input value={profileData.phone || ''} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} placeholder="WhatsApp/Tel" className="w-full px-4 py-3 text-sm bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 bg-white/30 dark:bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-black/5 dark:border-white/5">
                                            <h4 className="text-[10px] font-bold uppercase text-primary/70 tracking-widest flex items-center gap-2 mb-2"><MapPin size={12} /> Localização</h4>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-3 gap-3">
                                                    <input value={profileData.cep || ''} onChange={e => setProfileData({ ...profileData, cep: e.target.value })} placeholder="CEP" className="col-span-1 w-full px-4 py-3 text-sm bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40" />
                                                    <input value={profileData.city || ''} onChange={e => setProfileData({ ...profileData, city: e.target.value })} placeholder="Sua Cidade" className="col-span-2 w-full px-4 py-3 text-sm bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40" />
                                                </div>
                                                <input value={profileData.address || ''} onChange={e => setProfileData({ ...profileData, address: e.target.value })} placeholder="Bairro, Rua e Complemento" className="w-full px-4 py-3 text-sm bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40" />
                                            </div>
                                        </div>

                                        <div className="space-y-4 bg-white/30 dark:bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-black/5 dark:border-white/5">
                                            <h4 className="text-[10px] font-bold uppercase text-primary/70 tracking-widest flex items-center gap-2 mb-2"><DollarSign size={12} /> Dados de Recebimento</h4>
                                            <div className="space-y-3">
                                                <input value={profileData.pix_key || ''} onChange={e => setProfileData({ ...profileData, pix_key: e.target.value })} placeholder="Chave PIX (Para orçamento)" className="w-full px-4 py-3 text-sm bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40" />
                                                <input value={profileData.bank_name || ''} onChange={e => setProfileData({ ...profileData, bank_name: e.target.value })} placeholder="Nome do Banco (Ex: Nubank)" className="w-full px-4 py-3 text-sm bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40" />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input value={profileData.bank_agency || ''} onChange={e => setProfileData({ ...profileData, bank_agency: e.target.value })} placeholder="Agência" className="w-full px-4 py-3 text-sm bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40" />
                                                    <input value={profileData.bank_account || ''} onChange={e => setProfileData({ ...profileData, bank_account: e.target.value })} placeholder="Conta" className="w-full px-4 py-3 text-sm bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons Pinned Bottom/Or Inside Flow */}
                                        <div className="flex gap-3 pt-4 border-t border-black/5 dark:border-white/5 mt-4">
                                            <button onClick={() => setIsProfileExpanded(false)} className="flex-1 py-3.5 text-xs font-bold text-foreground bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-colors">Cancelar</button>
                                            <button onClick={handleSaveProfile} disabled={isSavingProfile || saveSuccess} className={`flex-1 py-3.5 text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 text-white flex justify-center items-center gap-2 ${saveSuccess ? 'bg-green-500 shadow-green-500/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}>
                                                {isSavingProfile ? <Loader2 className="animate-spin" size={16} /> : saveSuccess ? <><CheckCircle2 size={16} /> Salvo!</> : 'Salvar Alterações'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Subscription Island */}
                        <div className="bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/40 dark:border-white/5 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/50">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sua Assinatura</h4>
                            </div>

                            {subscriptionInfo.status === 'past_due' && (
                                <div className="mb-4 flex items-center gap-2 text-[10px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-2 py-1.5">
                                    <span>⚠️ Pagamento pendente</span>
                                </div>
                            )}

                            {subscriptionInfo.tier !== 'free' ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-2xl font-bold">{subscriptionInfo.daysRemaining ?? '∞'}</span>
                                        <span className="text-[10px] text-muted-foreground mb-1">dias restantes</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${subscriptionInfo.tier === 'business' ? 'bg-[#FF6600]' : 'bg-[#74D2E7]'}`}
                                            style={{ width: `${Math.min(100, ((subscriptionInfo.daysRemaining ?? 365) / 365) * 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <span className={`w-2 h-2 rounded-full ${subscriptionInfo.tier === 'business' ? 'bg-[#FF6600]' : 'bg-[#74D2E7]'}`}></span>
                                            {subscriptionInfo.tier === 'business' ? 'Plano Empresarial' : 'Plano Profissional'}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {subscriptionInfo.periodEnd ? `Renova em ${new Date(subscriptionInfo.periodEnd).toLocaleDateString()}` : 'Vitalícia'}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-border/30 flex flex-col gap-2">
                                        <button
                                            onClick={handleDownloadReceipt}
                                            disabled={isDownloadingReceipt}
                                            className="w-full text-[10px] font-bold flex items-center justify-center gap-2 py-2 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                                            title="Baixar Recibo de Pagamento"
                                        >
                                            <Download size={12} /> {isDownloadingReceipt ? 'Gerando...' : 'Baixar Recibo'}
                                        </button>
                                        {subscriptionInfo.inGuaranteeWindow && (
                                            <button
                                                onClick={handleCancelSubscription}
                                                className="w-full text-[10px] text-red-500 hover:text-red-600 font-bold py-1"
                                            >
                                                Cancelar Assinatura
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 p-1">
                                    <p className="text-xs font-medium">Você está no plano gratuito.</p>
                                    <button
                                        onClick={() => router.push('/planos')}
                                        className="w-full bg-primary text-white text-[10px] font-bold py-2 rounded-lg"
                                    >
                                        Fazer Upgrade
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN WRAPPER */}
                    <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 order-2 lg:order-2">

                        {/* 3 Small Top Islands */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* 1. Total Orçado */}
                            <div className="bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/40 dark:border-white/5 flex flex-col justify-center">
                                <h3 className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2">Total Orçado</h3>
                                <p className="text-3xl font-bold mt-auto pb-4">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalValue)}
                                </p>
                            </div>

                            {/* 2. Custo m2 */}
                            <div className="bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/40 dark:border-white/5 flex flex-col justify-between">
                                <h3 className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Custo do M² de obra</h3>
                                <div className="flex flex-col items-center justify-center mt-4 mb-2 relative z-10">
                                    <span className="text-4xl font-black tracking-tighter text-foreground drop-shadow-sm">
                                        {stats.avgPrice > 0
                                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.avgPrice)
                                            : 'R$ 0'}
                                    </span>
                                </div>
                                {/* Scale Component */}
                                <div className="px-2 mt-auto">
                                    <div className="relative w-full h-[30px]">
                                        <div className="absolute top-[4px] left-0 right-0 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-amber-400 via-purple-500 to-[#10b981] transition-all duration-1000"
                                                style={{ width: `${Math.min(100, Math.max(5, (stats.avgPrice / 4000) * 100))}%` }}
                                            />
                                        </div>
                                        <div className="absolute inset-0 pointer-events-none">
                                            <div className="absolute left-[25%] h-3 w-[2px] bg-[#f59e0b] rounded-full z-10 -translate-x-1/2" />
                                            <div className="absolute left-[50%] h-3 w-[2px] bg-[#a855f7] rounded-full z-10 -translate-x-1/2" />
                                            <div className="absolute left-[80%] h-3 w-[2px] bg-[#10b981] rounded-full z-10 -translate-x-1/2" />
                                            <div
                                                className="absolute top-[-1px] -translate-x-1/2 w-4 h-4 bg-white dark:bg-black rounded-full border-[3px] shadow-sm z-20 transition-all duration-1000"
                                                style={{
                                                    left: `${Math.min(100, Math.max(5, (stats.avgPrice / 4000) * 100))}%`,
                                                    borderColor: stats.avgPrice >= 3000 ? '#10b981' : stats.avgPrice >= 2000 ? '#a855f7' : '#f59e0b'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Tempo */}
                            <div className="bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/40 dark:border-white/5 flex flex-col relative overflow-hidden group">
                                <h3 className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2" title="Baseado em cerca de 4 min de trabalho manual gerado para você em cada item criado de forma automática">Tempo de trabalho poupado</h3>
                                <div className="flex items-baseline gap-1 mt-auto z-10">
                                    <span className="text-4xl font-black tracking-tighter text-foreground drop-shadow-sm">{stats.timeSavedHours > 0 ? stats.timeSavedHours : 0}</span>
                                    <span className="text-sm font-bold text-gray-400">horas</span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-[80px] opacity-40 mix-blend-multiply dark:mix-blend-screen pointer-events-none">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={efficiencyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorWork" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="work" stroke="none" fill="url(#colorWork)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Budget Overview */}
                        <div className="group">
                            <BudgetOverview budgets={budgets} />
                        </div>

                        {/* 2. Seus Orcamentos */}
                        <div className="w-full bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/40 dark:border-white/5 flex flex-col min-h-[400px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Seus Orçamentos</h3>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-muted rounded-xl transition-colors" aria-label="Buscar orçamentos"><Search size={18} className="text-muted-foreground" /></button>
                                </div>
                            </div>

                            <div className="hidden md:grid grid-cols-12 gap-4 px-3 mb-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-2">
                                <div className="col-span-1 text-center">Status</div>
                                <div className="col-span-3">Cliente</div>
                                <div className="col-span-3">Tipo de Obra</div>
                                <div className="col-span-1 text-center">Data</div>
                                <div className="col-span-2 text-right">Total</div>
                                <div className="col-span-2 text-center">Ações</div>
                            </div>

                            <div className="space-y-4">
                                {budgets.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground">
                                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Nenhum orçamento ainda.</p>
                                        <button onClick={handleNewBudget} className="mt-4 text-primary font-bold hover:underline">Criar agora</button>
                                    </div>
                                ) : budgets.map(budget => {
                                    const totalValue = budget.content?.items?.filter((i: any) => i.included).reduce((sum: number, item: any) => sum + ((item.manualPrice ?? item.price) * item.quantity), 0) * (1 + (budget.content?.bdi || 0) / 100) || 0;
                                    const area = budget.content?.projectArea || 0;
                                    const avgPrice = area > 0 ? totalValue / area : 0;
                                    const status = budget.content?.status || 'andamento';

                                    const StatusIcon = status === 'concluido' ? CheckCircle2 : status === 'parado' ? PauseCircle : Clock;
                                    const statusColor = status === 'concluido' ? 'text-green-500' : status === 'parado' ? 'text-red-500' : 'text-yellow-500';

                                    return (
                                        <div
                                            key={budget.id}
                                            onClick={() => router.push(`/editor/${budget.id}`)}
                                            className="group grid grid-cols-12 gap-2 items-center p-3 hover:bg-white dark:hover:bg-white/5 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-black/5 dark:hover:border-white/5 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-none"
                                        >
                                            {/* Status */}
                                            <div className="col-span-1 flex justify-center" onClick={(e) => {
                                                e.stopPropagation();
                                            }}>
                                                <div className="relative group/status cursor-pointer">
                                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${statusColor} bg-current/10 shrink-0 hover:bg-current/20 transition-colors`}>
                                                        <StatusIcon size={18} />
                                                    </div>

                                                    {/* Dropdown status */}
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-36 bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/10 shadow-xl rounded-xl p-1 z-50 opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all">
                                                        {[
                                                            { id: 'parado', label: 'Parado', icon: PauseCircle, color: 'text-red-500' },
                                                            { id: 'andamento', label: 'Andamento', icon: Clock, color: 'text-yellow-500' },
                                                            { id: 'concluido', label: 'Concluído', icon: CheckCircle2, color: 'text-green-500' }
                                                        ].map(s => (
                                                            <button
                                                                key={s.id}
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    const newContent = { ...(budget.content || {}), status: s.id };
                                                                    await supabase.from('budgets').update({ content: newContent }).eq('id', budget.id);
                                                                    setBudgets(prev => prev.map(b => b.id === budget.id ? { ...b, content: newContent } : b));
                                                                }}
                                                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${status === s.id ? s.color : 'text-foreground/70'}`}
                                                            >
                                                                <s.icon size={12} />
                                                                {s.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Name */}
                                            <div className="col-span-3 overflow-hidden">
                                                <h4 className="font-bold text-xs md:text-sm text-foreground truncate">{budget.content?.clientName || budget.title || 'Novo Orçamento'}</h4>
                                            </div>

                                            {/* Type */}
                                            <div className="col-span-3 overflow-hidden">
                                                <p className="text-[10px] text-muted-foreground truncate opacity-70 font-medium">{budget.content?.projectType || 'Obra Residencial'}</p>
                                            </div>

                                            {/* Date */}
                                            <div className="col-span-1 text-center">
                                                <span className="text-[11px] text-muted-foreground opacity-80">{new Date(budget.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                                            </div>

                                            {/* Value */}
                                            <div className="col-span-2 text-right pr-2">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-xs md:text-sm">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                                                    </span>
                                                    <span className="text-[9px] text-muted-foreground opacity-60">
                                                        {avgPrice > 0 ? (
                                                            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(avgPrice) + '/m²'
                                                        ) : ''}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="col-span-2 flex justify-end gap-1 md:gap-2 pr-2">
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/report/${budget.id}`);
                                                }} className="p-2 bg-white dark:bg-white/5 shadow-sm rounded-xl hover:text-blue-500 transition-all border border-black/5 dark:border-white/10 group-hover:scale-105" title="Ver Relatório">
                                                    <FileText size={16} />
                                                </button>
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/editor/${budget.id}`);
                                                }} className="p-2 bg-white dark:bg-white/5 shadow-sm rounded-xl hover:text-primary transition-all border border-black/5 dark:border-white/10 group-hover:scale-105" title="Editar">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteBudget(budget.id);
                                                }} className="p-2 bg-white dark:bg-white/5 shadow-sm rounded-xl hover:text-red-500 transition-all border border-black/5 dark:border-white/10 group-hover:scale-105" title="Excluir">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

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
        </div>
    );
}
