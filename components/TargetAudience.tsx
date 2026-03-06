import { Key, HardHat, Gem, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "./Button";
import Image from "next/image";

export function TargetAudience() {
    const audiences = [
        {
            id: "beginner",
            icon: <Key className="w-6 h-6" />,
            color: "text-[#2DD4BF]",
            bg: "bg-[#2DD4BF]/10",
            badge: "Iniciantes & Proprietários",
            badgeBg: "bg-[#2DD4BF]/10 text-[#0FA87E]",
            title: "Saiba o custo real da sua obra antes de começar",
            benefit: (
                <>
                    Nada de susto no meio da construção. Com a ObraPlana você descobre{" "}
                    <strong className="text-gray-900 dark:text-white font-bold">quanto vai gastar de verdade</strong> — sem precisar entender nada de engenharia.
                </>
            ),
            chips: ["Sem jargão técnico", "Em menos de 5 min", "Grátis para começar"],
            cta: "Calcular minha obra",
            hoverBorder: "hover:border-[#2DD4BF]/50",
            ctaColor: "text-[#2DD4BF]"
        },
        {
            id: "pro",
            icon: <HardHat className="w-6 h-6" />,
            color: "text-[#FF6600]",
            bg: "bg-[#FF6600]/10",
            badge: "Profissionais da Construção",
            badgeBg: "bg-[#FF6600]/10 text-[#C95F1A]",
            title: "Monte orçamentos completos em minutos, não em horas",
            benefit: (
                <>
                    Chega de planilha travando. Gere orçamentos detalhados e{" "}
                    <strong className="text-gray-900 dark:text-white font-bold">relatórios técnicos prontos para o cliente</strong> com agilidade profissional.
                </>
            ),
            chips: ["Relatório em PDF", "Composição de BDI", "Tabelas SINAPI"],
            cta: "Ver como funciona",
            hoverBorder: "hover:border-[#FF6600]/50",
            ctaColor: "text-[#FF6600]"
        },
        {
            id: "partner",
            icon: <Gem className="w-6 h-6" />,
            color: "text-[#7B6CF7]",
            bg: "bg-[#7B6CF7]/10",
            badge: "Indicadores & Parceiros",
            badgeBg: "bg-[#7B6CF7]/10 text-[#5A4DD6]",
            title: "Indique e ganhe comissão por cada orçamento fechado",
            benefit: (
                <>
                    Conecte clientes à ObraPlana e receba automaticamente.{" "}
                    <strong className="text-gray-900 dark:text-white font-bold">Sem limite de indicações, sem burocracia</strong> — quanto mais você indica, mais você ganha.
                </>
            ),
            chips: ["Comissão automática", "Dashboard de indicações", "Sem custo"],
            cta: "Quero ser parceiro",
            hoverBorder: "hover:border-[#7B6CF7]/50",
            ctaColor: "text-[#7B6CF7]"
        }
    ];

    return (
        <section className="py-24 bg-transparent relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
                        Um orçamento confiável para <br /> <span className="text-[#FF6600]">decisões reais</span>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Quem você é define como a ObraPlana pode te ajudar.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {audiences.map((card) => (
                        <Link
                            key={card.id}
                            href="/login"
                            className={`flex flex-col p-8 rounded-[2rem] bg-white dark:bg-neutral-900/50 border border-gray-200/50 dark:border-white/5 transition-all duration-300 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 group ${card.hoverBorder}`}
                        >
                            <div className="flex flex-col gap-6 flex-1">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                                    {card.icon}
                                </div>

                                <div className="space-y-4">
                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${card.badgeBg}`}>
                                        {card.badge}
                                    </span>
                                    <h3 className="text-xl font-extrabold text-foreground leading-tight">
                                        {card.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {card.benefit}
                                    </p>
                                </div>

                                <div className="h-px bg-gray-100 dark:bg-white/5" />

                                <div className="flex flex-wrap gap-2">
                                    {card.chips.map((chip, idx) => (
                                        <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-400">
                                            <Check size={10} className="text-green-500" />
                                            {chip}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className={`mt-8 inline-flex items-center gap-2 text-sm font-bold ${card.ctaColor} group-hover:gap-4 transition-all`}>
                                {card.cta} <ArrowRight size={16} />
                            </div>
                        </Link>
                    ))}
                </div>


                {/* Logistics/Trust Bar (Original) */}
                <div className="mt-24 pt-10 border-t border-gray-100 dark:border-white/5">
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-normal tracking-wide mb-8 uppercase">
                        Integração direta com as bases de referência nacional
                    </p>
                    <div className="relative flex overflow-hidden w-full mask-linear-fade opacity-50 hover:opacity-100 transition-opacity duration-500">
                        <div className="flex shrink-0 animate-scroll items-center justify-around min-w-full gap-16 px-8">
                            <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">SINAPI</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">ORSE</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">TCPO</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">SICRO</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">CUB</div>
                        </div>
                        <div className="flex shrink-0 animate-scroll items-center justify-around min-w-full gap-16 px-8" aria-hidden="true">
                            <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">SINAPI</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">ORSE</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">TCPO</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">SICRO</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">CUB</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
