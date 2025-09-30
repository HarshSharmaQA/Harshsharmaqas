'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Bot, Menu, X, Twitter, Github, Linkedin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/blog', label: 'Blog' },
  { href: '/courses', label: 'Courses' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="p-4">
                <Link href="/" className="flex items-center gap-2 mb-8" onClick={() => setIsMobileMenuOpen(false)}>
                  <Bot className="h-6 w-6 text-primary" />
                  <span className="font-bold font-headline text-lg">QAWala</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-primary",
                        pathname === link.href ? "text-primary" : "text-foreground/80"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Logo */}
        <div className="mr-auto hidden md:flex">
          <Link href="/" className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">QAWala</span>
          </Link>
        </div>
        
        {/* Mobile Logo (center) */}
        <div className="flex-1 flex justify-center md:hidden">
            <Link href="/" className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline text-lg">QAWala</span>
            </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-foreground" : "text-foreground/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        {/* Social Links & Spacer */}
        <div className="flex items-center justify-end ml-auto">
           <div className="hidden md:flex items-center gap-2">
             <Button variant="ghost" size="icon" asChild>
               <Link href="#"><Linkedin /></Link>
             </Button>
             <Button variant="ghost" size="icon" asChild>
               <Link href="#"><Twitter /></Link>
             </Button>
             <Button variant="ghost" size="icon" asChild>
               <Link href="#"><Github /></Link>
             </Button>
           </div>
           {/* Spacer for mobile to balance the centered logo */}
           <div className="w-10 md:hidden" />
        </div>

      </div>
    </header>
  );
}
