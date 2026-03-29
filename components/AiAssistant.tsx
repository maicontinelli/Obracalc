'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, Loader2, FilePlus, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

type SuggestedItem = {
    name: string;
    unit: string;
    quantity: number;
    price: number;
    laborPrice?: number;
    materialPrice?: number;
    category: string;
    type: 'service' | 'material';
    included?: boolean;
};

type SuggestedBudget = {
    title: string;
    type: string;
    projectArea?: number;
    items: SuggestedItem[];
};

type Message = {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    suggestedBudget?: SuggestedBudget;
    isClarification?: boolean;
    timestamp: number;
};

const QUICK_SUGGESTIONS = [
    { label: 'Pintar sala de 20m²', icon: '🎨' },
    { label: 'Construir muro de 10m', icon: '🧱' },
    { label: 'Reforma de banheiro', icon: '🚿' },
    { label: 'Trocar piso da cozinha', icon: '🪟' },
    { label: 'Instalação elétrica', icon: '⚡' },
];

export default function AiAssistant() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isClarifying, setIsClarifying] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const responseRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Typewriter effect states
    const [placeholder, setPlaceholder] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(100);

    const texts = [
        'Descreva seu projeto aqui...',
        'Ex: Pintar uma sala de 20m²',
        'Ex: Construir um muro de 10 metros',
        'Ex: Trocar o piso da cozinha',
        'Ex: Reforma completa de banheiro',
    ];

    useEffect(() => {
        if (responseRef.current) {
            responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages, isLoading]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [query]);

    const handleSearch = async (e: React.FormEvent | null, overrideQuery?: string) => {
        if (e) e.preventDefault();
        const searchQuery = overrideQuery ?? query;
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setError(null);

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            text: searchQuery,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMsg]);
        if (!overrideQuery) setQuery('');

        try {
            const history = messages.map(msg => ({
                role: msg.role,
                content: msg.text
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: searchQuery, history }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Erro ao processar solicitação');

            const aiMsg: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                text: data.clarificationRequest || data.text || '',
                suggestedBudget: data.suggestedBudget,
                isClarification: !!data.clarificationRequest,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsClarifying(!!data.clarificationRequest);

        } catch (err: any) {
            setError(err.message || 'Erro ao processar solicitação');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateBudget = async (budget: SuggestedBudget, title: string, description: string) => {
        const newId = crypto.randomUUID();
        const newBudget = {
            id: newId,
            title: title || budget.title,
            description,
            type: 'obra_nova' as const,
            items: budget.items.filter(item => item.included !== false).map(item => ({
                id: crypto.randomUUID(),
                name: item.name,
                unit: item.unit,
                quantity: item.quantity,
                price: item.price,
                laborPrice: item.laborPrice || item.price * 0.4,
                materialPrice: item.materialPrice || item.price * 0.6,
                category: item.category,
                type: item.type,
                included: true,
                isCustom: true,
                aiRequestId: 'home-search',
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(`estimate_${newId}`, JSON.stringify(newBudget));
        router.push(`/editor/${newId}?type=obra_nova`);
    };

    // Typewriter effect
    useEffect(() => {
        if (isFocused || isClarifying) return;
        const handleTyping = () => {
            const i = loopNum % texts.length;
            const fullText = texts[i];
            setPlaceholder(
                isDeleting
                    ? fullText.substring(0, placeholder.length - 1)
                    : fullText.substring(0, placeholder.length + 1)
            );
            setTypingSpeed(isDeleting ? 25 : 100);
            if (!isDeleting && placeholder === fullText) {
                setTimeout(() => setIsDeleting(true), 2500);
            } else if (isDeleting && placeholder === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };
        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [placeholder, isDeleting, loopNum, typingSpeed, isFocused, isClarifying]);

    const hasMessages = messages.length > 0;

    return (
        <div className="w-full mx-auto">

            {/* Main search card */}
            <div className={`
                relative rounded-2xl transition-all duration-300
                bg-white dark:bg-[#141414]
                border ${isFocused
                    ? 'border-[#FF6600] shadow-[0_0_0_4px_rgba(255,102,0,0.12),0_8px_32px_rgba(0,0,0,0.12)]'
                    : 'border-neutral-200 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.06)]'
                }
            `}>
                <form onSubmit={(e) => handleSearch(e)}>
                    <div className="flex items-start gap-3 p-4">

                        {/* Icon */}
                        <div className="mt-1 shrink-0">
                            <div className={`p-2 rounded-xl transition-colors ${isFocused ? 'bg-[#FF6600]' : 'bg-[#FF6600]/10'}`}>
                                <Sparkles
                                    size={18}
                                    className={`transition-colors ${isFocused ? 'text-white' : 'text-[#FF6600]'}`}
                                />
                            </div>
                        </div>

                        {/* Textarea */}
                        <div className="flex-1 min-w-0">
                            <textarea
                                ref={textareaRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSearch(null);
                                    }
                                }}
                                placeholder={isClarifying ? "Digite sua resposta..." : (isFocused ? '' : placeholder)}
                                className="w-full bg-transparent border-none outline-none resize-none
                                    text-[#3D3A36] dark:text-[#E8E6E3] text-base leading-relaxed
                                    placeholder:text-neutral-400 dark:placeholder:text-neutral-600
                                    focus:ring-0 min-h-[28px] max-h-[160px]"
                                rows={1}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Submit button */}
                        <div className="shrink-0 mt-0.5">
                            <button
                                type="submit"
                                disabled={!query.trim() || isLoading}
                                className={`
                                    flex items-center justify-center w-10 h-10 rounded-xl
                                    transition-all duration-200
                                    ${query.trim() && !isLoading
                                        ? 'bg-[#FF6600] hover:bg-[#E55C00] text-white shadow-sm hover:shadow-md active:scale-95'
                                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                                    }
                                `}
                            >
                                {isLoading
                                    ? <Loader2 size={18} className="animate-spin" />
                                    : <Send size={16} className={query.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                                }
                            </button>
                        </div>
                    </div>

                    {/* Bottom row: hint + shortcut */}
                    {!hasMessages && (
                        <div className="px-4 pb-3 flex items-center justify-between">
                            <span className="text-xs text-neutral-400 dark:text-neutral-600">
                                Powered by IA · Pressione <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-mono text-[10px]">Enter</kbd> para enviar
                            </span>
                            <span className="text-xs text-neutral-400 dark:text-neutral-600">
                                Shift+Enter para nova linha
                            </span>
                        </div>
                    )}
                </form>

                {/* Chat messages (inside the card when active) */}
                {hasMessages && (
                    <div className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-4 space-y-3 max-h-[420px] overflow-y-auto">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                {msg.role === 'user' ? (
                                    <div className="max-w-[80%] bg-[#FF6600] text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
                                        <p className="text-sm whitespace-pre-line">{msg.text}</p>
                                    </div>
                                ) : msg.isClarification ? (
                                    <div className="max-w-[85%] bg-[#FF6600]/5 dark:bg-[#FF6600]/10 rounded-2xl rounded-bl-sm p-4 border border-[#FF6600]/15">
                                        <p className="text-[10px] font-bold text-[#FF6600] uppercase tracking-wider mb-1">ObraPlana</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Para um orçamento mais preciso:</p>
                                        <div className="text-sm text-[#3D3A36] dark:text-[#E8E6E3] whitespace-pre-line leading-relaxed">{msg.text}</div>
                                    </div>
                                ) : (
                                    <div className="max-w-[85%] bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl rounded-bl-sm p-4 border border-neutral-100 dark:border-neutral-700/50">
                                        <div className="flex gap-3">
                                            <div className="mt-0.5 bg-[#FF6600]/10 p-1.5 rounded-lg h-fit shrink-0">
                                                <Bot size={14} className="text-[#FF6600]" />
                                            </div>
                                            <div className="space-y-3 w-full">
                                                <p className="text-sm text-[#3D3A36] dark:text-[#E8E6E3] whitespace-pre-line leading-relaxed">{msg.text}</p>

                                                {msg.suggestedBudget && (
                                                    <div className="bg-white dark:bg-neutral-900 rounded-xl p-3 border border-neutral-200 dark:border-neutral-700">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="font-semibold text-[#FF6600] text-sm">Orçamento Sugerido</h4>
                                                            <span className="text-xs text-[#FF6600] bg-[#FF6600]/10 px-2 py-0.5 rounded-full font-medium">
                                                                {msg.suggestedBudget.items.filter(i => i.included !== false).length} itens
                                                            </span>
                                                        </div>

                                                        <ul className="space-y-1.5 mb-3">
                                                            {msg.suggestedBudget.items.map((item, idx) => (
                                                                <li key={idx} className="text-xs text-neutral-600 dark:text-neutral-400 flex justify-between items-center bg-neutral-50 dark:bg-neutral-800 px-3 py-2 rounded-lg">
                                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                                        <span className="text-[11px] shrink-0">{item.type === 'service' ? '🔨' : '🧱'}</span>
                                                                        <span className="truncate">{item.name}</span>
                                                                    </div>
                                                                    <span className="font-semibold text-[#3D3A36] dark:text-[#E8E6E3] shrink-0 ml-2">~R$ {item.price}</span>
                                                                </li>
                                                            ))}
                                                        </ul>

                                                        <button
                                                            onClick={() => handleCreateBudget(msg.suggestedBudget!, msg.text, msg.text)}
                                                            className="w-full py-2.5 bg-[#FF6600] hover:bg-[#E55C00] active:scale-[0.98] text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <FilePlus size={15} />
                                                            Criar orçamento com estes itens
                                                            <ArrowUpRight size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start animate-in fade-in">
                                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2.5 border border-neutral-100 dark:border-neutral-700/50">
                                    <Loader2 size={14} className="animate-spin text-[#FF6600]" />
                                    <span className="text-xs text-neutral-500 font-medium">Analisando projeto...</span>
                                </div>
                            </div>
                        )}
                        <div ref={responseRef} />
                    </div>
                )}

                {/* Bottom input row when chatting */}
                {hasMessages && (
                    <div className="px-4 pb-3 pt-1 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 mt-1">
                        <span className="text-xs text-neutral-400 dark:text-neutral-600">Enter para enviar</span>
                        <span className="text-xs text-neutral-400 dark:text-neutral-600">Shift+Enter para nova linha</span>
                    </div>
                )}
            </div>

            {/* Quick suggestion chips */}
            {!hasMessages && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {QUICK_SUGGESTIONS.map((s) => (
                        <button
                            key={s.label}
                            type="button"
                            onClick={() => {
                                setQuery(s.label);
                                setTimeout(() => handleSearch(null, s.label), 50);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full
                                bg-white dark:bg-neutral-900
                                border border-neutral-200 dark:border-neutral-800
                                text-sm text-neutral-600 dark:text-neutral-400
                                hover:border-[#FF6600]/40 hover:text-[#FF6600] hover:bg-[#FF6600]/5
                                dark:hover:border-[#FF6600]/40 dark:hover:text-[#FF6600] dark:hover:bg-[#FF6600]/10
                                transition-all duration-150 cursor-pointer shadow-sm"
                        >
                            <span>{s.icon}</span>
                            <span>{s.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {error && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2 border border-red-100 dark:border-red-800/50">
                    <AlertTriangle size={15} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
