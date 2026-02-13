'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { DemoSection } from '@/components/DemoSection';
import { TargetAudience } from '@/components/TargetAudience';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';

export default function Home() {
  const router = useRouter();

  // Forced Dark Mode REMOVED to allow theme toggling
  /*
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);
  */

  const handleStart = (type: 'obra_nova') => {
    const newId = crypto.randomUUID();
    router.push(`/editor/${newId}?type=${type}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow">
        <Hero />
        <TargetAudience />
        <DemoSection />
        <Features />

        {/* CTA Section */}
        <section className="py-24 bg-transparent border-t border-border text-foreground text-center relative overflow-hidden">

          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 tracking-tight text-foreground">
              Pronto para <span className="text-[#FF6600]">otimizar</span> seus orçamentos?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Junte-se a mais de 5.000 engenheiros e arquitetos que economizam 80% do tempo com ObraPlana.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-[#FF6600] text-white hover:bg-[#E55C00] h-14 px-8 text-lg font-semibold shadow-lg shadow-[#FF6600]/20 transition-transform hover:scale-105 w-full sm:w-auto min-w-[200px] rounded-full"
                data-testid="button-cta"
                onClick={() => handleStart('obra_nova')}
              >
                Começar Agora
              </Button>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-neutral-300 dark:border-neutral-600 bg-white/50 dark:bg-black/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground h-14 px-8 text-lg font-semibold w-full sm:w-auto min-w-[200px] backdrop-blur-sm transition-all rounded-full"
                >
                  Fazer Cadastro
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
