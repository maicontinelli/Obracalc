'use client';

import { Calculator, FileText, Camera, Map, ScanEye, ArrowRight, Zap, X, Maximize2, Gem, TrendingUp, PieChart } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import NextImage from "next/image";
import { cn } from "@/lib/utils";

export function Features() {
    const router = useRouter();
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleStartStart = () => {
        const newId = crypto.randomUUID();
        router.push(`/editor/${newId}?type=obra_nova`);
    };

    return (
        <section className="py-24 bg-transparent relative overflow-hidden">

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6 tracking-tight">
                        Muito mais que um <span className="text-[#6366F1]">simples orçamento</span>
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                        Entregue análises completas e detalhadas, tudo pronto para impressionar o cliente.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 max-w-6xl mx-auto">

                    {/* Feature 1: Cronograma (Full Width - Text Left, Image Right) */}
                    <div className="md:col-span-12 group">
                        <SpotlightCard className="h-full overflow-hidden p-0 border-neutral-200 dark:border-white/10 flex flex-col md:flex-row items-stretch">
                            <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:rotate-12 transition-transform shrink-0">
                                        <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                                        Projeção Financeira
                                    </h3>
                                </div>
                                <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">
                                    Acompanhe a evolução da sua obra mês a mês com projeções precisas de desembolso. Saiba exatamente quanto será gasto em cada etapa e evite surpresas no fluxo de caixa.
                                </p>
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">
                                    <span>Gestão de Fluxo de Caixa</span>
                                </div>
                            </div>
                            <div className="flex-[1.4] relative min-h-[300px] md:min-h-[450px] bg-neutral-50/50 dark:bg-white/5 flex items-center justify-center p-6 md:p-12">
                                {/* Dashboard Mockup Window */}
                                <div
                                    className="relative w-full aspect-video md:h-full shadow-2xl rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 transition-transform duration-700 group-hover:scale-[1.03] cursor-zoom-in group/mockup"
                                    onClick={() => setPreviewImage("/cronograma.webp")}
                                >
                                    <div className="absolute top-0 left-0 right-0 h-6 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-white/5 flex items-center px-3 gap-1.5 z-10">
                                        <div className="w-2 h-2 rounded-full bg-red-400/50" />
                                        <div className="w-2 h-2 rounded-full bg-amber-400/50" />
                                        <div className="w-2 h-2 rounded-full bg-emerald-400/50" />
                                    </div>
                                    <div className="relative mt-6 h-[calc(100%-24px)] w-full">
                                        <NextImage
                                            src="/cronograma.webp"
                                            alt="Cronograma Preview"
                                            fill
                                            className="object-contain p-4"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover/mockup:bg-black/5 transition-colors flex items-center justify-center">
                                            <Maximize2 className="w-8 h-8 text-black/0 group-hover/mockup:text-black/20 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>
                    </div>

                    {/* Feature 2: Curva ABC (Full Width - Image Left, Text Right) */}
                    <div className="md:col-span-12 group">
                        <SpotlightCard className="h-full overflow-hidden p-0 border-neutral-200 dark:border-white/10 flex flex-col md:flex-row-reverse items-stretch">
                            <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                                        <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                                        Análise de custo
                                    </h3>
                                </div>
                                <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">
                                    Identifique instantaneamente onde está 80% do seu custo. Tome decisões estratégicas baseadas no que realmente importa no seu orçamento, priorizando os insumos de maior impacto financeiro.
                                </p>
                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider">
                                    <span>Análise de Pareto Automática</span>
                                </div>
                            </div>
                            <div className="flex-[1.4] relative min-h-[300px] md:min-h-[450px] bg-neutral-50/50 dark:bg-white/5 flex items-center justify-center p-6 md:p-12">
                                {/* Dashboard Mockup Window */}
                                <div
                                    className="relative w-full aspect-video md:h-full shadow-2xl rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 transition-transform duration-700 group-hover:scale-[1.03] cursor-zoom-in group/mockup"
                                    onClick={() => setPreviewImage("/curva-abc.webp")}
                                >
                                    <div className="absolute top-0 left-0 right-0 h-6 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-white/5 flex items-center px-3 gap-1.5 z-10">
                                        <div className="w-2 h-2 rounded-full bg-red-400/50" />
                                        <div className="w-2 h-2 rounded-full bg-amber-400/50" />
                                        <div className="w-2 h-2 rounded-full bg-emerald-400/50" />
                                    </div>
                                    <div className="relative mt-6 h-[calc(100%-24px)] w-full">
                                        <NextImage
                                            src="/curva-abc.webp"
                                            alt="Curva ABC Preview"
                                            fill
                                            className="object-contain p-4"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover/mockup:bg-black/5 transition-colors flex items-center justify-center">
                                            <Maximize2 className="w-8 h-8 text-black/0 group-hover/mockup:text-black/20 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>
                    </div>

                    {/* Feature 3: Contratos (Full Width - Text Left, Image Right) */}
                    <div className="md:col-span-12 group">
                        <SpotlightCard className="h-full overflow-hidden p-0 border-neutral-200 dark:border-white/10 flex flex-col md:flex-row items-stretch">
                            <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                                        Contratos Automáticos
                                    </h3>
                                </div>
                                <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">
                                    Gere contratos de prestação de serviço personalizados com os dados do orçamento. Segurança jurídica garantida em apenas um clique, com preenchimento automático de dados do cliente e do prestador.
                                </p>
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wider">
                                    <span>Segurança Jurídica Instantânea</span>
                                </div>
                            </div>
                            <div className="flex-[1.4] relative min-h-[300px] md:min-h-[450px] bg-neutral-50/50 dark:bg-white/5 flex items-center justify-center p-6 md:p-12">
                                {/* Dashboard Mockup Window (Mac Style) */}
                                <div
                                    className="relative w-full aspect-[4/3] md:h-full shadow-2xl rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 transition-transform duration-700 group-hover:scale-[1.03] cursor-zoom-in group/mockup"
                                    onClick={() => setPreviewImage("/contrato-preview.webp")}
                                >
                                    <div className="absolute top-0 left-0 right-0 h-6 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-white/5 flex items-center px-3 gap-1.5 z-10">
                                        <div className="w-2 h-2 rounded-full bg-red-400/50" />
                                        <div className="w-2 h-2 rounded-full bg-amber-400/50" />
                                        <div className="w-2 h-2 rounded-full bg-emerald-400/50" />
                                    </div>
                                    <div className="relative mt-6 h-[calc(100%-24px)] w-full">
                                        <NextImage
                                            src="/contrato-preview.webp"
                                            alt="Contrato Preview"
                                            fill
                                            className="object-contain p-4"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover/mockup:bg-black/5 transition-colors flex items-center justify-center">
                                            <Maximize2 className="w-8 h-8 text-black/0 group-hover/mockup:text-black/20 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>
                    </div>

                    {/* Feature 4: Call to Action (Full Width - Bottom Banner) */}
                    <div className="md:col-span-12">
                        <Link href="/planos#profissional" className="block h-full group">
                            <SpotlightCard
                                className="h-full p-8 md:p-16 flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-[#74D2E7]/10 to-transparent border-[#74D2E7]/30 ring-1 ring-[#74D2E7]/20 hover:ring-[#74D2E7]/40 transition-all shadow-xl text-center md:text-left rounded-3xl overflow-hidden"
                                spotlightColor="rgba(116, 210, 231, 0.1)"
                            >
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-2xl md:text-4xl font-bold text-foreground font-heading leading-tight max-w-3xl">
                                        Veja porque usuários do <span className="text-[#74D2E7]">plano PRÓ</span> estão cobrando até +20% em seus orçamentos!
                                    </h3>

                                    <ul className="space-y-3 text-muted-foreground text-sm md:text-base text-left list-none pl-0">
                                        {[
                                            "IA que avalia e otimiza seus preços automaticamente",
                                            "Relatórios com curva ABC e cronograma físico-financeiro",
                                            "Contrato de prestação de serviço pronto",
                                            "Personalização de sua logomarca",
                                            "E diversos recursos exclusivos que o ajudam ganhar tempo e valorizar sua proposta"
                                        ].map((bullet, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#74D2E7] shrink-0" />
                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                                        <div className="flex items-center gap-3 font-bold text-[#74D2E7] group-hover:gap-6 transition-all uppercase tracking-[0.2em] text-sm md:text-base border-b-2 border-transparent group-hover:border-[#74D2E7] pb-1">
                                            <span>Conhecer todos os recursos agora</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:flex ml-12 flex-shrink-0 relative group-hover:scale-105 transition-transform duration-500">
                                    <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-[#74D2E7] to-[#4ab8d1] flex items-center justify-center shadow-2xl shadow-[#74D2E7]/20 ring-8 ring-white/5">
                                        <Gem className="w-20 h-20 text-[#3D3A36] fill-[#3D3A36] animate-pulse" />
                                    </div>
                                    <div className="absolute inset-0 bg-[#74D2E7] blur-[60px] opacity-20 -z-10 group-hover:opacity-40 transition-opacity" />
                                </div>
                            </SpotlightCard>
                        </Link>
                    </div>

                </div>
            </div>

            {/* Lightbox / Preview Overlay */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(null);
                        }}
                        aria-label="Fechar preview"
                    >
                        <X className="w-10 h-10" />
                    </button>
                    <div className="relative w-full max-w-5xl aspect-[3/4] md:aspect-auto md:h-[90vh] animate-in zoom-in-95 duration-300">
                        <NextImage
                            src={previewImage}
                            alt="Preview ampliado"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            )}
        </section>
    );
}
