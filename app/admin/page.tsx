'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
    Users,
    FileText,
    Search,
    ArrowLeft,
    Download,
    Loader2,
    Building2,
    Calendar,
    CheckCircle2,
    XCircle,
    LayoutDashboard,
    MapPin
} from 'lucide-react';
import Link from 'next/link';

// Types
type Profile = {
    id: string;
    email: string;
    full_name: string;
    created_at: string;
    subscription_tier?: string;
    company_name?: string;
    profession?: string;
    phone?: string;
    city?: string;
    state?: string;
    registration_number?: string;
    team_size?: string;
};

type Lead = {
    id: string;
    created_at: string;
    updated_at: string;
    client_name: string;
    client_phone: string;
    project_type: string;
    status: string;
    title: string;
    user_id: string;
    user_email?: string; // We will join this manually or via view
};

type AnonymousLead = {
    id: string;
    created_at: string;
    provider_name: string;
    provider_phone: string;
    client_name: string;
    client_phone: string;
    project_type: string;
    work_city: string;
    work_state: string;
    origin: string;
};

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'users' | 'leads' | 'anonymous'>('leads');
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<Profile[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [anonymousLeads, setAnonymousLeads] = useState<AnonymousLead[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.email !== 'maicontinelli@gmail.com') {
            router.push('/'); // Kick out non-admins
            return;
        }
        setIsAdmin(true);
        loadData();
    };

    const loadData = async () => {
        setLoading(true);

        // Load Users
        const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (profiles) setUsers(profiles);

        // Load Leads (Budgets)
        // We also want to know WHICH user created the lead, so we'll fetch profiles too map them
        const { data: budgets } = await supabase
            .from('budgets')
            .select('*')
            .order('updated_at', { ascending: false });

        if (budgets) {
            // Map user emails to leads
            const enrichedLeads = budgets.map(b => ({
                ...b,
                user_email: profiles?.find(p => p.id === b.user_id)?.email || 'Unknown'
            }));
            setLeads(enrichedLeads);
        }

        // Load Anonymous Leads
        const { data: anon } = await supabase
            .from('anonymous_leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (anon) setAnonymousLeads(anon);

        setLoading(false);
    };

    const filteredLeads = leads.filter(l =>
        (l.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (l.project_type?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (l.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    );

    const filteredUsers = users.filter(u =>
        (u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    );

    const filteredAnonymous = anonymousLeads.filter(a =>
        (a.provider_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (a.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (a.project_type?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    );

    if (!isAdmin) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 font-sans">
            {/* Sidebar / Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <LayoutDashboard className="text-primary" />
                            Admin Panel
                        </h1>
                        <p className="text-xs text-gray-500">Gestão de Leads e Usuários</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/catalogo" className="p-2 text-primary hover:bg-primary/10 rounded-lg text-sm font-medium flex items-center gap-2 mr-2">
                        <Building2 size={16} />
                        Gerenciar Catálogo
                    </Link>
                    <button onClick={loadData} className="p-2 text-primary hover:bg-primary/10 rounded-lg text-sm font-medium">
                        Atualizar
                    </button>
                    <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        AD
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-6 max-w-7xl">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Leads (Usuários)</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{leads.length}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <FileText size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 border-l-4 border-l-teal-600">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Leads Externos</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{anonymousLeads.length}</h3>
                            </div>
                            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                                <Search size={20} />
                            </div>
                        </div>
                        <p className="text-xs text-teal-700 mt-2 font-bold">
                            Sem cadastro
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Usuários Cadastrados</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</h3>
                            </div>
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <Users size={20} />
                            </div>
                        </div>
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            Base crescendo
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Valor Potencial (Estimado)</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">R$ --</h3>
                            </div>
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <Building2 size={20} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Soma total de orçamentos (Em breve)
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[500px]">
                    {/* Toolbar */}
                    <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-auto">
                            <button
                                onClick={() => setActiveTab('leads')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'leads' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Leads de Obras
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Usuários
                            </button>
                            <button
                                onClick={() => setActiveTab('anonymous')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'anonymous' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Leads Externos
                            </button>
                        </div>

                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="p-0">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="animate-spin text-primary w-8 h-8" />
                            </div>
                        ) : activeTab === 'leads' ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="p-4 pl-6">Cliente Final</th>
                                            <th className="p-4">Tipo / Região</th>
                                            <th className="p-4">Contato (Tel)</th>
                                            <th className="p-4">Criado Por</th>
                                            <th className="p-4">Data</th>
                                            <th className="p-4 pr-6 text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {filteredLeads.map((lead) => {
                                            const ddd = lead.client_phone?.match(/\(?([1-9]{2})\)?/)?.[1];
                                            return (
                                                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <td className="p-4 pl-6">
                                                        <div className="font-bold text-gray-900 dark:text-white">{lead.client_name || 'Não informado'}</div>
                                                        <div className="text-xs text-gray-400">{lead.title}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-1 items-start">
                                                            {lead.project_type && (
                                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase tracking-wide border border-blue-100">
                                                                    {lead.project_type}
                                                                </span>
                                                            )}
                                                            {ddd && (
                                                                <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                                                    <MapPin size={10} /> Região {ddd}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-gray-600 dark:text-gray-300 text-xs font-mono">
                                                        {lead.client_phone || '-'}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                                {lead.user_email?.[0]?.toUpperCase()}
                                                            </div>
                                                            <span className="text-gray-600 dark:text-gray-400 truncate max-w-[150px] text-xs" title={lead.user_email}>
                                                                {lead.user_email}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-gray-400 text-xs">
                                                        {new Date(lead.updated_at).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td className="p-4 pr-6 text-right">
                                                        <Link href={`/report/${lead.id}`} className="text-primary hover:underline font-medium text-xs">
                                                            Ver
                                                        </Link>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : activeTab === 'users' ? (
                            // USERS TABLE
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="p-4 pl-6">Nome / Email</th>
                                            <th className="p-4">Profissão / Registro</th>
                                            <th className="p-4">Localização</th>
                                            <th className="p-4">Empresa / Equipe</th>
                                            <th className="p-4">Contato</th>
                                            <th className="p-4 pr-6 text-right">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="p-4 pl-6">
                                                    <div className="font-bold text-gray-900 dark:text-white">{user.full_name || 'Sem nome'}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">{user.profession || '-'}</div>
                                                    {user.registration_number && (
                                                        <div className="text-xs text-gray-500 font-mono">Reg: {user.registration_number}</div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {(user.city || user.state) ? (
                                                        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                                                            <MapPin size={14} className="text-gray-400" />
                                                            {user.city}{user.state ? `, ${user.state}` : ''}
                                                        </div>
                                                    ) : <span className="text-gray-400">-</span>}
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">{user.company_name || '-'}</div>
                                                    {user.team_size && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                                            {user.team_size}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-xs font-mono text-gray-600 dark:text-gray-400">
                                                    {user.phone || '-'}
                                                </td>
                                                <td className="p-4 pr-6 text-right text-xs text-gray-400">
                                                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            // ANONYMOUS LEADS TABLE
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-teal-50 dark:bg-teal-950/20 text-teal-800 dark:text-teal-500 font-medium border-b border-teal-100 dark:border-teal-900">
                                        <tr>
                                            <th className="p-4 pl-6">Prestador (Sem cadastro)</th>
                                            <th className="p-4">Cliente / Obra Captada</th>
                                            <th className="p-4">Local da Obra</th>
                                            <th className="p-4 text-right pr-6">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {filteredAnonymous.map((lead) => (
                                            <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="p-4 pl-6">
                                                    <div className="font-bold text-gray-900 dark:text-white">{lead.provider_name || 'Anônimo'}</div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 font-mono mt-0.5">
                                                        <CheckCircle2 size={12} className="text-green-500" />
                                                        {lead.provider_phone || '-'}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">{lead.client_name || '-'}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                                        <span>{lead.project_type}</span>
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                        <span className="font-mono">{lead.client_phone}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {(lead.work_city || lead.work_state) ? (
                                                        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 w-fit px-2 py-1 rounded">
                                                            <MapPin size={14} className="text-gray-500" />
                                                            {lead.work_city}{lead.work_state ? `, ${lead.work_state}` : ''}
                                                        </div>
                                                    ) : <span className="text-gray-400">-</span>}
                                                </td>
                                                <td className="p-4 pr-6 text-right text-xs text-gray-400">
                                                    {new Date(lead.created_at).toLocaleDateString('pt-BR')} <br />
                                                    {new Date(lead.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
