'use client';

import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Linkedin } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();
    const isReportPage = pathname?.startsWith('/report/');

    return (
        <footer className={`border-t pt-12 pb-8 relative z-10 ${isReportPage
            ? 'bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-white/10'
            : 'bg-white border-gray-200 dark:bg-[#1a1a1a] dark:border-white/10'
            }`}>
            <div className="container mx-auto px-6 max-w-5xl">

                {/* Top section */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 mb-10">

                    {/* Brand */}
                    <div className="flex flex-col gap-4">
                        <Link href="/">
                            <Image
                                src="/logo-test.webp"
                                alt="ObraPlana Logo"
                                width={120}
                                height={40}
                                className="h-9 w-auto"
                            />
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[220px] leading-relaxed">
                            Pare de chutar orçamentos e perder clientes.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://github.com/maicontinelli/Obracalc" target="_blank" rel="noopener noreferrer"
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                                aria-label="Github">
                                <Github className="w-4 h-4" />
                            </a>
                            <a href="https://twitter.com/obraplana" target="_blank" rel="noopener noreferrer"
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                                aria-label="Twitter">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="https://linkedin.com/company/obraplana" target="_blank" rel="noopener noreferrer"
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                                aria-label="LinkedIn">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">Institucional</h4>
                            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                <li><Link href="/sobre" className="hover:text-[#FF6600] transition-colors">Sobre Nós</Link></li>
                                <li><Link href="/contato" className="hover:text-[#FF6600] transition-colors">Contato</Link></li>
                                <li><Link href="/apoie" className="hover:text-[#FF6600] transition-colors">Apoie o Projeto</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">Legal</h4>
                            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                <li><Link href="/privacidade" className="hover:text-[#FF6600] transition-colors">Privacidade</Link></li>
                                <li><Link href="/termos" className="hover:text-[#FF6600] transition-colors">Termos de Uso</Link></li>
                                <li><Link href="/seguranca" className="hover:text-[#FF6600] transition-colors">Segurança</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-100 dark:border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        © 2026 ObraPlana. Todos os direitos reservados.
                    </p>
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">v3.8</span>
                </div>
            </div>
        </footer>
    );
}
