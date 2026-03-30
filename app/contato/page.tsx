'use client';

import { Award, BookOpen, CheckCircle2, Mail, MessageSquare, Phone, Shield, Star, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ContatoPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Aqui você pode adicionar integração com API de email
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 3000);
    };

    const testimonials = [
        {
            name: "Maria Silva",
            role: "Arquiteta | Construtora MS Arquitetura",
            text: "Trabalho com o Engenheiro há mais de 5 anos. Sua precisão nos orçamentos e conhecimento técnico nos ajudaram a entregar mais de 50 projetos dentro do prazo e orçamento.",
            rating: 5
        },
        {
            name: "João Santos",
            role: "Diretor de Obras | Construtora Horizonte",
            text: "Profissional extremamente competente. Seus orçamentos são detalhados, realistas e sempre nos auxiliam na tomada de decisões estratégicas. Recomendo sem hesitação.",
            rating: 5
        },
        {
            name: "Carlos Mendes",
            role: "Engenheiro Civil | Infraworks Engenharia",
            text: "Parceiro confiável em grandes empreendimentos. Domínio técnico excepcional em cronogramas, custos e normas. Fundamental para o sucesso de nossos projetos.",
            rating: 5
        }
    ];

    const expertise = [
        { icon: BookOpen, title: "25+ Anos de Experiência", description: "Carreira consolidada no mercado de construção civil" },
        { icon: Award, title: "CREA Ativo", description: "Engenheiro Civil registrado e especializado" },
        { icon: Users, title: "500+ Projetos", description: "Orçamentos para obras de pequeno a grande porte" },
        { icon: Shield, title: "Precisão Garantida", description: "Metodologia técnica com base em SINAPI/TCPO" },
        { icon: TrendingUp, title: "Otimização de Custos", description: "Redução média de 15% nos custos de projeto" },
        { icon: CheckCircle2, title: "Conformidade Total", description: "100% de acordo com normas técnicas vigentes" }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0D9488]/5 via-background to-[#0D9488]/5 py-20 border-b border-white/5">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#0D9488]/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0D9488]/10 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-[#0D9488]/10 text-[#0D9488] px-4 py-2 rounded-full mb-6">
                            <Award className="w-4 h-4" />
                            <span className="text-sm font-semibold">Engenheiro Civil • CREA-BA</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                            Transformando Complexidade em{' '}
                            <span className="text-[#0D9488]">Clareza</span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                            Com mais de 25 anos dedicados à engenharia de custos e orçamentação, desenvolvi o <strong>ObraPlana</strong> para democratizar
                            o acesso a orçamentos profissionais. Minha missão é simplificar processos complexos e tornar a construção civil mais acessível e transparente.
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                                href="#formulario"
                                className="btn bg-[#0D9488] hover:bg-[#0F766E] text-white px-8 py-3 text-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                            >
                                <MessageSquare className="w-5 h-5" />
                                Entrar em Contato
                            </Link>
                            <Link
                                href="/sobre"
                                className="btn bg-card border border-input text-foreground px-8 py-3 text-lg hover:border-[#0D9488] transition-all"
                            >
                                Conhecer o ObraPlana
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Expertise Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Experiência e Especialização
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Décadas de atuação resultaram em metodologias consolidadas e resultados comprovados
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {expertise.map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-card rounded-xl p-6 border border-white/5 hover:border-[#0D9488] transition-all hover:shadow-lg group"
                            >
                                <div className="w-12 h-12 bg-[#0D9488]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#0D9488] group-hover:scale-110 transition-all">
                                    <item.icon className="w-6 h-6 text-[#0D9488] group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                                <p className="text-muted-foreground">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Statement */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-card rounded-2xl p-8 md:p-12 border border-white/5 shadow-xl">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-[#0D9488]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <MessageSquare className="w-6 h-6 text-[#0D9488]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                                        Por que criei o ObraPlana?
                                    </h2>
                                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                                        <p>
                                            Ao longo da minha carreira, vi inúmeros projetos fracassarem por falta de planejamento orçamentário adequado.
                                            Pequenos construtores, arquitetos autônomos e proprietários muitas vezes não têm acesso a ferramentas profissionais de orçamentação.
                                        </p>
                                        <p>
                                            <strong className="text-foreground">O ObraPlana nasceu dessa necessidade.</strong> Uma plataforma que combina
                                            inteligência artificial com décadas de conhecimento técnico, tornando orçamentos precisos acessíveis a todos –
                                            desde uma reforma residencial até grandes empreendimentos.
                                        </p>
                                        <p>
                                            Meu compromisso é com a <strong className="text-[#0D9488]">transparência, precisão e democratização do conhecimento</strong> técnico
                                            na construção civil. Cada orçamento gerado reflete padrões profissionais rigorosos, normas técnicas atualizadas e
                                            preços de mercado reais.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Reconhecimento Profissional
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            O que parceiros e clientes dizem sobre nosso trabalho
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {testimonials.map((testimonial, idx) => (
                            <div
                                key={idx}
                                className="bg-card rounded-xl p-6 border border-white/5 hover:shadow-lg transition-all"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-muted-foreground mb-6 italic">
                                    "{testimonial.text}"
                                </p>
                                <div className="border-t border-white/5 pt-4">
                                    <p className="font-bold text-foreground">{testimonial.name}</p>
                                    <p className="text-sm text-[#8a8886]">{testimonial.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section id="formulario" className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                Vamos Conversar?
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Entre em contato para dúvidas, parcerias ou suporte técnico
                            </p>
                        </div>

                        <div className="bg-card rounded-2xl p-8 border border-border shadow-xl">
                            {isSubmitted ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">Mensagem Enviada!</h3>
                                    <p className="text-muted-foreground">Retornaremos em breve.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Nome Completo *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-all placeholder-muted-foreground"
                                            placeholder="Seu nome"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-all placeholder-muted-foreground"
                                            placeholder="seu@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Telefone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-all placeholder-muted-foreground"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Mensagem *
                                        </label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-all resize-none placeholder-muted-foreground"
                                            placeholder="Como podemos ajudar?"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full btn bg-[#0D9488] hover:bg-[#0F766E] text-white py-4 text-lg font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <Mail className="w-5 h-5" />
                                        Enviar Mensagem
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Direct Contact Info */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-card rounded-lg p-6 border border-border flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#0D9488]/10 rounded-lg flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-[#0D9488]" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-semibold text-foreground">maicontinelli@gmail.com</p>
                                </div>
                            </div>

                            <div className="bg-card rounded-lg p-6 border border-border flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#0D9488]/10 rounded-lg flex items-center justify-center">
                                    <Phone className="w-6 h-6 text-[#0D9488]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#8a8886]">Telefone</p>
                                    <p className="font-semibold text-foreground">(73) 99950-3554</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
