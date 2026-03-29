'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    "Prazer em te ver, {name}!"
];

export function Hero() {
    const router = useRouter();
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

    const handleCreateNew = () => {
        const newId = crypto.randomUUID();
        router.push(`/editor/${newId}?type=obra_nova`);
    };

    return (
        <section className="relative pt-8 pb-56 bg-transparent">
            {/* Background elements removed */}

            <div className="container mx-auto px-4 relative z-30 max-w-5xl">
                <div className="flex flex-col items-center justify-center mb-16 text-center">
                    <h1 className="max-w-5xl mx-auto text-[34px] md:text-[55px] font-heading font-bold tracking-tight leading-[1.1] text-[#3D3A36] dark:text-[#E8E6E3] mb-4">
                        {greeting}
                    </h1>
                    <p className="text-xl md:text-2xl text-[#3D3A36] dark:text-[#E8E6E3] opacity-80 max-w-2xl mx-auto font-medium">
                        Seu orçamento começa aqui
                    </p>
                </div>

                {/* AI Assistant Container (Search Bar) */}
                <div className="max-w-3xl mx-auto relative z-20 mb-8 mt-0">
                    <AiAssistant />


                </div>

                {/* Hero Preview Image */}
                <div className="mt-4 flex justify-center">
                    <div
                        onClick={handleCreateNew}
                        className="w-[80%] block transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                        role="button"
                        aria-label="Criar novo orçamento"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreateNew(); }}
                    >
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
