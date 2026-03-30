'use client';

import Link from 'next/link';

import { Button } from '@/components/Button';
import { Info, Target, Heart, Users, Lightbulb } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <main className="flex-grow pb-24">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#3B82F6]/5 via-background to-[#3B82F6]/5 py-20 border-b border-white/5 mb-20">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center max-w-4xl mx-auto">
                            <div className="inline-flex items-center justify-center p-3 bg-[#3B82F6]/10 rounded-full mb-6">
                                <Info className="w-8 h-8 text-[#3B82F6]" />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-8">
                                Sobre o <span className="text-[#3B82F6]">ObraPlana</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-foreground leading-relaxed max-w-3xl mx-auto">
                                Transformando a maneira como orçamentos de obras são criados: simples, rápido e acessível para todos.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <div className="container mx-auto px-4">

                    {/* Mission/Vision/Values Grid */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
                        <div className="bg-card p-8 rounded-2xl border border-white/5 hover:border-[#3B82F6]/50 transition-all hover:shadow-lg hover:-translate-y-1">
                            <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                                <Target className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-4">Nossa Missão</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Democratizar o acesso a orçamentos de construção precisos, permitindo que profissionais e clientes tenham clareza e segurança em seus projetos.
                            </p>
                        </div>

                        <div className="bg-card p-8 rounded-2xl border border-white/5 hover:border-[#3B82F6]/50 transition-all hover:shadow-lg hover:-translate-y-1">
                            <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center mb-6">
                                <Lightbulb className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-4">Nossa Visão</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Ser a referência nacional em precificação de obras, conectando tecnologia e construção civil de forma inteligente e intuitiva.
                            </p>
                        </div>

                        <div className="bg-card p-8 rounded-2xl border border-white/5 hover:border-[#3B82F6]/50 transition-all hover:shadow-lg hover:-translate-y-1">
                            <div className="w-12 h-12 bg-teal-900/30 rounded-xl flex items-center justify-center mb-6">
                                <Heart className="w-6 h-6 text-teal-500" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-4">Nossos Valores</h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li className="flex items-center gap-2">• Transparência total</li>
                                <li className="flex items-center gap-2">• Simplicidade no uso</li>
                                <li className="flex items-center gap-2">• Foco no usuário</li>
                                <li className="flex items-center gap-2">• Inovação constante</li>
                            </ul>
                        </div>
                    </div>

                    {/* Story Section */}
                    <div className="max-w-4xl mx-auto bg-card/50 rounded-3xl p-8 md:p-12 border border-white/5 mb-24">
                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-foreground mb-6">
                                    A História por Trás
                                </h2>
                                <div className="space-y-6 text-foreground leading-relaxed">
                                    <p>
                                        O ObraPlana nasceu da observação de um problema comum: a complexidade e a falta de padronização nos orçamentos de pequenas e médias obras.
                                    </p>
                                    <p>
                                        Muitos profissionais perdem horas em planilhas complexas, enquanto clientes sofrem com a falta de clareza nos custos. Decidimos mudar isso usando tecnologia.
                                    </p>
                                    <p>
                                        Combinando inteligência artificial com bases de dados atualizadas (SINAPI), criamos uma ferramenta que faz o trabalho pesado, permitindo que você foque no que importa: construir sonhos.
                                    </p>
                                </div>
                            </div>
                            <div className="w-full md:w-1/3 flex justify-center">
                                <div className="relative w-64 h-64 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center animate-pulse">
                                    <Users className="w-32 h-32 text-foreground/20" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-foreground mb-6">
                            Faça parte dessa revolução
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8">
                            Comece hoje mesmo a criar orçamentos profissionais em minutos, não em horas.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/login">
                                <Button size="lg" className="bg-[#3B82F6] text-white hover:bg-[#2563EB] border-0 text-lg h-12 px-8 font-semibold shadow-lg shadow-blue-500/20">
                                    Começar Agora
                                </Button>
                            </Link>
                            <Link href="/contato">
                                <Button size="lg" variant="outline" className="border-input text-foreground hover:bg-accent hover:text-accent-foreground text-lg h-12 px-8 font-semibold bg-transparent">
                                    Fale Conosco
                                </Button>
                            </Link>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
