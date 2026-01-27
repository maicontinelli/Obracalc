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
        <DemoSection />
        <TargetAudience />
        <Features />

        {/* CTA Section */}
        <section className="py-24 bg-card border-t border-border text-foreground text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] invert dark:invert-0"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 tracking-tight text-foreground">Pronto para otimizar seus orçamentos?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Junte-se a mais de 5.000 engenheiros e arquitetos que economizam 80% do tempo de orçamento.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-[#FF6600] text-white hover:bg-[#FF6600]/90 h-14 px-8 text-lg font-semibold shadow-lg transition-transform hover:scale-105 w-full sm:w-auto min-w-[200px]"
                data-testid="button-cta"
                onClick={() => handleStart('obra_nova')}
              >
                Começar Agora
              </Button>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-input hover:bg-accent hover:text-accent-foreground h-14 px-8 text-lg font-semibold bg-transparent w-full sm:w-auto min-w-[200px]"
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
