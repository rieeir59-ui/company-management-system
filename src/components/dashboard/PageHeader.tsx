
import Image from 'next/image';

interface DashboardPageHeaderProps {
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

export default function DashboardPageHeader({ title, description, imageUrl, imageHint }: DashboardPageHeaderProps) {
  return (
    <div className="relative rounded-lg overflow-hidden mb-8 h-48 flex items-center justify-center text-center text-white">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
          data-ai-hint={imageHint}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 p-4">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-shadow-lg">
                {title}
            </h1>
            <p className="text-lg md:text-xl text-primary/90 mt-2 text-shadow-md">
                {description}
            </p>
        </div>
    </div>
  );
}
