'use client';

import { useState } from 'react';
import { Check, X, User, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

export default function PlansPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const supabase = createClient();

    const handleSubscribe = async (planName: string) => {
        setLoading(planName);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Show custom modal instead of alert
                setSelectedPlan(planName);
                setShowAuthModal(true);
                setLoading(null);
                return;
            }

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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan: planName,
                    userId: user.id
                }),
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
            name: 'Grátis',
            priceDisplay: 'R$ 0',
            period: '/sempre',
            subtext: null,
            description: 'É sério, você pode criar sua conta gratuita agora mesmo!',
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
                'Limite de itens por orçamento',
            ],
            cta: 'Começar agora',
            ctaCaption: 'Para conhecer a ferramenta',
            href: '/login',
            priceId: null,
            popular: false,
        },
        {
            name: 'Profissional',
            priceDisplay: billingCycle === 'monthly' ? 'R$ 9,17' : 'R$ 110,00',
            period: billingCycle === 'monthly' ? '/mês' : '/ano',
            subtext: billingCycle === 'monthly' ? 'Cobrado anualmente (R$ 110,00)' : 'Equivalente a R$ 9,17/mês',
            description: 'Mais barato que um cafezinho no aeroporto.',
            features: [
                'Até 60 orçamentos por ano',
                'Orçamentos completos e detalhados',
                'Exportação em PDF, Word e Excel',
                'Histórico completo de clientes e obras',
                'Edição e reaproveitamento de orçamentos',
                'Relatórios sem marca d’água',
                'Suporte padrão',
                'Flexibilidade inteligente para orçamentos extras e picos de demanda',
            ],
            limitations: [],
            cta: 'Evoluir para Profissional',
            ctaCaption: 'E ganhar tempo orçando',
            href: null,
            priceId: 'price_1Sl8fkGZfnvqYwvYTdmFAUM4',
            popular: true,
        },
        {
            name: 'Empresarial',
            priceDisplay: billingCycle === 'monthly' ? 'R$ 70,00' : 'R$ 840,00',
            period: billingCycle === 'monthly' ? '/mês' : '/ano',
            subtext: billingCycle === 'monthly' ? 'Cobrado anualmente (R$ 840,00)' : 'Equivalente a R$ 70,00/mês',
            description: 'Para empresas que tratam orçamento como parte crítica do negócio.',
            features: [
                'Orçamentos ilimitados',
                'Exportações ilimitadas',
                'Histórico completo e permanente',
                'Padronização de linguagem e estrutura',
                'Documentos complementares',
                'Relatórios profissionais prontos para envio',
                'Suporte prioritário',
                'Multiuso interno (até 3 usuários)',
            ],
            limitations: [],
            cta: 'Participar como empresa',
            ctaCaption: 'Para fechar negócios',
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
                                A ferramenta definitiva para criar <span className="text-[#74D2E7]">orçamentos</span> completos
                            </h1>
                            <p className="text-sm md:text-base font-manrope font-semibold text-foreground mb-0">
                                Use no seu ritmo. Evolua quando fizer sentido
                            </p>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-4 mb-8">
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
                                className={`relative flex flex-col p-8 rounded-2xl border bg-card transition-shadow hover:shadow-xl ${plan.popular
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

                                <div className="mb-4">
                                    <h3 className="text-2xl font-bold text-foreground mb-2">
                                        {plan.name}
                                    </h3>
                                    <p className="text-muted-foreground min-h-[48px]">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="flex-grow mb-8 border-t border-border/50 pt-6">
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

                                <div className="mb-6 flex flex-col items-center justify-center min-h-[5rem]">
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

                                {plan.href ? (
                                    <div className="w-full">
                                        <Link
                                            href={plan.href}
                                            className="w-full"
                                            target={plan.href.startsWith('http') ? '_blank' : '_self'}
                                        >
                                            <Button
                                                className={`w-full h-12 text-base font-bold transition-all duration-300 rounded-full ${plan.popular
                                                    ? 'bg-[#FF6600] hover:bg-[#FF6600]/90 text-white border-none'
                                                    : plan.name === 'Grátis'
                                                        ? 'bg-[#E9813C] hover:bg-[#d67332] text-white border-none shadow-lg shadow-[#E9813C]/20'
                                                        : plan.name === 'Empresarial'
                                                            ? 'bg-[#1e293b] text-white border border-[#1e293b] hover:bg-[#0f172a] hover:border-[#0f172a]'
                                                            : 'bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                                    }`}
                                                variant={plan.popular || plan.name === 'Empresarial' ? 'default' : (plan.name === 'Grátis' ? 'ghost' : 'outline')}
                                            >
                                                {plan.cta}
                                            </Button>
                                        </Link>
                                        <p className="mt-2 text-xs text-center text-muted-foreground font-medium">
                                            {plan.ctaCaption}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="w-full">
                                        <Button
                                            className={`w-full h-12 text-base font-bold transition-all duration-300 rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 ${plan.popular
                                                ? 'bg-[#74D2E7] hover:bg-[#5bc0de] text-white border border-transparent shadow-[#74D2E7]/20 text-[#3D3A36]'
                                                : plan.name === 'Empresarial'
                                                    ? 'bg-[#1e293b] text-white border border-gray-700 hover:bg-[#0f172a] shadow-gray-900/20'
                                                    : 'bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                                }`}
                                            variant={plan.popular || plan.name === 'Empresarial' ? 'default' : 'outline'}
                                            onClick={() => handleSubscribe(plan.name)}
                                            disabled={loading === plan.name}
                                        >
                                            {loading === plan.name ? 'Processando...' : plan.cta}
                                        </Button>
                                        <p className="mt-2 text-xs text-center text-muted-foreground font-medium">
                                            {plan.ctaCaption}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 text-center">
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
                                        <Button className="w-full h-12 bg-[#E9813C] hover:bg-[#d67332] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 text-base flex items-center justify-center gap-2">
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
