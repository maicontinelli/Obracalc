'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Loader2, Check, Bot, Send, AlertTriangle, FilePlus, Sparkles, Calculator, ArrowRight } from 'lucide-react';

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
    "Podemos continuar a partir daqui . . .",
    "Veja se não faltou nada antes de finalizar",
    "Incluiu a demolição local?",
    "Considerou a retirada de entulho?",
    "Adicionou a regularização do terreno?",
    "Haverá pintura ou limpeza final?",
    "Quem será o engenheiro responsável pela obra?"
];

export default function CommandSearch({ items, onSelect, onAddCustom }: CommandSearchProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredItems, setFilteredItems] = useState<BoqItem[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    // Typewriter Effect State
    const [placeholder, setPlaceholder] = useState("");
    const [loopNum, setLoopNum] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(150);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleType = () => {
            const i = loopNum % PROMPT_PLACEHOLDERS.length;
            const fullText = PROMPT_PLACEHOLDERS[i];

            setPlaceholder(isDeleting
                ? fullText.substring(0, placeholder.length - 1)
                : fullText.substring(0, placeholder.length + 1)
            );

            // Faster typing speeds: 50ms typing, 20ms deleting
            setTypingSpeed(isDeleting ? 20 : 50);

            if (!isDeleting && placeholder === fullText) {
                setTimeout(() => setIsDeleting(true), 2000); // Wait before deleting
            } else if (isDeleting && placeholder === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [placeholder, isDeleting, loopNum, typingSpeed]);

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
                <form onSubmit={handleAiSearch} className="relative z-20">
                    {/* Glassmorphism Search Bar - Neon Orange Style */}
                    <div className={`relative flex items-center w-full rounded-full transition-all duration-300
                            bg-white dark:bg-[#1A1A1A] 
                            shadow-[0_4px_20px_rgba(0,0,0,0.08)]
                            border ${isClarifying ? 'border-[#F6A34A] ring-2 ring-[#F6A34A]/20' : 'border-[#F6A34A]/50'}
                            hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)]
                            focus-within:ring-4 focus-within:ring-[#F6A34A]/10 focus-within:border-[#F6A34A]`}
                    >
                        <div className="pl-6 text-gray-400 dark:text-gray-500">
                            <Sparkles size={20} className={`text-[#F6A34A] ${isClarifying ? 'animate-spin' : 'animate-pulse'}`} />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                if (aiResponse && !isClarifying) setAiResponse(null);
                            }}
                            onFocus={() => query && !aiResponse && !isClarifying && setIsOpen(true)}
                            placeholder={isClarifying ? "Digite sua resposta..." : (isDeleting ? "" : placeholder)}
                            className="w-full pl-4 pr-14 py-5 rounded-full border-none outline-none bg-transparent text-[13px] text-gray-800 dark:text-gray-100 placeholder:text-sm placeholder-gray-500 dark:placeholder-gray-400 font-medium"
                        />

                        <button
                            type="submit"
                            disabled={isAiLoading || !query.trim()}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all duration-300 ${isClarifying && query.trim()
                                ? 'bg-[#F6A34A] text-white hover:bg-[#E5933C]'
                                : 'bg-gray-100/50 dark:bg-[#333130]/50 text-gray-400 dark:text-muted-foreground hover:text-[#F6A34A] dark:hover:text-[#F6A34A] hover:bg-gray-100 dark:hover:bg-[#333130]'
                                }`}
                        >
                            {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : (isClarifying ? <Send size={16} /> : <ArrowRight size={18} />)}
                        </button>
                    </div>
                </form>

                {/* Clarification Prompt Bubble */}
                {
                    isClarifying && clarificationQuestion && (
                        <div className="mt-2 px-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex gap-3 items-start p-3 bg-[#F6A34A]/5 dark:bg-[#F6A34A]/10 rounded-2xl rounded-tl-sm shadow-sm border border-[#F6A34A]/20 dark:border-[#F6A34A]/30 backdrop-blur-sm">
                                <div className="p-1.5 bg-[#F6A34A]/10 dark:bg-[#F6A34A]/20 text-[#F6A34A] rounded-full shrink-0">
                                    <Sparkles size={14} />
                                </div>
                                <div className="text-xs text-gray-800 dark:text-[#F6A34A] font-medium">
                                    <p className="font-bold text-[9px] text-[#F6A34A] dark:text-[#F6A34A] mb-0.5 uppercase tracking-wider">Obra Plana</p>
                                    <div className="whitespace-pre-line leading-relaxed">
                                        {clarificationQuestion}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >

            {/* Local Search Results Dropdown - Linear Style */}
            {
                isOpen && filteredItems.length > 0 && !aiResponse && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-card rounded border border-gray-200 dark:border-white/10 shadow-lg overflow-hidden animate-in fade-in duration-100">
                        <ul className="max-h-[60vh] overflow-auto py-1">
                            <li className="px-3 py-1 text-[9px] font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">
                                Encontrados
                            </li>
                            {filteredItems.map((item) => (
                                <li
                                    key={item.id}
                                    className="group flex items-center justify-between px-3 py-1.5 hover:bg-gray-50/50 dark:hover:bg-[#333130]/50 cursor-pointer transition-colors border-b border-gray-50 dark:border-white/5 last:border-0"
                                    onClick={() => {
                                        onSelect(item);
                                        setQuery('');
                                        setIsOpen(false);
                                        setAiResponse(null);
                                    }}
                                >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <div className={`p-1 rounded ${item.included ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                                            {item.included ? <Check size={10} /> : <Plus size={10} />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-700 dark:text-foreground text-[11px] truncate">{item.name}</p>
                                            <p className="text-[9px] text-gray-500 dark:text-muted-foreground truncate">{item.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                        <p className="text-[11px] font-semibold text-gray-700 dark:text-foreground tabular-nums">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.manualPrice ?? item.price)}
                                        </p>
                                        <p className="text-[9px] text-gray-500 dark:text-muted-foreground uppercase font-mono">{item.unit}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            }

            {/* AI Error Message - Linear Style */}
            {
                aiError && (
                    <div className="mt-2 p-2 bg-red-50/50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded border border-red-200 dark:border-red-800/30 text-[11px] flex items-center gap-1.5 animate-in fade-in duration-100">
                        <AlertTriangle size={12} />
                        {aiError.includes("Chave de API") ? (
                            <span>
                                Configure sua chave de API do Groq no arquivo <code className="text-[10px] bg-red-100 dark:bg-red-900/30 px-1 rounded">.env.local</code>.
                            </span>
                        ) : (
                            <span>{aiError}</span>
                        )}
                    </div>
                )
            }

            {/* AI Response Preview - Linear Style */}
            {
                aiResponse && (
                    <div className="mt-2 bg-white dark:bg-card rounded border border-gray-200 dark:border-white/10 p-3 shadow-md animate-in fade-in duration-100 relative z-40">
                        <div className="flex gap-2">
                            <div className="mt-0.5 bg-blue-100 dark:bg-blue-900/30 p-1 rounded h-fit text-blue-600 dark:text-blue-400 shrink-0">
                                <Bot size={12} />
                            </div>
                            <div className="space-y-3 w-full">
                                <div className="text-[11px] text-gray-700 dark:text-foreground whitespace-pre-line leading-relaxed">
                                    {aiResponse.text}
                                </div>

                                {aiResponse.suggestedBudget && (
                                    <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded border border-blue-200 dark:border-blue-800/30 p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-[11px]">Sugestão de Itens</h4>
                                            <span className="text-[9px] text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded-full font-medium">
                                                {aiResponse.suggestedBudget.items.length} itens
                                            </span>
                                        </div>

                                        <ul className="space-y-1 mb-3 max-h-60 overflow-y-auto">
                                            {aiResponse.suggestedBudget.items
                                                .sort((a, b) => (a.type === 'service' ? -1 : 1))
                                                .map((item, idx) => (
                                                    <li key={idx} className={`text-[11px] flex justify-between items-center border-b border-blue-100 dark:border-white/5 last:border-0 pb-1 last:pb-0 ${item.included === false ? 'opacity-60 grayscale' : 'text-gray-700 dark:text-foreground'}`}>
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            {/* Show visual indicator if item is optional/unchecked */}
                                                            <div className={`w-1.5 h-1.5 shrink-0 rounded-full ${item.included === false ? 'bg-gray-300 dark:bg-gray-600' : 'bg-green-500'}`}></div>



                                                            <div className="min-w-0">
                                                                <span className="font-medium">{item.name}</span>
                                                                <div className="text-[9px] text-gray-500 dark:text-gray-500">{item.category}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right ml-2 flex-shrink-0">
                                                            <div className="font-semibold tabular-nums">~R$ {item.price}</div>
                                                            <div className="text-[9px] text-gray-500 dark:text-gray-500 font-mono uppercase">{item.quantity} {item.unit}</div>
                                                        </div>
                                                    </li>
                                                ))}
                                        </ul>

                                        <button
                                            onClick={handleAddSuggestedItems}
                                            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20"
                                        >
                                            <FilePlus size={12} />
                                            Adicionar Itens ao Orçamento
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
