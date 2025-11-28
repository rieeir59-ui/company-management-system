import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Header from '@/components/layout/header';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-architecture');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="relative w-full h-[calc(100vh-4rem)] flex items-center justify-center text-center text-white">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 flex flex-col items-center space-y-6 px-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-shadow-lg">
              ISBAH HASSAN & ASSOCIATES
            </h1>
            <p className="text-2xl md:text-3xl lg:text-4xl text-primary text-shadow-md">
              Architecture Company
            </p>
            <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-10 py-6 transition-transform hover:scale-105">
              <Link href="/login">Start Now</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
