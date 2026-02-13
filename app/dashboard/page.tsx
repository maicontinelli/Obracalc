'use client';

import React, { useEffect, useState } from 'react';
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
    BarChart3,
    DollarSign,
    Mail
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { BudgetOverview } from '@/components/dashboard/BudgetOverview';



interface Budget {
    id: string;
    title: string;
    updated_at: string;
    content: any;
    user_id?: string;
    created_at?: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const supabase = createClient();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [showToast, setShowToast] = useState(false);

    // Simple Stats
    const [stats, setStats] = useState({
        totalBudgets: 0,
        totalValue: 0
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
    }>({
        tier: 'free',
        periodEnd: null,
        daysRemaining: null
    });

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

                    setSubscriptionInfo({
                        tier,
                        periodEnd: dbProfile.current_period_end,
                        daysRemaining
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
                        daysRemaining: null
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

                    setStats({
                        totalBudgets: budgetsData.length,
                        totalValue: totalVal
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
        if (!profile || profile.tier === 'free') {
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

                {/* 1. Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-medium text-foreground tracking-tight">
                            Olá, {profileData.full_name?.split(' ')[0] || 'Parceiro'}
                        </h1>
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
                            className="bg-white dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-white/10 text-foreground border border-border px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all active:scale-95 text-xs shadow-sm"
                        >
                            <Plus size={16} className="text-primary" />
                            <span>Novo Orçamento</span>
                        </button>
                    </div>
                </div>

                {/* 2. Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Col 1: Profile (Lg: 3/12) */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                        <div className="bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl rounded-[2rem] p-4 shadow-sm border border-white/40 dark:border-white/5 relative overflow-hidden group">
                            {/* Simple Profile Logic Reused */}
                            {/* Profile Card Content - Toggles between View and Edit to allow full height */}
                            {!isProfileExpanded ? (
                                <>
                                    <div className="flex flex-col items-center pt-4 pb-6">
                                        {/* Circular Profile Photo */}
                                        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4 ring-4 ring-white/50 dark:ring-white/10 shadow-lg">
                                            {profileData.avatar_url ? (
                                                <img src={profileData.avatar_url} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <UserIcon size={48} strokeWidth={1} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Profile Info */}
                                        <div className="text-center mb-4">
                                            <h2 className="text-xl font-bold text-foreground mb-1">{profileData.full_name || 'Seu Nome'}</h2>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{profileData.profession || 'Profissional'}</p>
                                        </div>

                                        {/* Edit Button */}
                                        <button
                                            onClick={() => setIsProfileExpanded(true)}
                                            className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-full transition-colors text-sm font-medium flex items-center gap-2"
                                        >
                                            <Edit3 size={14} />
                                            Editar Perfil
                                        </button>
                                    </div>

                                    <div className="mt-4 px-2 space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Phone size={14} className="text-gray-700 dark:text-gray-300" />
                                            <span className="truncate">{profileData.phone || 'Sem telefone'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <MapPin size={14} className="text-gray-700 dark:text-gray-300" />
                                            <span className="truncate">
                                                {profileData.city ? `${profileData.city} - ${profileData.state}` : 'Localização não definida'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Briefcase size={14} className="text-gray-700 dark:text-gray-300" />
                                            <span className="truncate">{profileData.company_name || 'Sem empresa'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Mail size={14} className="text-gray-700 dark:text-gray-300" />
                                            <span className="truncate">{user?.email || 'Sem email'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <FileText size={14} className="text-gray-700 dark:text-gray-300" />
                                            <span className="truncate">{profileData.document_id || 'CPF/CNPJ não informado'}</span>
                                        </div>
                                    </div>


                                </>
                            ) : (
                                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-border/50">
                                        <h3 className="font-bold text-lg">Editar Perfil</h3>
                                        <button onClick={() => setIsProfileExpanded(false)} className="text-muted-foreground hover:text-foreground p-1" aria-label="Fechar edição de perfil">
                                            <ChevronDown className="rotate-180" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Avatar Upload in Edit Mode */}
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                                                {profileData.avatar_url ? <img src={profileData.avatar_url} alt="Foto de perfil" className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 m-auto text-gray-400" />}
                                                {isUploadingAvatar && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white w-4 h-4" /></div>}
                                            </div>
                                            <label className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                                                Alterar Foto
                                                <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" disabled={isUploadingAvatar} />
                                            </label>
                                        </div>

                                        {/* Logo Upload (Paid Users Only) */}
                                        {profile?.tier !== 'free' && (
                                            <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                                                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-border/50">
                                                    {profileData.logo_url ? (
                                                        <img src={profileData.logo_url} alt="Logo empresa" className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <Building2 className="w-6 h-6 m-auto text-gray-400" />
                                                    )}
                                                    {isUploadingLogo && (
                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                            <Loader2 className="animate-spin text-white w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors inline-block w-fit">
                                                        Sua Logo Própria
                                                        <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" disabled={isUploadingLogo} />
                                                    </label>
                                                    <p className="text-[9px] text-muted-foreground italic leading-tight">Para o cabeçalho do relatório</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1"><UserIcon size={10} /> Dados Pessoais</h4>
                                            <input value={profileData.full_name} onChange={e => setProfileData({ ...profileData, full_name: e.target.value })} placeholder="Nome Completo" className="w-full p-2.5 text-sm bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-primary/50" />
                                            <input value={profileData.profession} onChange={e => setProfileData({ ...profileData, profession: e.target.value })} placeholder="Profissão (Ex: Eng. Civil)" className="w-full p-2.5 text-sm bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-primary/50" />

                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    value={profileData.document_id}
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
                                                    className="w-full p-2.5 text-sm bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-primary/50"
                                                    maxLength={18}
                                                />
                                                <input value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} placeholder="Telefone" className="w-full p-2.5 text-sm bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-primary/50" />
                                            </div>

                                            <h4 className="text-[10px] font-bold uppercase text-muted-foreground mt-2 flex items-center gap-1"><MapPin size={10} /> Endereço</h4>
                                            <div className="grid grid-cols-3 gap-2">
                                                <input value={profileData.cep || ''} onChange={e => setProfileData({ ...profileData, cep: e.target.value })} placeholder="CEP" className="col-span-1 w-full p-2.5 text-sm bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-primary/50" />
                                                <input value={profileData.city} onChange={e => setProfileData({ ...profileData, city: e.target.value })} placeholder="Cidade" className="col-span-2 w-full p-2.5 text-sm bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-primary/50" />
                                            </div>
                                            <input value={profileData.address || ''} onChange={e => setProfileData({ ...profileData, address: e.target.value })} placeholder="Endereço (Rua, Nº, Bairro)" className="w-full p-2.5 text-sm bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-primary/50" />

                                            <input value={profileData.company_name} onChange={e => setProfileData({ ...profileData, company_name: e.target.value })} placeholder="Nome da Empresa (Opcional)" className="w-full p-2.5 text-sm bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-primary/50" />

                                            <h4 className="text-[10px] font-bold uppercase text-muted-foreground mt-2 flex items-center gap-1"><DollarSign size={10} /> Dados Bancários</h4>
                                            <input value={profileData.pix_key} onChange={e => setProfileData({ ...profileData, pix_key: e.target.value })} placeholder="Chave PIX" className="w-full p-2.5 text-sm bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-primary/50" />
                                            <input value={profileData.bank_name} onChange={e => setProfileData({ ...profileData, bank_name: e.target.value })} placeholder="Nome do Banco" className="w-full p-2.5 text-sm bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-primary/50" />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input value={profileData.bank_agency} onChange={e => setProfileData({ ...profileData, bank_agency: e.target.value })} placeholder="Agência" className="w-full p-2.5 text-sm bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-primary/50" />
                                                <input value={profileData.bank_account} onChange={e => setProfileData({ ...profileData, bank_account: e.target.value })} placeholder="Conta" className="w-full p-2.5 text-sm bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-primary/50" />
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <button onClick={() => setIsProfileExpanded(false)} className="flex-1 py-3 text-sm font-bold text-[#E9813C] hover:bg-[#E9813C]/10 rounded-full transition-colors">Cancelar</button>
                                            <button onClick={handleSaveProfile} disabled={isSavingProfile || saveSuccess} className={`flex-1 py-3 font-bold rounded-full shadow-lg transition-all active:scale-95 text-white ${saveSuccess ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20' : 'bg-[#E9813C] hover:bg-[#d46d2a] shadow-[#E9813C]/20 hover:shadow-[#E9813C]/40'}`}>
                                                {isSavingProfile ? <Loader2 className="animate-spin m-auto" /> : saveSuccess ? 'Salvo!' : 'Salvar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Col 2: Info & Budgets */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-6">

                        {/* Top Row: Insights Placeholder */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/40 dark:border-white/5 flex flex-col justify-between min-h-[160px]">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Orçado</h3>
                                    <p className="text-3xl font-bold">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalValue)}
                                    </p>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Acumulado em {stats.totalBudgets} orçamentos
                                </div>
                            </div>
                            <div className="bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/40 dark:border-white/5 flex flex-col justify-between min-h-[160px] relative overflow-hidden">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sua Assinatura</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${subscriptionInfo.tier === 'business' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                            subscriptionInfo.tier === 'pro' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                            }`}>
                                            {subscriptionInfo.tier === 'business' ? 'Empresarial' :
                                                subscriptionInfo.tier === 'pro' ? 'Profissional' : 'Grátis'}
                                        </span>
                                    </div>

                                    {subscriptionInfo.tier !== 'free' ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-3xl font-bold">{subscriptionInfo.daysRemaining ?? '∞'}</span>
                                                <span className="text-xs text-muted-foreground mb-1">dias restantes</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${subscriptionInfo.tier === 'business' ? 'bg-purple-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${Math.min(100, ((subscriptionInfo.daysRemaining ?? 365) / 365) * 100)}%` }}
                                                    role="progressbar"
                                                    aria-valuenow={subscriptionInfo.daysRemaining ?? 365}
                                                    aria-valuemin={0}
                                                    aria-valuemax={365}
                                                    aria-label="Dias restantes da assinatura"
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                {subscriptionInfo.periodEnd
                                                    ? `Renova em ${new Date(subscriptionInfo.periodEnd).toLocaleDateString()}`
                                                    : 'Assinatura Vitalícia / Admin'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 mt-1">
                                            <p className="text-xl font-bold text-foreground">Aproveite mais</p>
                                            <button
                                                onClick={() => router.push('/planos')}
                                                className="text-xs bg-black dark:bg-white text-white dark:text-black px-3 py-2 rounded-lg font-bold hover:opacity-80 transition-opacity w-full"
                                            >
                                                Ver Planos
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Middle Row: Charts & Insights */}
                        <BudgetOverview budgets={budgets} />

                    </div>
                </div>

                {/* 3. Budgets List (Full Width) */}
                <div className="w-full bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/40 dark:border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-medium text-lg">Seus Orçamentos</h3>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-muted rounded-xl transition-colors" aria-label="Buscar orçamentos"><Search size={18} className="text-muted-foreground" /></button>
                        </div>
                    </div>

                    <div className="hidden md:grid grid-cols-12 gap-4 px-3 mb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        <div className="col-span-6 pl-16">Obra / Cliente</div>
                        <div className="col-span-4 text-right pr-4">Valor Total</div>
                        <div className="col-span-2 text-center">Ações</div>
                    </div>

                    <div className="space-y-4">
                        {budgets.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Nenhum orçamento ainda.</p>
                                <button onClick={handleNewBudget} className="mt-4 text-primary font-bold hover:underline">Criar agora</button>
                            </div>
                        ) : budgets.map(budget => (
                            <div
                                key={budget.id}
                                onClick={() => router.push(`/editor/${budget.id}`)}
                                className="group grid grid-cols-12 gap-2 items-center p-3 hover:bg-muted/30 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-black/5 dark:hover:border-white/5"
                            >
                                {/* Name */}
                                <div className="col-span-5 md:col-span-6 flex items-center gap-2 md:gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                                        {budget.content?.clientName ? <span className="font-bold text-sm md:text-lg uppercase">{budget.content.clientName.charAt(0)}</span> : <Building2 size={20} className="md:w-6 md:h-6" />}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-xs md:text-sm text-foreground truncate">{budget.content?.clientName || budget.title || 'Sem título'}</h4>
                                        <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
                                            <span>{new Date(budget.updated_at).toLocaleDateString()}</span>
                                            <span className="hidden md:inline">•</span>
                                            <span className="hidden md:inline">{budget.content?.items?.length || 0} itens</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Value */}
                                <div className="col-span-3 md:col-span-4 flex justify-end md:justify-end pr-2 md:pr-4 font-bold text-xs md:text-sm truncate">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                        budget.content?.items?.filter((i: any) => i.included).reduce((sum: number, item: any) => sum + ((item.manualPrice ?? item.price) * item.quantity), 0) * (1 + (budget.content?.bdi || 0) / 100) || 0
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="col-span-4 md:col-span-2 flex justify-end gap-1 md:gap-2">
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/report/${budget.id}`);
                                    }} className="p-2 bg-white dark:bg-white/10 dark:text-gray-200 shadow-sm rounded-xl hover:text-blue-500 dark:hover:text-blue-400 transition-colors border border-black/5 dark:border-white/10 dark:hover:bg-white/20" title="Ver Relatório">
                                        <FileText size={16} />
                                    </button>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/editor/${budget.id}`);
                                    }} className="p-2 bg-white dark:bg-white/10 dark:text-gray-200 shadow-sm rounded-xl hover:text-primary dark:hover:text-orange-400 transition-colors border border-black/5 dark:border-white/10 dark:hover:bg-white/20" title="Editar">
                                        <Edit3 size={16} />
                                    </button>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteBudget(budget.id);
                                    }} className="p-2 bg-white dark:bg-white/10 dark:text-gray-200 shadow-sm rounded-xl hover:text-red-500 dark:hover:text-red-400 transition-colors border border-black/5 dark:border-white/10 dark:hover:bg-white/20" title="Excluir">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
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
