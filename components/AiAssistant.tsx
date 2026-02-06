'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, Loader2, FilePlus, AlertTriangle, BrainCircuit, Map, Camera, ArrowRight, Plus, ScanEye, Calculator, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BOQ_TEMPLATES } from '@/lib/constants';
import imageCompression from 'browser-image-compression';

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

export default function AiAssistant() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isClarifying, setIsClarifying] = useState(false);
    const responseRef = useRef<HTMLDivElement>(null);

    // Typewriter effect states
    const [placeholder, setPlaceholder] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    const texts = [
        'Descreva o que precisa orçar...',
        'Ex: Pintar uma sala de 20m²',
        'Ex: Construir um muro de 10 metros',
        'Ex: Trocar o piso da cozinha'
    ];

    // Scroll to bottom when messages change
    useEffect(() => {
        if (responseRef.current) {
            responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages, isLoading]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);

        // Add user message
        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            text: query,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMsg]);
        const currentQuery = query;
        setQuery('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: currentQuery }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar solicitação');
            }

            // Add AI response
            const aiMsg: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                text: data.text || '',
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
            description: description,
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
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(`estimate_${newId}`, JSON.stringify(newBudget));
        router.push(`/editor/${newId}?type=obra_nova`);
    };

    // Typewriter effect
    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % texts.length;
            const fullText = texts[i];

            setPlaceholder(
                isDeleting
                    ? fullText.substring(0, placeholder.length - 1)
                    : fullText.substring(0, placeholder.length + 1)
            );

            setTypingSpeed(isDeleting ? 30 : 150);

            if (!isDeleting && placeholder === fullText) {
                setTimeout(() => setIsDeleting(true), 2000);
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
            {/* Search Bar - now at the top */}
            <div className="relative z-50">
                <form onSubmit={handleSearch} className="relative z-10 w-full">
                    <div
                        className="relative flex items-center w-full rounded-[24px] transition-all duration-300
                            bg-white dark:bg-[#1A1A1A]/90
                            shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                            border border-orange-500/40 dark:border-orange-500/20
                            hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]
                            focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:border-orange-500
                            cursor-text pl-6 pr-2 py-2"
                        style={{ minHeight: '64px' }}
                        onClick={() => {
                            const textarea = document.getElementById('search-textarea');
                            if (textarea) textarea.focus();
                        }}
                    >
                        <div className="flex-1 relative">
                            {isClarifying && (
                                <div className="absolute -top-6 left-0 flex items-center gap-2 text-orange-500 animate-pulse bg-white/50 dark:bg-black/50 px-2 py-0.5 rounded-full text-[10px] backdrop-blur-sm pointer-events-none">
                                    <Sparkles size={12} className="animate-spin" />
                                    <span className="font-medium">Aguardando resposta...</span>
                                </div>
                            )}
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
                                placeholder={placeholder}
                                className="w-full bg-transparent border-none outline-none resize-none
                                    text-gray-800 dark:text-gray-100 text-base
                                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                                    py-2 pr-2
                                    focus:ring-0 max-h-[120px]"
                                rows={1}
                                disabled={isLoading}
                                style={{ minHeight: '24px' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!query.trim() || isLoading}
                            className="p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-100 dark:disabled:bg-gray-800
                                text-white disabled:text-gray-400 dark:disabled:text-gray-500 
                                rounded-2xl transition-all duration-200
                                disabled:cursor-not-allowed disabled:shadow-none
                                shadow-md hover:shadow-lg active:scale-95 shrink-0 ml-2"
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <Send size={20} className={query.trim() ? "translate-x-0.5" : ""} />
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Chat Messages - now appears below the search bar */}
            {messages.length > 0 && (
                <div className="mt-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            {msg.role === 'user' ? (
                                <div className="max-w-[85%] bg-orange-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-md">
                                    <div className="text-sm whitespace-pre-line">{msg.text}</div>
                                </div>
                            ) : msg.isClarification ? (
                                <div className="max-w-[85%]">
                                    <div className="flex gap-3 items-start p-3 bg-orange-50/95 dark:bg-orange-900/20 rounded-2xl rounded-bl-sm shadow-sm border border-orange-200 dark:border-orange-800/30 backdrop-blur-sm">
                                        <div className="p-1.5 bg-orange-100 dark:bg-orange-900/50 text-orange-600 rounded-full shrink-0">
                                            <Sparkles size={14} />
                                        </div>
                                        <div className="text-xs text-gray-800 dark:text-orange-200 font-medium">
                                            <p className="font-bold text-[9px] text-orange-600 dark:text-orange-400 mb-0.5 uppercase tracking-wider">Preciso de um detalhe</p>
                                            <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-[85%] bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl rounded-bl-sm p-4 border border-white/20 dark:border-gray-700/30 shadow-sm">
                                    <div className="flex gap-3">
                                        <div className="mt-1 bg-orange-100/80 dark:bg-orange-900/30 p-1.5 rounded-lg h-fit text-orange-600 dark:text-orange-400 shrink-0">
                                            <Bot size={16} />
                                        </div>
                                        <div className="space-y-4 w-full">
                                            <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed font-medium">
                                                {msg.text}
                                            </div>

                                            {msg.suggestedBudget && (
                                                <div className="bg-orange-50/40 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100/50 dark:border-orange-800/30">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-semibold text-orange-900 dark:text-orange-300 text-sm">Orçamento Sugerido</h4>
                                                        <span className="text-xs text-orange-600 dark:text-orange-300 bg-orange-100/50 dark:bg-orange-900/50 px-2 py-1 rounded-full">
                                                            {msg.suggestedBudget.items.filter(i => i.included !== false).length} itens
                                                        </span>
                                                    </div>

                                                    <ul className="space-y-2 mb-4">
                                                        {msg.suggestedBudget.items.map((item, idx) => (
                                                            <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex justify-between items-center bg-white/50 dark:bg-black/20 px-2 py-1.5 rounded">
                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                    <span className="text-[10px] shrink-0 opacity-70">
                                                                        {item.type === 'service' ? '🔨' : '🧱'}
                                                                    </span>
                                                                    <span className="truncate">{item.name}</span>
                                                                </div>
                                                                <span className="font-medium shrink-0 ml-2">~R$ {item.price}</span>
                                                            </li>
                                                        ))}
                                                    </ul>

                                                    <button
                                                        onClick={() => handleCreateBudget(msg.suggestedBudget!, msg.text, msg.text)}
                                                        className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                                                    >
                                                        <FilePlus size={16} />
                                                        Criar orçamento com estes itens
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
                            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl rounded-bl-sm p-4 flex items-center gap-3">
                                <Loader2 size={16} className="animate-spin text-orange-500" />
                                <span className="text-xs text-gray-500 font-medium">Analisando...</span>
                            </div>
                        </div>
                    )}
                    <div ref={responseRef} />
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2 border border-red-100 dark:border-red-800/50">
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
