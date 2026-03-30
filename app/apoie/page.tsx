'use client';


import { Button } from '@/components/Button';
import { Heart, BrickWall, Handshake, Rocket, Star, Building2, Trophy } from 'lucide-react';

export default function SupportPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <main className="flex-grow pb-24">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#EC4899]/5 via-background to-[#EC4899]/5 py-20 border-b border-border mb-20">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#EC4899]/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#EC4899]/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center max-w-4xl mx-auto">
                            <div className="inline-flex items-center justify-center p-3 bg-[#EC4899]/10 rounded-full mb-6">
                                <Heart className="w-8 h-8 text-[#EC4899] fill-[#EC4899]" />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-8">
                                Torne-se um Membro Ativo da Construção
                            </h1>
                            <p className="text-xl md:text-2xl text-foreground leading-relaxed max-w-3xl mx-auto">
                                Sua contribuição não é só um apoio — é uma assinatura no futuro da ferramenta.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Manifesto Section */}
                <div className="container mx-auto px-4 mb-24">
                    <div className="max-w-3xl mx-auto bg-card rounded-3xl p-8 md:p-12 border border-border">
                        <p className="text-lg text-foreground leading-relaxed mb-6">
                            Construir um app inteligente, acessível e realmente útil exige mais do que tecnologia: exige comunidade, visão e colaboração real.
                        </p>
                        <p className="text-lg text-foreground leading-relaxed font-medium">
                            Se você acredita que o Brasil precisa de soluções mais simples e transparentes para criar orçamentos de obra e reformas, este é o momento de fazer parte de algo maior.
                        </p>
                    </div>
                </div>

                {/* Why Support Section */}
                <div className="container mx-auto px-4 mb-24">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">
                        Por que apoiar o projeto?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-teal-900/30 rounded-xl flex items-center justify-center mb-6">
                                <BrickWall className="w-6 h-6 text-teal-500" />
                            </div>
                            <h3 className="text-xl font-bold text-card-foreground mb-4">
                                Você ajuda a construir uma ferramenta real
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Milhares de pessoas não sabem quanto custa um serviço, obra ou reforma. Seu apoio acelera o desenvolvimento de uma plataforma que traz clareza, preço médio e orientação inteligente.
                            </p>
                        </div>

                        <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                                <Handshake className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-card-foreground mb-4">
                                Você participa como co–criador
                            </h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li className="flex items-center gap-2">• Sugerem recursos</li>
                                <li className="flex items-center gap-2">• Testam novas funções primeiro</li>
                                <li className="flex items-center gap-2">• Ajudam a aperfeiçoar a experiência</li>
                                <li className="flex items-center gap-2">• Influenciam o rumo do app</li>
                            </ul>
                        </div>

                        <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center mb-6">
                                <Rocket className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-card-foreground mb-4">
                                Futuro mais simples e acessível
                            </h3>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Quanto mais pessoas apoiam, mais rápido entregamos:
                            </p>
                            <ul className="space-y-2 text-muted-foreground text-sm">
                                <li className="flex items-center gap-2">• Mais bases de preços</li>
                                <li className="flex items-center gap-2">• Mais categorias de serviços</li>
                                <li className="flex items-center gap-2">• IA mais precisa</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* How to Support Section */}
                <div className="container mx-auto px-4 mb-24">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">
                        Como você pode apoiar
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="flex flex-col h-full bg-card p-8 rounded-2xl border border-border hover:border-[#EC4899]/50 transition-colors">
                            <div className="w-12 h-12 bg-[#EC4899]/20 rounded-xl flex items-center justify-center mb-6">
                                <Star className="w-6 h-6 text-[#EC4899]" />
                            </div>
                            <h3 className="text-xl font-bold text-card-foreground mb-4">Apoio Individual</h3>
                            <p className="text-muted-foreground flex-grow">
                                Para pessoas que acreditam na ideia e querem participar da evolução do app.
                            </p>
                            <Button className="mt-8 w-full bg-[#EC4899] hover:bg-[#EC4899]/90 text-white border-0">Quero Apoiar</Button>
                        </div>

                        <div className="flex flex-col h-full bg-card p-8 rounded-2xl border border-border hover:border-[#EC4899]/50 transition-colors">
                            <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                                <Building2 className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-card-foreground mb-4">Apoio Empresarial</h3>
                            <p className="text-muted-foreground flex-grow">
                                Para empresas que desejam fortalecer o setor, colaborar e ter visibilidade como apoiadoras oficiais.
                            </p>
                            <Button className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white border-0">Apoiar como Empresa</Button>
                        </div>

                        <div className="flex flex-col h-full bg-card p-8 rounded-2xl border border-border hover:border-[#EC4899]/50 transition-colors">
                            <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center mb-6">
                                <Trophy className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-card-foreground mb-4">Patrocínio Estratégico</h3>
                            <p className="text-muted-foreground flex-grow">
                                Para marcas que buscam associação direta ao projeto, com destaque e benefícios exclusivos.
                            </p>
                            <Button className="mt-8 w-full bg-purple-600 hover:bg-purple-700 text-white border-0">Seja um Patrocinador</Button>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}
