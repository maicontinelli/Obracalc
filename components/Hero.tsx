import AiAssistant from './AiAssistant';
import MathParticles from './MathParticles';
import Image from 'next/image';

export function Hero() {
    return (
        <section className="relative pt-28 pb-96 bg-transparent">
            {/* Background elements removed */}

            <div className="container mx-auto px-4 relative z-30 max-w-5xl">
                <div className="flex flex-col items-center justify-center mb-[38px] text-center">
                    <h1 className="max-w-lg mx-auto text-[33px] md:text-[33px] font-heading font-medium tracking-tight leading-tight text-[#3D3A36] dark:text-[#E8E6E3]">
                        Planejar muda tudo
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
