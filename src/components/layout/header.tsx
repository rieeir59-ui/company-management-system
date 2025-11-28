'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Facebook, Instagram, Phone, MessageCircle } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
];

export const RiIdLogo = () => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-black"
    >
        <path d="M20 80 L 20 20 L 30 20 L 30 80 Z" fill="currentColor" />
        <path d="M40 20 L 40 35 C 40 45, 50 45, 55 40 L 60 35 L 60 20 L 40 20 Z M 40 80 L 40 50 C 40 55, 45 60, 50 60 L 55 60 C 60 60, 65 55, 65 50 L 65 45 L 40 45 L 40 80 Z" fill="currentColor" />
    </svg>
  );

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-card shadow-sm">
      <div className="bg-sidebar text-white text-sm py-2">
        <div className="container flex justify-between items-center h-10">
          <div className="flex-1 text-center animate-in fade-in slide-in-from-top-2 duration-1000">Welcome to RI-HUB (Software Engineers)</div>
          <div className="flex items-center space-x-3">
             <Link href="#" className="text-white hover:text-primary"><MessageCircle size={18} /></Link>
             <Link href="https://www.facebook.com/isbahhassanassociates101ydha/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary"><Facebook size={18} /></Link>
             <Link href="https://www.instagram.com/isbahhassanassociates/?hl=en" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary"><Instagram size={18} /></Link>
             <Link href="#" className="text-white hover:text-primary"><Phone size={18} /></Link>
          </div>
        </div>
      </div>
      <div className="w-full h-px bg-black/20" />
      <div className="container flex h-24 items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
           <div
              className="relative bg-primary flex items-center justify-center p-2"
              style={{
                clipPath: 'polygon(0% 0, 85% 0, 100% 100%, 0% 100%)',
                height: '96px',
                width: '300px'
              }}
            >
              <div className="flex items-center gap-2 text-black pr-8">
                <RiIdLogo />
                <span className="font-bold text-3xl">RI-HUB</span>
              </div>
            </div>
          </Link>
        </div>
        <nav className="flex items-center space-x-4 text-sm font-medium ml-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-primary px-3 py-1.5 rounded-md font-semibold uppercase',
                pathname === link.href
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
       <div className="w-full h-px bg-black/20" />
    </header>
  );
}
