'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bot, Menu, LogOut, LayoutDashboard } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, onSnapshot } from 'firebase/firestore';

import { app, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

const navLinks = [
  { href: '/blog', label: 'Blog' },
  { href: '/courses', label: 'Courses' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const auth = getAuth(app);
  const [user, loading] = useAuthState(auth);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  
  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      // Use onSnapshot for real-time updates to the user's role
      const unsubscribe = onSnapshot(userDocRef, (userDoc) => {
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        } else {
          // This can happen briefly if the user document isn't created yet on signup.
          // Defaulting to 'user' is a safe fallback.
          setUserRole('user');
        }
      });
      // Clean up the listener when the component unmounts or the user changes
      return () => unsubscribe();
    } else {
      // If there is no user, reset the role
      setUserRole(null);
    }
  }, [user]);

  const handleLogout = () => {
    signOut(auth);
  };

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
                  <span className="font-bold font-headline text-lg">{siteName}</span>
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
            <span className="font-bold font-headline text-lg">{siteName}</span>
          </Link>
        </div>
        
        {/* Mobile Logo (center) */}
        <div className="flex-1 flex justify-center md:hidden">
            <Link href="/" className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline text-lg">{siteName}</span>
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
        
        {/* Auth & Social Links */}
        <div className="flex items-center justify-end ml-auto gap-2">
          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || `https://avatar.vercel.sh/${user.email}.png`} alt={user.displayName || 'User'} />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                     {userRole && (
                      <div className="flex items-center pt-2">
                        <p className="text-xs leading-none text-muted-foreground">Role:</p>
                        <Badge variant={userRole === 'admin' ? 'destructive' : 'secondary'} className="ml-2 text-xs capitalize">{userRole}</Badge>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userRole === 'admin' && (
                   <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}

           {/* Spacer for mobile to balance the centered logo */}
           <div className="w-10 md:hidden" />
        </div>
      </div>
    </header>
  );
}
