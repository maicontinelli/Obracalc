'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function PlansPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const supabase = createClient();

    const handleSubscribe = async (priceId: string) => {
        setLoading(priceId);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                if (typeof window !== 'undefined') {
                    alert('Para assinar este plano, você precisa criar uma conta ou fazer login primeiro.');
                    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
                }
                return;
            }

            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    userId: user.id
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('Erro ao criar sessão de checkout:', data.error);
                alert(`Erro ao iniciar pagamento: ${data.error}`);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão. Verifique sua internet.');
        } finally {
            setLoading(null);
        }
    };

    const plans = [
        {
            name: 'Grátis',
            price: 'R$ 0',
            period: '/mês',
            description: 'Crie orçamentos completos gratuitamente e explore o poder do ObraPlana.',
            features: [
                'Crie até 5 orçamentos completos',
                'Exporte em PDF e HTML',
                'Acesso liberado ao Painel de Controle',
                'Processamento de itens e custos por IA',
            ],
            limitations: [
                'Limite de itens por orçamento',
                'Marca d’água do ObraPlana',
                'Sem acesso a leads de clientes',
                'Sem a função de comissões',
            ],
            cta: 'Começar agora',
            ctaCaption: 'Para criar orçamentos',
            href: '/login',
            priceId: null,
            popular: false,
        },
        {
            name: 'Profissional',
            price: 'R$ 29,90',
            period: '/mês',
            description: 'Crie relatórios técnicos e ainda ganhe comissões ao indicar orçamentos reais',
            features: [
                'Acesso exclusivo ao sistema de indicação',
                'Faça orçamentos ilimitados, sem restrição',
                'Personalize os relatórios com sua marca',
                'Tenha histórico completo de obras e clientes',
                'Ganhe comissões ao conectar clientes',
                'Suporte prioritário via WhatsApp',
            ],
            limitations: [
                'Sem contato direto com Leads',
            ],
            cta: 'Evoluir para Profissional',
            ctaCaption: 'Para ganhar com indicações',
            href: null,
            priceId: 'price_1Sl8fkGZfnvqYwvYTdmFAUM4',
            popular: true,
        },
        {
            name: 'Empresarial',
            price: 'R$ 149,90',
            period: '/mês',
            description: 'Receba clientes prontos para contratar e feche projetos, obras e serviços.',
            features: [
                'Todos os benefícios do Plano Profissional',
                'Ideal para fechar projetos, obras e serviços de execução',
                'Receba leads prontos para fechar proposta comercial',
                'Tenha contato direto com clientes reais',
                'Destaque máximo no buscador de profissionais',
                'Receba demandas criadas por usuários de toda a plataforma',
                'Conta verificada com selo de autoridade',
            ],
            limitations: [],
            cta: 'Quero receber clientes',
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
                            <h1 className="text-xl md:text-3xl font-heading font-bold tracking-tight text-foreground max-w-6xl mx-auto leading-tight mb-24">
                                Comece grátis – evolua para converter <br /> orçamentos em ganhos reais
                            </h1>
                            <p className="text-sm md:text-base font-manrope font-semibold text-foreground mb-0">
                                Use no seu ritmo. Evolua quando fizer sentido
                            </p>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative flex flex-col p-8 rounded-2xl border bg-card transition-shadow hover:shadow-xl ${plan.popular
                                    ? 'border-[#FF6600] shadow-lg ring-1 ring-[#FF6600]'
                                    : 'border-border dark:border-white/15'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="absolute top-[10%] left-[10%] inline-flex h-[80%] w-[80%] rounded-full bg-[#FF6600] opacity-75 animate-ping"></span>
                                        <div className="relative px-4 py-1 bg-[#FF6600] text-white text-sm font-medium rounded-full">
                                            Mais Popular
                                        </div>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-foreground mb-2">
                                        {plan.name}
                                    </h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-4xl font-bold text-foreground">
                                            {plan.price}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {plan.period}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="flex-grow mb-8">
                                    <ul className="space-y-4">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3">
                                                <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${feature === 'Acesso exclusivo ao sistema de indicação'
                                                    ? 'text-[#74D2E7] stroke-[3]'
                                                    : 'text-blue-500'
                                                    }`} />
                                                <span className={`text-foreground text-sm ${feature === 'Acesso exclusivo ao sistema de indicação' ? 'font-bold' : ''}`}>
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

                                {plan.href ? (
                                    <div className="w-full">
                                        <Link
                                            href={plan.href}
                                            className="w-full"
                                            target={plan.href.startsWith('http') ? '_blank' : '_self'}
                                        >
                                            <Button
                                                className={`w-full h-12 text-base font-bold transition-all duration-300 ${plan.popular
                                                    ? 'bg-[#FF6600] hover:bg-[#FF6600]/90 text-white border-none'
                                                    : 'bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                                    }`}
                                                variant={plan.popular ? 'default' : 'outline'}
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
                                            className={`w-full h-12 text-base font-bold transition-all duration-300 ${plan.popular
                                                ? 'bg-[#FF6600] hover:bg-[#FF6600]/90 text-white border-none'
                                                : 'bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                                }`}
                                            variant={plan.popular ? 'default' : 'outline'}
                                            onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
                                            disabled={loading === plan.priceId}
                                        >
                                            {loading === plan.priceId ? 'Processando...' : plan.cta}
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
            </main>
        </div>
    );
}
