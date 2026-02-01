'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, Loader2, FilePlus, AlertTriangle, BrainCircuit, Map, Camera, ArrowRight, Plus, ScanEye, Calculator } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BOQ_TEMPLATES } from '@/lib/constants';
import imageCompression from 'browser-image-compression';

type SuggestedItem = {
    name: string;
    unit: string;
    quantity: number;
    price: number;
    category: string;
    included?: boolean;
    type?: 'material' | 'service' | 'equipment';
};

type SuggestedBudget = {
    title: string;
    items: SuggestedItem[];
};

type AiResponse = {
    text: string;
    suggestedBudget?: SuggestedBudget | null;
    clarificationRequest?: string;
    error?: string;
};

export default function AiAssistant() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<AiResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showToolsMenu, setShowToolsMenu] = useState(false);

    // Clarification State
    const [isClarifying, setIsClarifying] = useState(false);
    const [previousQuery, setPreviousQuery] = useState('');
    const [clarificationQuestion, setClarificationQuestion] = useState<string | null>(null);

    const responseRef = useRef<HTMLDivElement>(null);
    const toolsRef = useRef<HTMLDivElement>(null);

    // Close tools menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
                setShowToolsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Local Search Effect
    useEffect(() => {
        if (!query.trim() || response) {
            setFilteredItems([]);
            return;
        }

        const fetchSuggestions = async () => {
            // Dynamic import to avoid SSR issues if any, or just standard import usage
            const { getCatalogItems } = await import('@/lib/catalog-service');
            const allItems = await getCatalogItems();

            const lowerQuery = query.toLowerCase();
            const matches = allItems
                .filter(item => item.name.toLowerCase().includes(lowerQuery))
                .slice(0, 50);

            setFilteredItems(matches);
            setShowSuggestions(true);
        };

        const timeoutId = setTimeout(fetchSuggestions, 150); // Debounce
        return () => clearTimeout(timeoutId);
    }, [query, response]);

    const handleLocalItemSelect = async (item: any) => {
        const newId = crypto.randomUUID();

        // Fetch full catalog to ensure we have all items available in the editor
        const { getCatalogItems } = await import('@/lib/catalog-service');
        const catalog = await getCatalogItems();

        // Create full budget structure with just this item emphasized/included
        const allItems = catalog.map((tItem: any) => ({
            id: tItem.id === item.id ? item.id : tItem.id, // Keep ID consistent
            name: tItem.name,
            unit: tItem.unit,
            price: tItem.price,
            category: tItem.category,
            included: tItem.name === item.name, // Only include the selected item initially
            quantity: tItem.name === item.name ? 1 : 0,
        }));

        const budgetData = {
            id: newId,
            title: `Orçamento: ${item.name}`,
            client: '',
            phone: '',
            date: new Date().toISOString(),
            items: allItems,
            bdi: 12,
            aiRequests: [],
            focusItemId: item.id // Signal Editor to focus this item
        };

        localStorage.setItem(`estimate_${newId}`, JSON.stringify(budgetData));
        router.push(`/editor/${newId}?type=obra_nova`);
    };

    // Scroll to response when it appears (only halfway)
    useEffect(() => {
        if (response && responseRef.current) {
            setTimeout(() => {
                const element = responseRef.current;
                if (element) {
                    const elementRect = element.getBoundingClientRect();
                    const absoluteElementTop = elementRect.top + window.pageYOffset;
                    const scrollDistance = absoluteElementTop - window.pageYOffset;
                    const halfwayScroll = scrollDistance / 2;

                    window.scrollBy({
                        top: halfwayScroll,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }, [response]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setResponse(null);
        setError(null);

        // Calculate message to send (Context + Answer if clarifying)
        let messageToSend = query;
        if (isClarifying) {
            messageToSend = `CONTEXTO ANTERIOR: ${previousQuery} | RESPOSTA DO USUÁRIO: ${query}`;
        }

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageToSend }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao comunicar com a IA');
            }

            // Check if AI is asking for clarification
            if (data.clarificationRequest) {
                setClarificationQuestion(data.clarificationRequest);
                setIsClarifying(true);

                // Save context if this is the first clarification step
                if (!isClarifying) {
                    setPreviousQuery(query);
                }

                setQuery(''); // Clear input for user to answer

                // Focus input again
                setTimeout(() => {
                    const textarea = document.getElementById('search-textarea');
                    if (textarea) textarea.focus();
                }, 100);
            } else {
                // Success - Budget generated
                setResponse(data);
                setIsClarifying(false);
                setClarificationQuestion(null);
                setPreviousQuery('');
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Ocorreu um erro inesperado.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateBudget = () => {
        if (!response?.suggestedBudget) return;

        const newId = crypto.randomUUID();
        const aiRequestId = crypto.randomUUID();

        // Load default template items
        const template = BOQ_TEMPLATES.obra_nova;

        // Create default items from template (all unchecked)
        const defaultItems = template.flatMap((cat: any) =>
            cat.items.map((item: any) => ({
                id: crypto.randomUUID(),
                ...item,
                category: cat.name,
                included: false,
                quantity: 0,
            }))
        );

        // Create target category name from title or query (Single Group Logic)
        const targetCategory = (response.suggestedBudget.title || query || 'ORÇAMENTO PERSONALIZADO').toUpperCase();

        // Create AI-suggested items
        const aiItems = response.suggestedBudget.items.map(item => ({
            id: crypto.randomUUID(),
            ...item,
            included: item.included !== undefined ? item.included : true, // Use AI suggestion or default to true
            isCustom: true,
            category: targetCategory, // Force single group
            aiRequestId: aiRequestId // Link items to this AI request
        }));

        // Merge: AI items first, then default items
        const allItems = [...aiItems, ...defaultItems];

        const budgetData = {
            id: newId,
            title: response.suggestedBudget.title,
            client: '',
            phone: '',
            date: new Date().toISOString(),
            items: allItems,
            bdi: 12,
            aiRequests: [{
                id: aiRequestId,
                query: query, // Save the original user query
                guidance: response.text, // Save the AI response as guidance
                timestamp: new Date().toISOString()
            }]
        };

        localStorage.setItem(`estimate_${newId}`, JSON.stringify(budgetData));
        router.push(`/editor/${newId}?type=obra_nova`); // Default to obra_nova layout but with custom items
    };

    const [placeholder, setPlaceholder] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    const phrases = [
        "Comece descrevendo o que precisa executar",
        "Pode ser algo como: quero fazer uma laje de 20 m².",
        "Informe as dimensões da obra, e a gente transforma isso em um orçamento organizado.",
        "Tudo fica claro e fácil de apresentar ao cliente: seu orçamento sai em formato de relatório.",
        "Comece grátis, evolua quando achar necessário",
        "Salve seus orçamentos para editar depois, exporte no formato que preferir Word, Excel ou PDF"
    ];

    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % phrases.length;
            const fullText = phrases[i];

            setPlaceholder(isDeleting
                ? fullText.substring(0, placeholder.length - 1)
                : fullText.substring(0, placeholder.length + 1)
            );

            // Faster typing speeds: 50ms typing, 20ms deleting
            setTypingSpeed(isDeleting ? 20 : 50);

            if (!isDeleting && placeholder === fullText) {
                setTimeout(() => setIsDeleting(true), 2600); // Wait before deleting
            } else if (isDeleting && placeholder === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [placeholder, isDeleting, loopNum, typingSpeed]);

    return (
        <div className="w-full max-w-2xl mx-auto mt-0 mb-8">
            <div className="relative z-50">
                <form onSubmit={handleSearch} className="relative z-10 w-full">
                    <div
                        className="relative flex flex-col w-full rounded-3xl transition-all duration-300
                            bg-white dark:bg-[#1A1A1A]/90
                            shadow-[0_4px_20px_rgba(0,0,0,0.08)]
                            border border-[#FF6600]/50
                            hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)]
                            focus-within:ring-2 focus-within:ring-[#FF6600]/20 focus-within:border-[#FF6600]
                            focus-within:ring-2 focus-within:ring-[#FF6600]/20 focus-within:border-[#FF6600]
                            cursor-text"
                        style={{ minHeight: '120px' }}
                        onClick={() => {
                            // Focus the textarea when clicking anywhere on the container
                            const textarea = document.getElementById('search-textarea');
                            if (textarea) textarea.focus();
                        }}
                    >
                        {isClarifying && clarificationQuestion && (
                            <div className="mx-6 mt-6 mb-2 flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="p-2 bg-[#FF6600]/10 text-[#FF6600] rounded-full shrink-0">
                                    <Sparkles size={20} />
                                </div>
                                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm text-sm text-gray-800 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <p className="font-semibold text-xs text-[#FF6600] mb-1">Preciso de um detalhe:</p>
                                    {clarificationQuestion}
                                </div>
                            </div>
                        )}

                        {/* Input Area - Top Aligned */}
                        <textarea
                            id="search-textarea"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSearch(e);
                                }
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            placeholder={isClarifying ? "Digite sua resposta..." : (isDeleting ? "" : placeholder)}
                            className="w-full px-6 pt-6 pb-16 rounded-3xl border-none outline-none bg-transparent text-lg text-gray-800 dark:text-gray-100 placeholder:text-sm placeholder-gray-500 dark:placeholder-gray-400 font-medium resize-none overflow-hidden"
                            rows={1}
                            style={{ minHeight: '80px' }}
                        />

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="vision-upload"
                            onChange={async (e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    const file = e.target.files[0];
                                    try {
                                        const options = {
                                            maxSizeMB: 1,
                                            maxWidthOrHeight: 1920,
                                            useWebWorker: true,
                                            initialQuality: 0.7
                                        };
                                        const compressedFile = await imageCompression(file, options);
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            const base64String = reader.result as string;
                                            sessionStorage.setItem('pendingDiagnosticImage', base64String);
                                            router.push('/novo-diagnostico');
                                        };
                                        reader.readAsDataURL(compressedFile);
                                    } catch (error) {
                                        console.error("Erro ao processar imagem:", error);
                                        router.push('/novo-diagnostico');
                                    }
                                }
                            }}
                        />

                        {/* Bottom Action Bar */}
                        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end" onClick={(e) => e.stopPropagation()}>
                            {/* Left Tools (Camera/Plus) */}
                            <div className="flex gap-2" ref={toolsRef}>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowToolsMenu(!showToolsMenu)}
                                        className={`p-2.5 rounded-xl transition-all duration-300 ${showToolsMenu ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                        title="Ferramentas Visuais"
                                    >
                                        <Plus size={20} />
                                    </button>

                                    {/* Expanded Tools Menu - Repositioned for bottom left anchor */}
                                    {showToolsMenu && (
                                        <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md border border-[#FF6600]/50 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] dark:shadow-[0_4px_20px_rgba(255,102,0,0.1)] overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                                            <div className="p-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newId = crypto.randomUUID();
                                                        router.push(`/editor/${newId}?type=obra_nova`);
                                                        setShowToolsMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors group text-left"
                                                >
                                                    <div className="p-2 text-[#22c55e] group-hover:scale-110 transition-transform">
                                                        <Calculator size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Novo Orçamento</span>
                                                        <span className="block text-[10px] text-gray-500 dark:text-gray-500">Editor completo</span>
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        router.push('/novo-diagnostico');
                                                        setShowToolsMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors group text-left"
                                                >
                                                    <div className="p-2 text-[#FF6600] group-hover:scale-110 transition-transform">
                                                        <ScanEye size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                            Diagnóstico Visual
                                                            <span className="ml-2 text-[10px] bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Beta</span>
                                                        </span>
                                                        <span className="block text-[10px] text-gray-500 dark:text-gray-500">IA analisando fotos da obra</span>
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => router.push('/relatorio-fotografico')}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors group text-left"
                                                >
                                                    <div className="p-2 text-[#6366F1] group-hover:scale-110 transition-transform">
                                                        <Camera size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Relatório Fotográfico</span>
                                                        <span className="block text-[10px] text-gray-500 dark:text-gray-500">Documentação de obra</span>
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => router.push('/topografia')}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors group text-left"
                                                >
                                                    <div className="p-2 text-[#C2410C] group-hover:scale-110 transition-transform">
                                                        <Map size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Topografia</span>
                                                        <span className="block text-[10px] text-gray-500 dark:text-gray-500">Conversor de coordenadas</span>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Action (Search Button) */}
                            <button
                                type="submit"
                                disabled={isLoading || !query.trim()}
                                className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${query.trim() ? 'bg-[#FF6600] text-white shadow-md hover:bg-[#e65c00]' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
                            >
                                {isLoading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <ArrowRight size={20} className={query.trim() ? "animate-pulse" : ""} />
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Local Suggestions Dropdown */}
                {showSuggestions && filteredItems.length > 0 && !response && !isLoading && (
                    <div className="absolute top-full left-0 right-0 w-full mt-2 bg-white/80 dark:bg-[#1A1A1A]/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/30 rounded-xl shadow-2xl overflow-hidden z-20 max-h-[300px] overflow-y-auto custom-scrollbar">
                        <div className="px-4 py-2 bg-gray-50/50 dark:bg-black/40 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 backdrop-blur-sm sticky top-0 z-10">
                            ENCONTRADOS
                        </div>
                        <ul className="py-1">
                            {filteredItems.map((item, idx) => (
                                <li
                                    key={idx}
                                    onClick={() => handleLocalItemSelect(item)}
                                    className="px-4 py-3 hover:bg-orange-50/50 dark:hover:bg-white/10 cursor-pointer flex items-center justify-between group border-b border-gray-100/50 dark:border-white/5 last:border-0 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-orange-100 dark:bg-orange-900/20 rounded-md text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                            <Plus size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                                                {item.name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">
                                                {item.category}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 tabular-nums">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                        </span>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                            {item.unit}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>






            {
                error && (
                    <div className="mt-4 p-3 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2 border border-red-100 dark:border-red-800/50">
                        <AlertTriangle size={16} />
                        {error.includes("Chave de API") ? (
                            <span>
                                Configure sua chave de API do Groq no arquivo <code>.env.local</code> como <code>GROQ_API_KEY=sua_chave</code>.
                            </span>
                        ) : (
                            <span>{error}</span>
                        )}
                    </div>
                )
            }

            {
                response && (
                    <div ref={responseRef} className="mt-6 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-xl p-4 border border-white/20 dark:border-gray-700/30 animate-in fade-in slide-in-from-bottom-2 shadow-sm">
                        <div className="flex gap-3">
                            <div className="mt-1 bg-orange-100/80 dark:bg-orange-900/30 p-1.5 rounded-lg h-fit text-orange-600 dark:text-orange-400 shrink-0 backdrop-blur-sm">
                                <Bot size={16} />
                            </div>
                            <div className="space-y-4 w-full">
                                <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed font-medium">
                                    {response.text}
                                </div>

                                {response.suggestedBudget && (
                                    <div className="bg-orange-50/40 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100/50 dark:border-orange-800/30 backdrop-blur-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-orange-900 dark:text-orange-300 text-sm">Orçamento Sugerido</h4>
                                            <span className="text-xs text-orange-600 dark:text-orange-300 bg-orange-100/50 dark:bg-orange-900/50 px-2 py-1 rounded-full">
                                                {response.suggestedBudget.items.length} itens identificados
                                            </span>
                                        </div>

                                        <ul className="space-y-2 mb-4">
                                            {response.suggestedBudget.items
                                                .map((item, idx) => (
                                                    <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex justify-between items-center bg-white/50 dark:bg-black/20 px-2 py-1.5 rounded">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <span title={item.type === 'service' ? 'Serviço' : 'Material'} className="text-[10px] shrink-0 opacity-70">
                                                                {item.type === 'service' ? '🔨' : '🧱'}
                                                            </span>
                                                            <span className="truncate">{item.name}</span>
                                                        </div>
                                                        <span className="font-medium shrink-0 ml-2">~R$ {item.price}</span>
                                                    </li>
                                                ))}
                                        </ul>

                                        <button
                                            onClick={handleCreateBudget}
                                            className="w-full py-2 bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <FilePlus size={16} />
                                            Criar orçamento com estes itens
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
