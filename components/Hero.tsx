'use client';

import { useState, useEffect } from 'react';
import AiAssistant from './AiAssistant';
import MathParticles from './MathParticles';
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
        <section className="relative pt-28 pb-96 bg-transparent">
            {/* Background elements removed */}

            <div className="container mx-auto px-4 relative z-30 max-w-5xl">
                <div className="flex flex-col items-center justify-center mb-[38px] text-center">
                    <h1 className="max-w-lg mx-auto text-[33px] md:text-[33px] font-heading font-medium tracking-tight leading-tight text-[#3D3A36] dark:text-[#E8E6E3]">
                        {greeting}
                    </h1>
                </div>

                {/* AI Assistant Container (Search Bar) */}
                <div className="max-w-3xl mx-auto relative z-20 mb-8 mt-0">
                    <AiAssistant />
                </div>


            </div>
        </section>
    );
}
