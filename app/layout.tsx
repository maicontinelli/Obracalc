import type { Metadata } from "next";
import { Inter, Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import SimpleNav from "@/components/SimpleNav";
import { ConditionalFooter } from "@/components/ConditionalFooter";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space",
    display: "swap",
});

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope",
    display: "swap",
});

export const metadata: Metadata = {
    title: "ObraPlana - Orçamentos de Construção Civil",
    description: "Crie orçamentos de construção civil profissionais com IA. SINAPI integrado, BDI calculado, curva ABC e relatórios em PDF.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className={`${inter.variable} ${spaceGrotesk.variable} ${manrope.variable} antialiased font-sans bg-background text-foreground`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SimpleNav />
                    <main className="pt-20">{children}</main>
                    <ConditionalFooter />
                </ThemeProvider>
            </body>
        </html>
    );
}
