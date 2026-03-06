import Image from "next/image";

export function DemoSection() {
    return (
        <section className="py-24 bg-transparent overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="lg:w-1/2">
                        <h2 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                            Você pede e o ObraPlana <span className="text-[#FF6600]">organiza</span> tudo
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            Comece com uma descrição simples e deixe nossa IA fazer o trabalho pesado.
                        </p>
                        <ul className="space-y-4 mb-8">
                            {[
                                'Sugestão de serviços conforme contexto do pedido',
                                'Liberdade para editar quantidade e preço',
                                'Estrutura cronológica do início ao acabamento',
                                'Relatórios prontos para compartilhar com cliente'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    {item}
                                </li>
                            ))}
                            {/* Novo item seguindo o padrão, mas com ícone Pin */}
                            <li className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mt-6 pt-4">
                                <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
                                    <span className="text-[10px]">📌</span>
                                </div>
                                Baseado em referências reais de obra e práticas de mercado.
                            </li>
                        </ul>
                    </div>

                    <div className="lg:w-1/2 relative flex justify-center">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
                        <div className="relative w-full max-w-2xl">
                            <Image
                                src="/editor.webp"
                                alt="Demonstração do App"
                                width={800}
                                height={600}
                                className="w-full h-auto rounded-xl drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>


            </div>
        </section>
    );
}
