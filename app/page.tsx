import { Hero } from '@/components/Hero';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow">
        <Hero />
      </main>
    </div>
  );
}
