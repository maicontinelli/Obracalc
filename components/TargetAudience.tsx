import { User, Hammer, Handshake } from "lucide-react";

export function TargetAudience() {
    const audiences = [
        {
            icon: <User className="w-8 h-8 text-[#FF6600]" />,
            title: "Iniciantes e proprietários",
            description: "Descubra quanto sua obra vai custar, mesmo sem experiência."
        },
        {
            icon: <Hammer className="w-8 h-8 text-[#FF6600]" />,
            title: "Profissionais da construção",
            description: "Crie orçamentos e relatórios técnicos com agilidade."
        },
        {
            icon: <Handshake className="w-8 h-8 text-[#FF6600]" />,
            title: "Indicadores e parceiros",
            description: "Indique orçamentos, conecte clientes e participe do sistema de comissões do ObraPlana."
        }
    ];

    return (
        <section className="py-20 bg-gray-100 dark:bg-[#1A1A1A] border-y border-border/40">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Um orçamento confiável para decisões reais de obra
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {audiences.map((item, index) => (
                        <div
                            key={index}
                            className="bg-card hover:bg-accent/5 transition-colors p-6 rounded-2xl border border-border shadow-sm hover:shadow-md flex flex-col items-center text-center group"
                        >
                            <div className="mb-4 p-3 bg-[#FF6600]/10 rounded-full group-hover:scale-110 transition-transform duration-300">
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
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 hover:opacity-100 transition-opacity duration-500">
                        <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">SINAPI</div>
                        <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">SICRO</div>
                        <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">ORSE</div>
                        <div className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-600">TCPO</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
