
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

const Bot = dynamic(() => import('lucide-react').then(mod => mod.Bot));
const LayoutDashboard = dynamic(() => import('lucide-react').then(mod => mod.LayoutDashboard));
const FileText = dynamic(() => import('lucide-react').then(mod => mod.FileText));
const TrendingUp = dynamic(() => import('lucide-react').then(mod => mod.TrendingUp));
const BookOpen = dynamic(() => import('lucide-react').then(mod => mod.BookOpen));
const Users = dynamic(() => import('lucide-react').then(mod => mod.Users));
const Settings = dynamic(() => import('lucide-react').then(mod => mod.Settings));
const PanelLeft = dynamic(() => import('lucide-react').then(mod => mod.PanelLeft));
const Newspaper = dynamic(() => import('lucide-react').then(mod => mod.Newspaper));
const LogOut = dynamic(() => import('lucide-react').then(mod => mod.LogOut));
const Star = dynamic(() => import('lucide-react').then(mod => mod.Star));
const FilePlus = dynamic(() => import('lucide-react').then(mod => mod.FilePlus));
const Zap = dynamic(() => import('lucide-react').then(mod => mod.Zap));

const IconLoadingSkeleton = () => <Skeleton className="h-4 w-4" />;

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pages', label: 'Pages', icon: FilePlus },
  { href: '/admin/blogs', label: 'Blogs', icon: Newspaper },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/seo', label: 'SEO', icon: TrendingUp },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, state } = useSidebar();
  const auth = getAuth(app);
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (sessionStorage.getItem('cache-cleared')) {
      toast({
        title: 'Cache Cleared',
        description: 'The browser cache has been successfully cleared.',
      });
      sessionStorage.removeItem('cache-cleared');
    }
  }, [toast]);

  const handleLogout = () => {
    signOut(auth);
  };
  
  const handleClearCache = () => {
    if (isClient) {
      sessionStorage.setItem('cache-cleared', 'true');
      window.location.reload();
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between">
        <Link href="/admin" className={cn("flex items-center gap-2 p-2", state === 'collapsed' && 'hidden')}>
          <React.Suspense fallback={<IconLoadingSkeleton />}>
            <Bot className="h-6 w-6 text-primary" />
          </React.Suspense>
          <span className="font-bold font-headline text-lg">QAWala</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className={cn(state === 'collapsed' && 'mx-auto')}>
          <React.Suspense fallback={<IconLoadingSkeleton />}>
            <PanelLeft />
          </React.Suspense>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href) && (item.href === '/admin' ? pathname === item.href : true)}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <React.Suspense fallback={<IconLoadingSkeleton />}>
                    <item.icon />
                  </React.Suspense>
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
         <div className="flex items-center gap-3 p-2">
            <Avatar className={cn(state === 'collapsed' && 'mx-auto')}>
                <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/admin/100/100"} data-ai-hint="person portrait" />
                <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className={cn("flex-grow overflow-hidden", state === 'collapsed' && 'hidden')}>
                <p className="font-semibold truncate">{user?.displayName || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
         </div>
          <div className="grid grid-cols-1 gap-2">
            <Button onClick={handleLogout} variant="outline" className={cn("w-full justify-start", state === 'collapsed' && 'justify-center')}>
                <React.Suspense fallback={<IconLoadingSkeleton />}>
                  <LogOut className={cn("h-4 w-4", state === 'expanded' && 'mr-2')} />
                </React.Suspense>
                <span className={cn(state === 'collapsed' && 'hidden')}>Logout</span>
            </Button>
            <Button onClick={handleClearCache} variant="outline" className={cn("w-full justify-start", state === 'collapsed' && 'justify-center')}>
                <React.Suspense fallback={<IconLoadingSkeleton />}>
                  <Zap className={cn("h-4 w-4", state === 'expanded' && 'mr-2')} />
                </React.Suspense>
                <span className={cn(state === 'collapsed' && 'hidden')}>Clear Cache</span>
            </Button>
          </div>
      </SidebarFooter>
    </Sidebar>
  );
}
