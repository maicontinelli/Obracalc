'use client';

import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Linkedin } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();
    const isReportPage = pathname?.startsWith('/report/');

    return (
        <footer className={`border-t pt-16 pb-8 ${isReportPage
            ? 'bg-white dark:bg-background border-gray-100 dark:border-white/5'
            : 'bg-white border-gray-100 dark:bg-background dark:border-white/5'
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
                                className="h-10 w-auto"
                            />
                        </Link>
                        <p className="text-sm mb-6 max-w-xs text-gray-500 dark:text-muted-foreground">
                            Orçamentos de obra claros e relatórios prontos para fechar negócios.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Github">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Twitter">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="LinkedIn">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>



                    <div>
                        <h4 className="font-semibold mb-4 text-gray-900 dark:text-foreground">Institucional</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-muted-foreground">
                            <li><Link href="/sobre" className="hover:text-primary">Sobre Nós</Link></li>
                            <li><Link href="/contato" className="hover:text-primary">Contato</Link></li>
                            <li><Link href="/apoie" className="hover:text-primary">Apoie o Projeto</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-gray-900 dark:text-foreground">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary">Privacidade</Link></li>
                            <li><Link href="#" className="hover:text-primary">Termos</Link></li>
                            <li><Link href="#" className="hover:text-primary">Segurança</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-gray-100 dark:border-white/5">
                    <p className="text-xs text-gray-500 dark:text-[#6b6967]">
                        © 2024 ObraPlana. Todos os direitos reservados. <span className="ml-2 opacity-50">v3.4.0</span>
                    </p>
                    <div className="flex gap-6 text-xs text-gray-500 dark:text-[#6b6967]">
                        {/* Feito com ❤️ para engenheiros - Removed as per request */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
