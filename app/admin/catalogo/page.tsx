'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { BOQ_TEMPLATES } from '@/lib/constants';
import {
    ArrowLeft,
    Database,
    UploadCloud,
    Search,
    Save,
    Plus,
    Trash2,
    Loader2,
    CheckCircle2,
    LayoutGrid,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import Link from 'next/link';

type ServiceItem = {
    id: string;
    category: string;
    name: string;
    unit: string;
    price: number;
    description?: string;
    updated_at?: string;
};

export default function AdminCatalog() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);
    const [items, setItems] = useState<ServiceItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.email !== 'maicontinelli@gmail.com') {
            router.push('/');
            return;
        }
        setIsAdmin(true);
        loadData();
    };

    const loadData = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('category', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erro ao carregar catálogo.' });
        } else {
            setItems(data || []);
        }
        setIsLoading(false);
    };

    const handleSeed = async () => {
        if (!confirm('Isso irá sobreescrever os itens existentes com os dados do arquivo "constants.ts". Tem certeza?')) return;

        setIsSeeding(true);
        setMessage(null);

        try {
            const allItems: ServiceItem[] = [];

            // Flatten the BOQ_TEMPLATES dictionary
            BOQ_TEMPLATES.obra_nova.forEach(cat => {
                cat.items.forEach(item => {
                    allItems.push({
                        id: item.id,
                        category: cat.name,
                        name: item.name,
                        unit: item.unit,
                        price: item.price,
                        description: `Importado de constants.ts`
                    });
                });
            });

            // Upsert in batches of 50 to avoid limits
            const batchSize = 50;
            for (let i = 0; i < allItems.length; i += batchSize) {
                const batch = allItems.slice(i, i + batchSize);
                const { error } = await supabase.from('services').upsert(batch);
                if (error) throw error;
            }

            setMessage({ type: 'success', text: `Sucesso! ${allItems.length} itens sincronizados.` });
            loadData();
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: `Erro na sincronização: ${error.message}` });
        } finally {
            setIsSeeding(false);
        }
    };

    const handleClearObsolete = async () => {
        if (!confirm('Isso irá remover DEFINITIVAMENTE todos os itens das categorias removidas (19, 20, 21, 23, 24). Tem certeza?')) return;

        setIsSeeding(true);
        setMessage(null);

        try {
            const obsoletePrefixes = ['19.', '20.', '21.', '23.', '24.'];
            let deletedCount = 0;

            for (const prefix of obsoletePrefixes) {
                const { count, error } = await supabase
                    .from('services')
                    .delete({ count: 'exact' })
                    .ilike('category', `${prefix}%`);

                if (error) throw error;
                if (count) deletedCount += count;
            }

            setMessage({ type: 'success', text: `Limpeza concluída! ${deletedCount} itens obsoletos removidos.` });
            loadData();
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: `Erro na limpeza: ${error.message}` });
        } finally {
            setIsSeeding(false);
        }
    };

    const handleUpdatePrice = async (id: string, newPrice: string) => {
        const price = parseFloat(newPrice.replace('R$', '').replace('.', '').replace(',', '.').trim());
        if (isNaN(price)) return;

        const { error } = await supabase
            .from('services')
            .update({ price, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            setMessage({ type: 'error', text: 'Erro ao atualizar preço.' });
        } else {
            // Optimistic update
            setItems(items.map(i => i.id === id ? { ...i, price } : i));
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isAdmin) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100">
            {/* Header matches Admin Dashboard */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Database className="text-orange-500" />
                            Gerenciador de Catálogo
                        </h1>
                        <p className="text-xs text-gray-500">Base de Preços Oficiais</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleClearObsolete}
                        disabled={isSeeding}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        title="Remove categorias 19, 20, 21, 23, 24"
                    >
                        {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        Limpar Obsoletos
                    </button>
                    <button
                        onClick={handleSeed}
                        disabled={isSeeding}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                        Sincronizar (Seed)
                    </button>
                    <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-white dark:ring-gray-900">
                        AD
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-6 max-w-7xl">
                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar serviço ou categoria..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="bg-white dark:bg-gray-900 px-3 py-1 rounded border border-gray-200 dark:border-gray-800 font-mono">
                            {items.length} itens
                        </div>
                        no banco de dados
                    </div>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                        <span className="text-sm font-medium">{message.text}</span>
                        <button onClick={() => setMessage(null)} className="ml-auto hover:opacity-70"><RefreshCw size={14} /></button>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-orange-500" />
                        <p>Carregando catálogo...</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="p-4 pl-6 w-20">ID</th>
                                        <th className="p-4">Serviço / Descrição</th>
                                        <th className="p-4">Categoria</th>
                                        <th className="p-4 w-20 text-center">Un.</th>
                                        <th className="p-4 w-40 text-right pr-6">Preço Unit.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                            <td className="p-4 pl-6 font-mono text-xs text-gray-400">
                                                {item.id}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-900 dark:text-white">{item.name}</div>
                                                {item.description && <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs font-medium uppercase tracking-wide">
                                                    {item.category.replace(/^\d+\.\s*/, '')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center font-mono text-xs text-gray-500">
                                                {item.unit}
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <div className="relative group/price">
                                                    <input
                                                        type="number"
                                                        defaultValue={item.price}
                                                        onBlur={(e) => handleUpdatePrice(item.id, e.target.value)}
                                                        className="w-full text-right bg-transparent border-b border-transparent hover:border-orange-300 focus:border-orange-500 focus:outline-none font-mono font-medium text-gray-900 dark:text-gray-200 py-1 transition-colors"
                                                        step="0.01"
                                                    />
                                                    <span className="absolute right-0 -bottom-4 text-[9px] text-green-600 opacity-0 group-focus-within/price:opacity-100 transition-opacity">
                                                        Enter para salvar
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
