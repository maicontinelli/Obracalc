'use client';

import { useState, useRef } from 'react';
import { Check, X, User, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/Button';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

export default function PlansPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTermsError, setShowTermsError] = useState(false);
    const checkboxRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const handleSubscribe = async (planName: string) => {
        if (!termsAccepted) {
            setShowTermsError(true);
            checkboxRef.current?.focus();
            return;
        }
        setShowTermsError(false);
        setLoading(planName);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setSelectedPlan(planName);
                setShowAuthModal(true);
                setLoading(null);
                return;
            }

            // Save terms acceptance before checkout
            await supabase
                .from('profiles')
                .update({ terms_accepted_at: new Date().toISOString() })
                .eq('id', user.id);

            // Check if user has document_id (CPF/CNPJ)
            const { data: profile } = await supabase
                .from('profiles')
                .select('document_id')
                .eq('id', user.id)
                .single();

            if (!profile?.document_id) {
                if (typeof window !== 'undefined') {
                    alert('Para gerar a cobrança, precisamos que você informe seu CPF ou CNPJ. Vamos te redirecionar para preencher esse dado.');
                    window.location.href = `/dashboard?openProfile=true`;
                }
                return;
            }

            const response = await fetch('/api/abacatepay/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: planName, userId: user.id }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('Erro ao criar sessão de checkout:', data.error);
                alert(`Erro ao iniciar pagamento: ${data.error || 'Tente novamente.'}`);
            }
        } catch (error: any) {
            console.error('Erro detalhado:', error);
            alert(`Erro técnico: ${error.message || JSON.stringify(error)}`);
        } finally {
            setLoading(null);
        }
    };

    const plans = [
        {
            name: 'Básico',
            priceDisplay: 'R$ 25,00',
            period: '/único',
            subtext: 'Pagamento fixo e permanente',
            description: 'Acesso vitalício aos recursos essenciais.',
            features: [
                'Criação de orçamentos técnicos com IA',
                'Até 2 orçamentos completos',
                'Visualização no dashboard',
                'Edição básica de itens',
                'Histórico limitado',
            ],
            limitations: [
                'Exportação limitada (PDF / Word / Excel)',
                'Marca d’água ObraPlana',
            ],
            cta: 'Adquirir Plano Básico',
            href: null, // Enabling checkout flow
            priceId: 'basic_one_time',
            popular: false,
        },
        {
            name: 'Profissional',
            priceDisplay: billingCycle === 'monthly' ? 'R$ 39,00' : 'R$ 468,00',
            period: billingCycle === 'monthly' ? '/mês' : '/ano',
            subtext: billingCycle === 'monthly' ? 'Cobrado anualmente (R$ 468,00)' : 'Equivalente a R$ 39,00/mês',
            description: 'Mais barato que um cafezinho no aeroporto.',
            features: [
                'Até 60 orçamentos por ano',
                'Orçamentos completos e detalhados',
                'Exportação em PDF, Word e Excel',
                'Histórico completo de clientes e obras',
                'Edição e reaproveitamento de orçamentos',
                'Relatórios sem marca d’água',
                'Suporte padrão',
            ],
            limitations: [],
            cta: 'Evoluir para Profissional',
            href: null,
            priceId: 'price_1Sl8fkGZfnvqYwvYTdmFAUM4',
            popular: true,
        },
        {
            name: 'Empresarial',
            priceDisplay: billingCycle === 'monthly' ? 'R$ 79,00' : 'R$ 948,00',
            period: billingCycle === 'monthly' ? '/mês' : '/ano',
            subtext: billingCycle === 'monthly' ? 'Cobrado anualmente (R$ 948,00)' : 'Equivalente a R$ 79,00/mês',
            description: 'Para empresas que desejam fechar mais obras.',
            features: [
                'Orçamentos ilimitados',
                'Exportações ilimitadas',
                'Histórico completo e permanente',
                'Padronização de linguagem e estrutura',
                'Documentos complementares',
                'Relatórios profissionais prontos para envio',
                'Acesso a leads de obras reais',
            ],
            limitations: [],
            cta: 'Participar como empresa',
            href: null,
            priceId: 'price_1Sl8gZGZfnvqYwvYSqt716Vm',
            popular: false,
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <main className="flex-grow pb-24">
                <section className="relative overflow-hidden bg-gradient-to-br from-[#74D2E7]/5 via-background to-[#74D2E7]/5 pt-20 pb-6 border-b border-white/5 mb-8">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#74D2E7]/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#74D2E7]/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center max-w-7xl mx-auto">
                            <h1 className="text-3xl md:text-5xl font-heading font-bold tracking-tight text-foreground max-w-6xl mx-auto leading-tight mb-6">
                                A ferramenta definitiva para <br /> criar <span className="text-[#74D2E7]">orçamentos</span> completos
                            </h1>
                            <p className="text-sm md:text-base font-manrope font-semibold text-foreground mb-0">
                                Use no seu ritmo. Evolua quando fizer sentido
                            </p>
                            <div className="flex justify-center mt-8">
                                <Image
                                    src="/mascot-running.png"
                                    alt="Mascote ObraPlana correndo com projeto"
                                    width={126}
                                    height={126}
                                    priority
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-4 mb-12">
                    <div className="flex justify-center items-center gap-4">
                        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                            Mensal
                        </span>
                        <button
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                            className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#74D2E7] ${billingCycle === 'yearly' ? 'bg-[#74D2E7]' : 'bg-gray-300 dark:bg-gray-600'}`}
                            aria-label="Alternar entre cobrança mensal e anual"
                        >
                            <div
                                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`}
                            />
                        </button>
                        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                            Anual
                        </span>
                    </div>
                    {/* Badge for Yearly Savings if needed in future */}
                </div>

                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                id={plan.name === 'Profissional' ? 'profissional' : undefined}
                                className={`relative flex flex-col p-8 rounded-2xl border bg-card transition-shadow hover:shadow-xl scroll-mt-24 ${plan.popular
                                    ? 'border-[#74D2E7] shadow-lg ring-1 ring-[#74D2E7]/50'
                                    : 'border-border dark:border-white/15'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="relative px-4 py-1 bg-[#74D2E7] text-[#3D3A36] text-sm font-bold rounded-full shadow-sm">
                                            Mais Popular
                                        </div>
                                    </div>
                                )}

                                <div className="mb-2 text-center">
                                    <h3 className="text-2xl font-bold text-foreground mb-2">
                                        {plan.name}
                                    </h3>
                                </div>

                                <div className="mb-6 text-center">
                                    <p className="text-muted-foreground min-h-[48px] flex items-center justify-center">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mb-4 flex flex-col items-center justify-center min-h-[5rem]">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-foreground">
                                            {plan.priceDisplay}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {plan.period}
                                        </span>
                                    </div>
                                    {plan.subtext && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {plan.subtext}
                                        </p>
                                    )}
                                </div>

                                <div className="w-full mb-4">
                                    <Button
                                        onClick={() => handleSubscribe(plan.name)}
                                        disabled={loading === plan.name}
                                        className={`w-full h-12 text-base font-bold transition-all duration-300 rounded-full ${plan.popular
                                            ? 'bg-[#74D2E7] hover:bg-[#5bc0de] text-[#3D3A36] border-none shadow-lg shadow-[#74D2E7]/20'
                                            : plan.name === 'Básico'
                                                ? 'bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-foreground border border-border dark:border-white/15 shadow-sm'
                                                : plan.name === 'Empresarial'
                                                    ? 'bg-[#1e293b] text-white border border-[#1e293b] hover:bg-[#0f172a] hover:border-[#0f172a]'
                                                    : 'bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        {loading === plan.name ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                Processando...
                                            </span>
                                        ) : (
                                            plan.cta
                                        )}
                                    </Button>
                                </div>
                                <div className="flex-grow border-t border-border/50 pt-6">
                                    <ul className="space-y-4">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3">
                                                <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${feature === 'Acesso exclusivo ao sistema de indicação'
                                                    ? 'text-[#74D2E7] stroke-[3]'
                                                    : 'text-blue-500'
                                                    }`} />
                                                <span className={`text-foreground text-sm ${(feature === 'Acesso exclusivo ao sistema de indicação' || feature === 'Orçamentos ilimitados') ? 'font-bold' : ''}`}>
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                        {plan.limitations.map((limitation) => (
                                            <li key={limitation} className="flex items-start gap-3">
                                                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground text-sm">
                                                    {limitation}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Terms acceptance checkbox — shared across all plans */}
                    <div className="mt-10 max-w-2xl mx-auto">
                        <label
                            htmlFor="terms-checkbox"
                            className={`flex items-start gap-3 cursor-pointer p-4 rounded-2xl border transition-colors ${showTermsError
                                    ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                                    : termsAccepted
                                        ? 'border-[#74D2E7]/60 bg-[#74D2E7]/5'
                                        : 'border-border bg-card'
                                }`}
                        >
                            <input
                                ref={checkboxRef}
                                id="terms-checkbox"
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={e => {
                                    setTermsAccepted(e.target.checked);
                                    if (e.target.checked) setShowTermsError(false);
                                }}
                                className="mt-0.5 w-4 h-4 accent-[#74D2E7] shrink-0"
                            />
                            <span className="text-sm text-foreground leading-relaxed">
                                Li e concordo com os{' '}
                                <a
                                    href="/termos"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#74D2E7] hover:underline font-semibold"
                                    onClick={e => e.stopPropagation()}
                                >
                                    Termos de Uso e Política de Cancelamento
                                </a>
                                , incluindo a{' '}
                                <span className="font-semibold">Garantia Incondicional de 14 dias</span>.
                            </span>
                        </label>
                        {showTermsError && (
                            <p className="text-xs text-red-500 mt-2 ml-1">
                                ⚠️ Você precisa aceitar os Termos de Uso para continuar.
                            </p>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm font-manrope text-muted-foreground">
                            Cancele quando quiser. Sem contratos ou fidelidade.
                        </p>
                    </div>
                </div>

                {/* Auth Modal */}
                {showAuthModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <SpotlightCard
                            className="w-full max-w-md bg-background border-neutral-200 dark:border-white/10 p-8 shadow-2xl relative"
                            spotlightColor="rgba(116, 210, 231, 0.15)"
                        >
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Fechar"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-[#74D2E7]/10 rounded-full flex items-center justify-center mb-6">
                                    <Lock className="w-8 h-8 text-[#74D2E7]" />
                                </div>

                                <h3 className="text-2xl font-heading font-bold text-foreground mb-3">
                                    Crie sua conta Gratuita
                                </h3>

                                <p className="text-muted-foreground mb-8 leading-relaxed">
                                    Para assinar o plano <span className="font-bold text-foreground">{selectedPlan}</span>, você precisa ter um cadastro no ObraPlana primeiro. É rápido e gratuito.
                                </p>

                                <div className="w-full space-y-3">
                                    <Link href={`/login?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/planos')}`} className="w-full block">
                                        <Button className="w-full h-12 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 text-base flex items-center justify-center gap-2">
                                            Criar conta Grátis
                                            <ArrowRight size={18} />
                                        </Button>
                                    </Link>

                                    <Link href="/login" className="w-full block">
                                        <Button
                                            variant="ghost"
                                            className="w-full h-12 text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-white/5 font-medium rounded-xl"
                                        >
                                            Já tenho uma conta
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </SpotlightCard>
                    </div>
                )}
            </main>
        </div >
    );
}
