import { User, Hammer, Handshake, Key, HardHat, Gem } from "lucide-react";

export function TargetAudience() {
    const audiences = [
        {
            icon: <Key className="w-8 h-8 text-[#22c55e]" />, // Green for Owners/Beginners (Accessible)
            bg: "bg-[#22c55e]/10",
            title: "Iniciantes e proprietários",
            description: "Descubra quanto sua obra vai custar, mesmo sem experiência."
        },
        {
            icon: <HardHat className="w-8 h-8 text-[#FF6600]" />, // Orange for Pros (Construction)
            bg: "bg-[#FF6600]/10",
            title: "Profissionais da construção",
            description: "Crie orçamentos e relatórios técnicos com agilidade."
        },
        {
            icon: <Gem className="w-8 h-8 text-[#6366F1]" />, // Indigo for Partners (Value)
            bg: "bg-[#6366F1]/10",
            title: "Indicadores e parceiros",
            description: "Indique orçamentos, conecte clientes e participe do sistema de comissões do ObraPlana."
        }
    ];

    return (
        <section className="py-20 bg-transparent border-y border-border/40">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6 tracking-tight">
                        Um orçamento confiável para <br /> <span className="text-[#6366F1]">decisões reais</span> de obra
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {audiences.map((item, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-2xl flex flex-col items-center text-center group transition-all duration-300 bg-transparent border border-gray-200/50 dark:border-white/5 opacity-80 hover:opacity-100 hover:bg-card/50 shadow-none scale-100"
                        >
                            <div className={`mb-4 p-3 rounded-full group-hover:scale-110 transition-transform duration-300 ${item.bg}`}>
                                {item.icon}
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">
                                {item.title}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-20 pt-10 border-t border-border/40">
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-normal tracking-wide mb-6 uppercase">
                        Integração direta com as bases de referência nacional
                    </p>
                    <div className="relative flex overflow-hidden w-full mask-linear-fade opacity-70 hover:opacity-100 transition-opacity duration-500">
                        {/* First Scroll Track */}
                        <div className="flex shrink-0 animate-scroll items-center justify-around min-w-full gap-16 px-8">
                            <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">SINAPI</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">ORSE</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">TCPO</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">SICRO</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">CUB</div>
                        </div>
                        {/* Second Scroll Track (Duplicate for Infinite Loop) */}
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
