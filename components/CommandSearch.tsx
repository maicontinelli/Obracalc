'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Loader2, Check, Send, AlertTriangle, FilePlus, Sparkles } from 'lucide-react';

export type BoqItem = {
    id: string;
    name: string;
    unit: string;
    price: number;
    quantity: number;
    manualPrice?: number;
    materialPrice?: number;
    laborPrice?: number;
    included: boolean;
    category: string;
    isCustom?: boolean;
    aiRequestId?: string;
    type?: 'material' | 'service' | 'equipment' | 'composition';
};

type SuggestedItem = {
    name: string;
    unit: string;
    quantity: number;
    price: number;
    category: string;
    included?: boolean;
    type?: 'material' | 'service' | 'equipment' | 'composition';
};

type SuggestedBudget = {
    title: string;
    items: SuggestedItem[];
    projectArea?: number;
};

type AiResponse = {
    text: string;
    suggestedBudget?: SuggestedBudget | null;
    error?: string;
};

interface CommandSearchProps {
    items: BoqItem[];
    onSelect: (item: BoqItem) => void;
    onAddCustom: (
        items: Omit<BoqItem, 'id' | 'included' | 'isCustom'>[],
        aiContext?: { query: string, guidance: string, suggestedTitle?: string, projectArea?: number }
    ) => void;
}

// ... imports
// Add these at the top level or inside the component if you prefer, but outside is better for constants
const PROMPT_PLACEHOLDERS = [
    "Ex: Adicionar instalação elétrica completa...",
    "Ex: Incluir revestimento cerâmico no banheiro...",
    "Ex: Acrescentar pintura de fachada 80m²...",
    "Ex: Cobertura metálica para área de 40m²...",
    "Ex: Revisão de telhado com troca de telhas...",
    "Ex: Esquadrias de alumínio para 4 janelas...",
];

