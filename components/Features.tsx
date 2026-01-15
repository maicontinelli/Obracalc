'use client';

import { Calculator, FileText, Zap, Camera, Map, ScanEye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const features = [
    {
        icon: <Calculator className="h-6 w-6 text-primary dark:text-blue-400" />,
        title: "Orçamentos Inteligentes",
        description: "Cálculos precisos baseados na tabela SINAPI atualizada e preços médios de mercado.",
        action: 'new',
        linkText: "Novo Orçamento",
        borderColor: "#22c55e", // green-500
        badge: "Novo"
    },
    {
        icon: <ScanEye className="h-6 w-6 text-[#FF6600]" />,
        title: "Diagnóstico Visual",
        description: "IA analisa fotos do ambiente, identifica patologias e sugere soluções técnicas.",
        link: '/novo-diagnostico',
        linkText: "Novo Diagnóstico",
        borderColor: "#FF6600",
        badge: "Beta"
    },
    {
        icon: <Camera className="h-6 w-6 text-[#6366F1]" />,
        title: "Relatório Fotográfico",
        description: "IA analisa fotos da obra e gera relatório técnico profissional automaticamente.",
        link: "/relatorio-fotografico",
        linkText: "Iniciar Relatório",
        borderColor: "#6366F1",
        badge: "Novo"
    },
    {
        icon: <Map className="h-6 w-6 text-[#C2410C]" />,
        title: "Memorial de Topografia",
        description: "Gere memorial descritivo técnico + planilha Excel pronta para prefeitura e cartório.",
        link: "/topografia",
        linkText: "Iniciar Topografia",
        borderColor: "#C2410C",
        badge: "Novo"
    }
];

export function Features() {
    const router = useRouter();

    const handleAction = (action: string) => {
        if (action === 'new') {
            const newId = crypto.randomUUID();
            router.push(`/editor/${newId}?type=obra_nova`);
        }
    };

    return (
        <section className="py-24 bg-gray-50 dark:bg-[#191919]">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Fluxo Completo de Documentação com IA
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Do orçamento ao relatório técnico — ferramentas integradas e prontas para usar.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => {
                        const content = (
                            <>
                                <div className="mb-6 flex justify-between items-start">
                                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center shadow-inner">
                                        {feature.icon}
                                    </div>
                                    <div className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${feature.badge === 'Beta'
                                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        }`}>
                                        {feature.badge}
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 flex-grow">
                                    {feature.description}
                                </p>

                                {(feature as any).linkText && (
                                    <button className="w-full mt-auto py-3 px-4 bg-white dark:bg-gray-800 border-2 border-primary/10 hover:border-primary/30 dark:border-blue-500/20 dark:hover:border-blue-500/50 text-primary dark:text-blue-400 rounded-xl font-bold text-xs whitespace-nowrap flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white dark:group-hover:bg-blue-600 dark:group-hover:text-white transition-all duration-300">
                                        {(feature as any).linkText}
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </button>
                                )}
                            </>
                        );

                        // Using style for the hover border color to support arbitrary colors without safelisting
                        const hoverStyle = {
                            '--hover-color': (feature as any).borderColor
                        } as React.CSSProperties;

                        const className = "group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-black/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer relative overflow-hidden hover:border-[var(--hover-color)]";

                        if ((feature as any).link) {
                            return (
                                <Link key={index} href={(feature as any).link} className={className} style={hoverStyle}>
                                    {content}
                                </Link>
                            );
                        }

                        if ((feature as any).action) {
                            return (
                                <div key={index} onClick={() => handleAction((feature as any).action)} className={className} style={hoverStyle}>
                                    {content}
                                </div>
                            );
                        }

                        return (
                            <div key={index} className={className} style={hoverStyle}>
                                {content}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
