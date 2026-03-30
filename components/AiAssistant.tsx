'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, FilePlus, AlertTriangle, ArrowUpRight, RotateCcw, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
    { label: 'Muro de 10m', query: 'Construir muro de alvenaria de 10m', icon: '🧱' },
    { label: 'Reforma de banheiro', icon: '🚿' },
    { label: 'Trocar piso', query: 'Trocar piso da cozinha', icon: '🪟' },
    { label: 'Instalação elétrica', icon: '⚡' },
];

interface AiAssistantProps {
    onActivate?: () => void;
    onReset?: () => void;
}

export default function AiAssistant({ onActivate, onReset }: AiAssistantProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isClarifying, setIsClarifying] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const PLACEHOLDERS = [
        'Descreva seu projeto de obra ou reforma...',
        'Ex: Reforma de banheiro 6m²...',
        'Ex: Muro de alvenaria 15m linear...',
        'Ex: Pintura interna de apartamento 80m²...',
        'Ex: Troca de piso cerâmico na cozinha...',
        'Ex: Instalação elétrica residencial...',
    ];

    const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
    const [placeholderVisible, setPlaceholderVisible] = useState(true);
    const [isFocused, setIsFocused] = useState(false);

    const hasMessages = messages.length > 0;

    useEffect(() => {
        if (isFocused || hasMessages) return;
        let index = 0;
        const cycle = setInterval(() => {
            setPlaceholderVisible(false);
            setTimeout(() => {
                index = (index + 1) % PLACEHOLDERS.length;
                setPlaceholder(PLACEHOLDERS[index]);
                setPlaceholderVisible(true);
            }, 600);
        }, 4000);
        return () => clearInterval(cycle);
    }, [isFocused, hasMessages]);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [query]);

    const handleSearch = async (e: React.FormEvent | null, overrideQuery?: string) => {
        if (e) e.preventDefault();
        const searchQuery = overrideQuery ?? query;
        if (!searchQuery.trim()) return;

        if (!hasMessages) onActivate?.();

        setIsLoading(true);
        setError(null);

        const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: searchQuery, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');

        try {
            const history = messages.map(msg => ({ role: msg.role, content: msg.text }));
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

    const handleReset = () => {
        setMessages([]);
        setQuery('');
        setError(null);
        setIsClarifying(false);
        onReset?.();
    };

    const handleCreateBudget = (budget: SuggestedBudget, title: string, description: string) => {
        const newId = crypto.randomUUID();
        const newBudget = {
            id: newId, title: title || budget.title, description, type: 'obra_nova' as const,
            items: budget.items.filter(item => item.included !== false).map(item => ({
                id: crypto.randomUUID(), name: item.name, unit: item.unit, quantity: item.quantity,
                price: item.price, laborPrice: item.laborPrice || item.price * 0.4,
                materialPrice: item.materialPrice || item.price * 0.6, category: item.category,
                type: item.type, included: true, isCustom: true, aiRequestId: 'home-search',
            })),
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(`estimate_${newId}`, JSON.stringify(newBudget));
        router.push(`/editor/${newId}?type=obra_nova`);
    };

    // ─── Input box render function (NOT a component — avoids remount on re-render) ──
    const renderInputBox = (inChat = false) => (
        <div
            className={`
                w-full rounded-2xl bg-white dark:bg-[#1c1c1c]
                border border-neutral-200 dark:border-neutral-800
                ${!inChat
                    ? 'shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:shadow-[0_6px_28px_rgba(0,0,0,0.10)]'
                    : 'shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
                }
                transition-shadow duration-200
            `}
        >
            <form onSubmit={(e) => handleSearch(e)}>
                <div className="flex items-center gap-3 px-4 py-3.5">
                    <div
                        className={`shrink-0 p-1.5 rounded-lg transition-colors ${isFocused || inChat ? 'bg-[#0D9488]' : 'bg-[#0D9488]/10'}`}
                    >
                        <Sparkles size={15} className={isFocused || inChat ? 'text-white' : 'text-[#0D9488]'} />
                    </div>

                    <textarea
                        ref={textareaRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(null); }
                        }}
                        placeholder={inChat
                            ? (isClarifying ? 'Digite sua resposta...' : 'Continue a conversa...')
                            : placeholder
                        }
                        className={`flex-1 bg-transparent border-none outline-none resize-none text-[#3D3A36] dark:text-[#E8E6E3] text-base focus:ring-0 min-h-[24px] max-h-[120px] leading-relaxed placeholder:transition-opacity placeholder:duration-500 ${placeholderVisible ? 'placeholder:opacity-100' : 'placeholder:opacity-0'} placeholder:text-neutral-400 dark:placeholder:text-neutral-500`}
                        rows={1}
                        disabled={isLoading}
                        autoFocus={inChat}
                    />

                    <button
                        type="submit"
                        disabled={!query.trim() || isLoading}
                        className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${query.trim() && !isLoading
                            ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-sm active:scale-95'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                            }`}
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                    </button>
                </div>
            </form>
        </div>
    );

    // ─── EMPTY STATE ──────────────────────────────────────────────────────────
    if (!hasMessages) {
        return (
            <div className="w-full">
                {renderInputBox()}

                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex gap-1.5 mt-4 w-full overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                        {QUICK_SUGGESTIONS.map((s) => (
                            <button
                                key={s.label}
                                type="button"
                                onClick={() => { const q = (s as any).query ?? s.label; setQuery(q); setTimeout(() => handleSearch(null, q), 50); }}
                                className="inline-flex shrink-0 items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 hover:border-[#0D9488]/40 hover:text-[#0D9488] hover:bg-[#0D9488]/5 dark:hover:border-[#0D9488]/30 dark:hover:text-[#0D9488] dark:hover:bg-[#0D9488]/10 transition-all duration-150 cursor-pointer whitespace-nowrap"
                            >
                                <span>{s.icon}</span>
                                <span>{s.label}</span>
                            </button>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {error && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2 border border-red-100 dark:border-red-800/50">
                        <AlertTriangle size={15} /><span>{error}</span>
                    </div>
                )}
            </div>
        );
    }

    // ─── CHAT STATE (Gemini-style) ────────────────────────────────────────────
    return (
        <motion.div
            className="w-full flex flex-col text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ minHeight: '55vh' }}
        >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center">
                        <Sparkles size={12} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">ObraPlana IA</span>
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                    <Plus size={13} />
                    Nova conversa
                </button>
            </div>

            {/* Messages area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-6 pb-2">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            {msg.role === 'user' ? (
                                // ── User message ──────────────────────────────
                                <div className="flex justify-end">
                                    <div className="max-w-[75%] bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-2xl rounded-br-md px-4 py-2.5 text-[15px] leading-relaxed">
                                        {msg.text}
                                    </div>
                                </div>
                            ) : (
                                // ── AI message ────────────────────────────────
                                <div className="flex gap-3 items-start">
                                    {/* Avatar */}
                                    <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center mt-0.5">
                                        <Sparkles size={13} className="text-white" />
                                    </div>

                                    {/* Content — no bubble, just text */}
                                    <div className="flex-1 min-w-0 space-y-4 pt-0.5">
                                        {msg.text && (
                                            <p className="text-[15px] text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line">
                                                {msg.text}
                                            </p>
                                        )}

                                        {/* Budget card */}
                                        {msg.suggestedBudget && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden"
                                            >
                                                {/* Card header */}
                                                <div className="flex items-center justify-between px-3 py-2.5 border-b border-neutral-100 dark:border-neutral-800">
                                                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate pr-2">
                                                        {msg.suggestedBudget.title}
                                                    </span>
                                                    <span className="text-[10px] bg-[#0D9488]/10 text-[#0D9488] px-2 py-0.5 rounded-full font-medium shrink-0">
                                                        {msg.suggestedBudget.items.filter(i => i.included !== false).length} itens
                                                    </span>
                                                </div>

                                                {/* Items */}
                                                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                                    {msg.suggestedBudget.items.filter(i => i.included !== false).map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between px-3 py-2">
                                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                                <span className="text-xs shrink-0">
                                                                    {item.type === 'service' ? '🔨' : '🧱'}
                                                                </span>
                                                                <span className="text-xs text-neutral-700 dark:text-neutral-300 truncate">
                                                                    {item.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 shrink-0 ml-2">
                                                                R$ {(item.price * item.quantity).toLocaleString('pt-BR')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Total + CTA — stacked on mobile, side by side on sm+ */}
                                                <div className="px-3 py-3 bg-neutral-50 dark:bg-neutral-800/50 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Total estimado</p>
                                                        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                                            R$ {msg.suggestedBudget.items
                                                                .filter(i => i.included !== false)
                                                                .reduce((sum, i) => sum + (i.price * i.quantity), 0)
                                                                .toLocaleString('pt-BR')}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCreateBudget(msg.suggestedBudget!, msg.suggestedBudget!.title, msg.text)}
                                                        className="flex items-center justify-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] active:scale-[0.98] text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all w-full sm:w-auto"
                                                    >
                                                        <FilePlus size={13} />
                                                        Iniciar orçamento
                                                        <ArrowUpRight size={12} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 items-start"
                    >
                        <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center mt-0.5">
                            <Sparkles size={13} className="text-white" />
                        </div>
                        <div className="pt-2 flex items-center gap-1">
                            {[0, 1, 2].map((i) => (
                                <motion.span
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600"
                                    animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

            </div>

            {/* Error */}
            {error && (
                <div className="my-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2 border border-red-100 dark:border-red-800/50">
                    <AlertTriangle size={15} /><span>{error}</span>
                </div>
            )}

            {/* Input — slides down to bottom */}
            <div className="mt-4">
                {renderInputBox(true)}
                <p className="text-center text-[11px] text-neutral-400 dark:text-neutral-600 mt-2">
                    Enter para enviar · Shift+Enter para nova linha
                </p>
            </div>
        </motion.div>
    );
}
