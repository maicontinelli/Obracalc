'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, FilePlus, AlertTriangle, ArrowUpRight, RotateCcw } from 'lucide-react';
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
    { label: 'Construir muro de 10m', icon: '🧱' },
    { label: 'Reforma de banheiro', icon: '🚿' },
    { label: 'Trocar piso da cozinha', icon: '🪟' },
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
    const [isFocused, setIsFocused] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Typewriter placeholder
    const [placeholder, setPlaceholder] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(100);

    const texts = [
        'Descreva seu projeto...',
        'Ex: Pintar uma sala de 20m²',
        'Ex: Construir um muro de 10m',
        'Ex: Trocar o piso da cozinha',
    ];

    const hasMessages = messages.length > 0;

    // Scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [query]);

    // Typewriter effect (only when empty state)
    useEffect(() => {
        if (isFocused || hasMessages || isClarifying) return;
        const handleTyping = () => {
            const i = loopNum % texts.length;
            const fullText = texts[i];
            setPlaceholder(isDeleting ? fullText.substring(0, placeholder.length - 1) : fullText.substring(0, placeholder.length + 1));
            setTypingSpeed(isDeleting ? 25 : 100);
            if (!isDeleting && placeholder === fullText) setTimeout(() => setIsDeleting(true), 2500);
            else if (isDeleting && placeholder === '') { setIsDeleting(false); setLoopNum(loopNum + 1); }
        };
        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [placeholder, isDeleting, loopNum, typingSpeed, isFocused, hasMessages, isClarifying]);

    const handleSearch = async (e: React.FormEvent | null, overrideQuery?: string) => {
        if (e) e.preventDefault();
        const searchQuery = overrideQuery ?? query;
        if (!searchQuery.trim()) return;

        // Notify parent that chat started
        if (!hasMessages) onActivate?.();

        setIsLoading(true);
        setError(null);

        const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: searchQuery, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        if (!overrideQuery) setQuery('');

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

    const handleCreateBudget = async (budget: SuggestedBudget, title: string, description: string) => {
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

    // ─── EMPTY STATE ─────────────────────────────────────────────────────────
    if (!hasMessages) {
        return (
            <div className="w-full mx-auto">
                {/* Search bar */}
                <div className={`
                    relative rounded-2xl transition-all duration-300
                    bg-white dark:bg-[#141414]
                    border ${isFocused
                        ? 'border-[#FF6600] shadow-[0_0_0_4px_rgba(255,102,0,0.10),0_8px_32px_rgba(0,0,0,0.10)]'
                        : 'border-neutral-200 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.06)]'
                    }
                `}>
                    <form onSubmit={(e) => handleSearch(e)}>
                        <div className="flex items-center gap-3 px-4 py-3.5">
                            <div className={`shrink-0 p-1.5 rounded-lg transition-colors ${isFocused ? 'bg-[#FF6600]' : 'bg-[#FF6600]/10'}`}>
                                <Sparkles size={16} className={isFocused ? 'text-white' : 'text-[#FF6600]'} />
                            </div>
                            <textarea
                                ref={textareaRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(null); } }}
                                placeholder={placeholder}
                                className="flex-1 bg-transparent border-none outline-none resize-none text-[#3D3A36] dark:text-[#E8E6E3] text-base placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:ring-0 min-h-[24px] max-h-[120px]"
                                rows={1}
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!query.trim() || isLoading}
                                className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${query.trim() && !isLoading ? 'bg-[#FF6600] hover:bg-[#E55C00] text-white shadow-sm active:scale-95' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'}`}
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Quick chips */}
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                    {QUICK_SUGGESTIONS.map((s) => (
                        <button
                            key={s.label}
                            type="button"
                            onClick={() => { setQuery(s.label); setTimeout(() => handleSearch(null, s.label), 50); }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-600 dark:text-neutral-400 hover:border-[#FF6600]/40 hover:text-[#FF6600] hover:bg-[#FF6600]/5 dark:hover:border-[#FF6600]/40 dark:hover:text-[#FF6600] dark:hover:bg-[#FF6600]/10 transition-all duration-150 shadow-sm cursor-pointer"
                        >
                            <span>{s.icon}</span>
                            <span>{s.label}</span>
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2 border border-red-100 dark:border-red-800/50">
                        <AlertTriangle size={15} /><span>{error}</span>
                    </div>
                )}
            </div>
        );
    }

    // ─── CHAT STATE ───────────────────────────────────────────────────────────
    return (
        <motion.div
            className="w-full mx-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <div className="rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-[0_8px_40px_rgba(0,0,0,0.10)] overflow-hidden flex flex-col" style={{ minHeight: '420px', maxHeight: '65vh' }}>

                {/* Chat header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#FF6600]/10 rounded-lg">
                            <Sparkles size={14} className="text-[#FF6600]" />
                        </div>
                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">ObraPlana IA</span>
                    </div>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <RotateCcw size={12} />
                        Nova conversa
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'user' ? (
                                    /* User bubble */
                                    <div className="max-w-[78%] bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed">
                                        {msg.text}
                                    </div>
                                ) : (
                                    /* AI bubble */
                                    <div className="max-w-[85%] flex gap-2.5 items-start">
                                        <div className="shrink-0 w-7 h-7 rounded-full bg-[#FF6600]/10 flex items-center justify-center mt-0.5">
                                            <Sparkles size={13} className="text-[#FF6600]" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line">
                                                {msg.text}
                                            </div>

                                            {/* Budget card */}
                                            {msg.suggestedBudget && (
                                                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-semibold text-[#FF6600]">Orçamento sugerido</span>
                                                        <span className="text-xs bg-[#FF6600]/10 text-[#FF6600] px-2 py-0.5 rounded-full font-medium">
                                                            {msg.suggestedBudget.items.filter(i => i.included !== false).length} itens
                                                        </span>
                                                    </div>
                                                    <ul className="space-y-1.5">
                                                        {msg.suggestedBudget.items.map((item, idx) => (
                                                            <li key={idx} className="flex justify-between items-center text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 rounded-xl">
                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                    <span>{item.type === 'service' ? '🔨' : '🧱'}</span>
                                                                    <span className="truncate">{item.name}</span>
                                                                </div>
                                                                <span className="font-semibold text-neutral-800 dark:text-neutral-200 shrink-0 ml-2">~R$ {item.price}</span>
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
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-2.5"
                        >
                            <div className="shrink-0 w-7 h-7 rounded-full bg-[#FF6600]/10 flex items-center justify-center">
                                <Sparkles size={13} className="text-[#FF6600]" />
                            </div>
                            <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.span
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-neutral-400"
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="shrink-0 border-t border-neutral-100 dark:border-neutral-800 px-4 py-3">
                    {error && (
                        <div className="mb-2 p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs flex items-center gap-2">
                            <AlertTriangle size={13} /><span>{error}</span>
                        </div>
                    )}
                    <form onSubmit={(e) => handleSearch(e)} className="flex items-end gap-3">
                        <textarea
                            ref={textareaRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(null); } }}
                            placeholder={isClarifying ? "Digite sua resposta..." : "Continue a conversa..."}
                            className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:ring-0 min-h-[24px] max-h-[120px] py-1"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!query.trim() || isLoading}
                            className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${query.trim() && !isLoading ? 'bg-[#FF6600] hover:bg-[#E55C00] text-white active:scale-95' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'}`}
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
