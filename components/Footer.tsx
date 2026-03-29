'use client';

import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Linkedin } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();
    const isReportPage = pathname?.startsWith('/report/');

    return (
        <footer className={`border-t pt-16 pb-8 relative z-10 ${isReportPage
            ? 'bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-white/10'
            : 'bg-white border-gray-200 dark:bg-[#1a1a1a] dark:border-white/10'
            }`}>
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="mb-4 block">
                            <Image
                                src="/logo-test.webp"
                                alt="ObraPlana Logo"
                                width={120}
                                height={40}
                                className="h-10 w-auto opacity-100"
                            />
                        </Link>
                        <p className="text-sm mb-6 max-w-xs text-gray-700 dark:text-gray-300 font-medium">
                            Pare de chutar orçamentos e perder clientes.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://github.com/maicontinelli/Obracalc" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors dark:text-gray-400 dark:hover:text-primary" aria-label="Github">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="https://twitter.com/obraplana" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors dark:text-gray-400 dark:hover:text-primary" aria-label="Twitter">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="https://linkedin.com/company/obraplana" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors dark:text-gray-400 dark:hover:text-primary" aria-label="LinkedIn">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>



                    <div>
                        <h4 className="font-bold mb-4 text-gray-900 dark:text-white">Institucional</h4>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                            <li><Link href="/sobre" className="hover:text-primary transition-colors">Sobre Nós</Link></li>
                            <li><Link href="/contato" className="hover:text-primary transition-colors">Contato</Link></li>
                            <li><Link href="/apoie" className="hover:text-primary transition-colors">Apoie o Projeto</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-gray-900 dark:text-white">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                            <li><Link href="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link></li>
                            <li><Link href="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
                            <li><Link href="/seguranca" className="hover:text-primary transition-colors">Segurança</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-gray-200 dark:border-white/10">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        © 2026 ObraPlana. Todos os direitos reservados. <span className="ml-2 opacity-100 font-bold text-gray-800 dark:text-gray-200">v3.8</span>
                    </p>
                    <div className="flex gap-6 text-xs text-gray-600 dark:text-gray-400">
                        {/* Feito com ❤️ para engenheiros - Removed as per request */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
