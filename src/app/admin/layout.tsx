
'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app } from '@/lib/firebase';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/admin-sidebar';
import { Loader2 } from 'lucide-react';

const ADMIN_EMAIL = 'harshsharmaqa@gmail.com';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const auth = getAuth(app);
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.email === ADMIN_EMAIL) {
      setIsAdmin(true);
    } else {
      // Non-admin users are redirected away. A toast is not critical here.
      router.replace('/');
    }
    setIsChecking(false);
  }, [user, loading, router]);

  if (loading || isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    // This state is temporary while router.replace('/') is processed.
    // A loading indicator is appropriate.
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Redirecting...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
