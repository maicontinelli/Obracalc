'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AiAssistant from './AiAssistant';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

const WELCOME_MESSAGES = [
    "Que bom ter você aqui, {name}!",
    "Olá, {name}! Pronto para planejar?",
    "Bem-vindo de volta, {name}!",
    "{name}, vamos criar algo incrível?",
    "E aí, {name}! Bora orçar?",
];

export function Hero() {
    const [user, setUser] = useState<User | null>(null);
    const [greeting, setGreeting] = useState<string>("Planejar muda tudo");
    const [chatActive, setChatActive] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUser(user);
                supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single()
                    .then(({ data }) => {
                        if (data?.full_name) {
                            const firstName = data.full_name.split(' ')[0];
                            const randomIndex = Math.floor(Math.random() * WELCOME_MESSAGES.length);
                            setGreeting(WELCOME_MESSAGES[randomIndex].replace('{name}', firstName));
                        }
                    });
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session?.user) setGreeting("Planejar muda tudo");
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <section className="relative flex flex-col items-center justify-center px-4 py-16 md:py-24 bg-transparent">

            {/* Grid background */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: 'linear-gradient(#FF6600 1px, transparent 1px), linear-gradient(to right, #FF6600 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-[600px] h-[600px] rounded-full bg-[#FF6600]/5 dark:bg-[#FF6600]/8 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center gap-5">

                {/* Badge + Title — somem quando chat ativo */}
                <div className={`flex flex-col items-center gap-4 overflow-hidden transition-all duration-300 ease-in-out ${chatActive ? 'opacity-0 max-h-0 pointer-events-none' : 'opacity-100 max-h-56'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF6600]/10 dark:bg-[#FF6600]/15 border border-[#FF6600]/20 text-[#FF6600] text-sm font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6600] animate-pulse" />
                        IA para obras e reformas
                    </div>

                    <h1 className="text-[36px] md:text-[58px] font-heading font-bold tracking-tight leading-[1.05] text-[#3D3A36] dark:text-[#E8E6E3]">
                        {greeting}
                    </h1>
                </div>

                {/* Chat / Search */}
                <div className="w-full">
                    <AiAssistant
                        onActivate={() => setChatActive(true)}
                        onReset={() => setChatActive(false)}
                    />
                </div>

                {/* Social proof — some quando chat ativo */}
                <div className={`flex items-center gap-6 text-sm text-[#3D3A36]/40 dark:text-[#E8E6E3]/40 overflow-hidden transition-all duration-300 ease-in-out ${chatActive ? 'opacity-0 max-h-0 pointer-events-none' : 'opacity-100 max-h-12'}`}>
                    <span>5.000+ engenheiros</span>
                    <span className="w-1 h-1 rounded-full bg-current" />
                    <span>80% menos tempo</span>
                    <span className="w-1 h-1 rounded-full bg-current" />
                    <span>Grátis para começar</span>
                </div>

            </div>
        </section>
    );
}