export default function CommandSearch({ items, onSelect, onAddCustom }: CommandSearchProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredItems, setFilteredItems] = useState<BoqItem[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    // Smooth fade-cycle placeholder
    const [placeholder, setPlaceholder] = useState(PROMPT_PLACEHOLDERS[0]);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [placeholderVisible, setPlaceholderVisible] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cycle = setInterval(() => {
            // Fade out
            setPlaceholderVisible(false);
            setTimeout(() => {
                // Swap text while invisible, then fade in
                setPlaceholderIndex(i => {
                    const next = (i + 1) % PROMPT_PLACEHOLDERS.length;
                    setPlaceholder(PROMPT_PLACEHOLDERS[next]);
                    return next;
                });
                setPlaceholderVisible(true);
            }, 600); // matches CSS transition duration
        }, 4000); // show each phrase for 4s

        return () => clearInterval(cycle);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                // Only close if not interacting with the AI response
                if (!aiResponse) {
                    setIsOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [aiResponse]);

    // Local search effect
    useEffect(() => {
        if (query.trim() === '') {
            setFilteredItems([]);
            return;
        }

        // Only search locally if we haven't triggered AI mode or if we are typing
        if (!aiResponse) {
            const lowerQuery = query.toLowerCase();
            const matches = items.filter(item =>
                item.name.toLowerCase().includes(lowerQuery)
            ).slice(0, 5);
            setFilteredItems(matches);
            setIsOpen(true);
        }
    }, [query, items, aiResponse]);

    // Clarification State
    const [isClarifying, setIsClarifying] = useState(false);
    const [previousQuery, setPreviousQuery] = useState('');
    const [clarificationQuestion, setClarificationQuestion] = useState<string | null>(null);

    const handleAiSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setIsAiLoading(true);
        setAiResponse(null);
        setAiError(null);
        setIsOpen(false); // Close local search dropdown

        // Calculate message to send (Context + Answer if clarifying)
        let messageToSend = query;
        if (isClarifying) {
            messageToSend = `CONTEXTO ANTERIOR: ${previousQuery} | PERGUNTA DA IA: ${clarificationQuestion} | RESPOSTA DO USUÁRIO: ${query}`;
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
                const input = containerRef.current?.querySelector('input');
                if (input) input.focus();

            } else {
                setAiResponse(data);
                // Reset clarification state on success
                setIsClarifying(false);
                setClarificationQuestion(null);
                setPreviousQuery('');
            }
        } catch (err: any) {
            console.error(err);
            setAiError(err.message || 'Ocorreu um erro inesperado.');
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleAddSuggestedItems = () => {
        if (!aiResponse?.suggestedBudget) return;

        // Only add items that are currently selected/included in the UI state
        // We need to track the selection state of suggested items if we want to allow user to toggle them BEFORE adding.
        // For now, let's assume valid items are those with included=true from the AI response, 
        // OR we can convert this to a local state to let user toggle.

        // Since we didn't add local state for toggling AI items yet, let's just add all of them 
        // but respect the 'included' flag as the initial state in the editor.
        const itemsToAdd = aiResponse.suggestedBudget.items.map(item => ({
            name: item.name,
            unit: item.unit,
            price: item.price,
            quantity: item.quantity,
            category: item.category,
            // manualPrice: REMOVED to allow switch logic to work on base price
            included: item.included !== undefined ? item.included : true, // Pass this through
            type: item.type // Pass type (material/service/composition)
        }));

        onAddCustom(itemsToAdd, {
            query: query,
            guidance: aiResponse.text,
            suggestedTitle: aiResponse.suggestedBudget.title,
            projectArea: aiResponse.suggestedBudget.projectArea
        });

        // Reset state
        setQuery('');
        setAiResponse(null);
    };

    return (
        <div className="w-full mb-6 relative" ref={containerRef}>
            <div className="group relative">
                <form onSubmit={handleAiSearch}>
                    {/* Search bar — same style as homepage AiAssistant */}
                    <div className={`
                        w-full rounded-2xl bg-white dark:bg-[#1c1c1c]
                        border transition-shadow duration-200
                        ${isClarifying
                            ? 'border-[#0D9488] shadow-[0_0_0_3px_rgba(13,148,136,0.12)]'
                            : 'border-neutral-200 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:shadow-[0_6px_28px_rgba(0,0,0,0.10)]'
                        }
                    `}>
                        <div className="flex items-center gap-3 px-4 py-3.5">
                            <div className={`shrink-0 p-1.5 rounded-lg transition-colors ${isClarifying ? 'bg-[#0D9488]' : 'bg-[#0D9488]/10'}`}>
                                <Sparkles size={15} className={isClarifying ? 'text-white' : 'text-[#0D9488]'} />
                            </div>

                            <input
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    if (aiResponse && !isClarifying) setAiResponse(null);
                                }}
                                onFocus={() => query && !aiResponse && !isClarifying && setIsOpen(true)}
                                placeholder={isClarifying ? 'Digite sua resposta...' : placeholder}
                                className={`flex-1 bg-transparent border-none outline-none resize-none text-[#3D3A36] dark:text-[#E8E6E3] text-base focus:ring-0 leading-relaxed transition-opacity duration-500 ${placeholderVisible ? 'placeholder:opacity-100' : 'placeholder:opacity-0'} placeholder:text-neutral-400 dark:placeholder:text-neutral-500 placeholder:transition-opacity placeholder:duration-500`}
                            />

                            <button
                                type="submit"
                                disabled={isAiLoading || !query.trim()}
                                className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${query.trim() && !isAiLoading
                                    ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-sm active:scale-95'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                                }`}
                            >
                                {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Clarification bubble */}
                {isClarifying && clarificationQuestion && (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex gap-3 items-start p-3 bg-[#0D9488]/5 dark:bg-[#0D9488]/10 rounded-2xl border border-[#0D9488]/20 dark:border-[#0D9488]/30">
                            <div className="p-1.5 bg-[#0D9488]/10 dark:bg-[#0D9488]/20 rounded-lg shrink-0">
                                <Sparkles size={13} className="text-[#0D9488]" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-[#0D9488] uppercase tracking-wider mb-1">ObraPlana IA</p>
                                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-1.5">Para um orçamento mais preciso, responda:</p>
                                <p className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed">{clarificationQuestion}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Local search dropdown */}
            {isOpen && filteredItems.length > 0 && !aiResponse && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-[#1c1c1c] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in duration-100">
                    <ul className="max-h-[60vh] overflow-auto py-1">
                        <li className="px-4 py-1.5 text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">
                            Encontrados
                        </li>
                        {filteredItems.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center justify-between px-4 py-2 hover:bg-[#0D9488]/5 dark:hover:bg-[#0D9488]/10 cursor-pointer transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                                onClick={() => {
                                    onSelect(item);
                                    setQuery('');
                                    setIsOpen(false);
                                    setAiResponse(null);
                                }}
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className={`p-1 rounded-lg ${item.included ? 'bg-[#0D9488]/10 text-[#0D9488]' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                                        {item.included ? <Check size={10} /> : <Plus size={10} />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-neutral-700 dark:text-neutral-200 text-xs truncate">{item.name}</p>
                                        <p className="text-[10px] text-neutral-400 truncate">{item.category}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 tabular-nums">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.manualPrice ?? item.price)}
                                    </p>
                                    <p className="text-[10px] text-neutral-400 uppercase font-mono">{item.unit}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Error */}
            {aiError && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2 border border-red-100 dark:border-red-800/50 animate-in fade-in duration-100">
                    <AlertTriangle size={13} />
                    {aiError.includes('Chave de API') ? (
                        <span>Configure a chave <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">GROQ_API_KEY</code> no <code>.env.local</code>.</span>
                    ) : (
                        <span>{aiError}</span>
                    )}
                </div>
            )}

            {/* AI response panel */}
            {aiResponse && (
                <div className="mt-2 bg-white dark:bg-[#1c1c1c] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden animate-in fade-in duration-100">
                    <div className="flex gap-2.5 px-4 pt-4 pb-3">
                        <div className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center mt-0.5">
                            <Sparkles size={12} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                            <p className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
                                {aiResponse.text}
                            </p>

                            {aiResponse.suggestedBudget && (
                                <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                                    {/* Card header */}
                                    <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                                        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate pr-2">
                                            {aiResponse.suggestedBudget.title}
                                        </span>
                                        <span className="text-[10px] bg-[#0D9488]/10 text-[#0D9488] px-2 py-0.5 rounded-full font-medium shrink-0">
                                            {aiResponse.suggestedBudget.items.length} itens
                                        </span>
                                    </div>

                                    {/* Items */}
                                    <ul className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-56 overflow-y-auto">
                                        {aiResponse.suggestedBudget.items
                                            .sort((a, b) => (a.type === 'service' ? -1 : 1))
                                            .map((item, idx) => (
                                                <li key={idx} className={`flex justify-between items-center px-3 py-2 ${item.included === false ? 'opacity-50' : ''}`}>
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <div className={`w-1.5 h-1.5 shrink-0 rounded-full ${item.included === false ? 'bg-neutral-300 dark:bg-neutral-600' : 'bg-[#0D9488]'}`} />
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">{item.name}</p>
                                                            <p className="text-[10px] text-neutral-400">{item.category}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right ml-3 shrink-0">
                                                        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">~R$ {item.price}</p>
                                                        <p className="text-[10px] text-neutral-400 font-mono uppercase">{item.quantity} {item.unit}</p>
                                                    </div>
                                                </li>
                                            ))}
                                    </ul>

                                    {/* CTA */}
                                    <div className="px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800/50">
                                        <button
                                            onClick={handleAddSuggestedItems}
                                            className="w-full flex items-center justify-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] active:scale-[0.98] text-white py-2 rounded-xl text-xs font-semibold transition-all"
                                        >
                                            <FilePlus size={13} />
                                            Adicionar ao Orçamento
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
