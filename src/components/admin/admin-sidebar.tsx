'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  LayoutDashboard,
  FileText,
  TrendingUp,
  BookOpen,
  Users,
  Settings,
  PanelLeft,
  Newspaper,
  LogOut,
} from 'lucide-react';
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

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/blogs', label: 'Blogs', icon: Newspaper },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/seo', label: 'SEO', icon: TrendingUp },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, state } = useSidebar();
  const auth = getAuth(app);
  const [user] = useAuthState(auth);

  const handleLogout = () => {
    signOut(auth);
  };
  
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between">
        <Link href="/admin" className={cn("flex items-center gap-2", state === 'collapsed' && 'hidden')}>
          <Bot className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg">QAWala</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className={cn(state === 'collapsed' && 'mx-auto')}>
          <PanelLeft />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t flex flex-col gap-2">
         <div className="flex items-center gap-3 p-2">
            <Avatar>
                <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/admin/100/100"} data-ai-hint="person portrait" />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className={cn("flex-grow", state === 'collapsed' && 'hidden')}>
                <p className="font-semibold truncate">{user?.displayName || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
         </div>
          <Button onClick={handleLogout} variant="ghost" className={cn("w-full justify-start", state === 'collapsed' && 'justify-center')}>
            <LogOut className="h-4 w-4 mr-2" />
            <span className={cn(state === 'collapsed' && 'hidden')}>Logout</span>
          </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
