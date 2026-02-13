'use client';

import { useState, useEffect } from 'react';
import AiAssistant from './AiAssistant';
import MathParticles from './MathParticles';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// Personalized welcome messages for logged-in users
const WELCOME_MESSAGES = [
    "Que bom ter você aqui, {name}!",
    "Olá, {name}! Pronto para planejar?",
    "Bem-vindo de volta, {name}!",
    "{name}, vamos criar algo incrível?",
    "E aí, {name}! Bora orçar?",
    "Opa, {name}! Que projeto vamos fazer hoje?",
    "{name}, seu próximo orçamento começa aqui!",
    "Prazer em te ver, {name}!"
];

export function Hero() {
    const [user, setUser] = useState<User | null>(null);
    const [greeting, setGreeting] = useState<string>("Planejar muda tudo");

    useEffect(() => {
        const supabase = createClient();

        // Get current user
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUser(user);

                // Get user's profile to fetch the name
                supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single()
                    .then(({ data }) => {
                        if (data?.full_name) {
                            // Extract first name
                            const firstName = data.full_name.split(' ')[0];

                            // Select a random greeting message
                            const randomIndex = Math.floor(Math.random() * WELCOME_MESSAGES.length);
                            const message = WELCOME_MESSAGES[randomIndex].replace('{name}', firstName);

                            setGreeting(message);
                        }
                    });
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);

            if (!session?.user) {
                setGreeting("Planejar muda tudo");
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <section className="relative pt-8 pb-56 bg-transparent">
            {/* Background elements removed */}

            <div className="container mx-auto px-4 relative z-30 max-w-5xl">
                <div className="flex flex-col items-center justify-center mb-16 text-center">
                    <h1 className="max-w-4xl mx-auto text-3xl md:text-5xl font-heading font-bold tracking-tight leading-tight text-[#3D3A36] dark:text-[#E8E6E3] mb-4">
                        {greeting}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Orçamentos inteligentes de obra para construtores, arquitetos e engenheiros.
                    </p>
                </div>

                {/* AI Assistant Container (Search Bar) */}
                <div className="max-w-3xl mx-auto relative z-20 mb-8 mt-0">
                    <AiAssistant />

                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => {
                                const id = crypto.randomUUID();
                                window.location.href = `/editor/${id}`;
                            }}
                            className="group flex items-center gap-2 px-6 py-3 bg-[#F6A34A] hover:bg-[#E5933C] rounded-full text-sm font-medium text-white transition-all shadow-lg shadow-[#F6A34A]/20 hover:scale-105"
                        >
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            Criar novo orçamento
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-white"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>

                {/* Hero Preview Image */}
                <div className="mt-16 flex justify-center">
                    <div className="w-[80%]">
                        <Image
                            src="/hero-preview.webp"
                            alt="ObraPlana Preview"
                            width={1200}
                            height={675}
                            className="w-full h-auto"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
