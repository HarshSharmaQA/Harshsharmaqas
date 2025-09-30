
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
      // Still loading authentication state, do nothing yet.
      return;
    }
    if (!user) {
      // If no user is found, redirect to login.
      router.replace('/login');
      return;
    }

    // Check if the authenticated user is the admin.
    if (user.email === ADMIN_EMAIL) {
      setIsAdmin(true);
    } else {
      // If the user is not an admin, redirect them to the homepage.
      router.replace('/');
    }
    // Finished checking.
    setIsChecking(false);
  }, [user, loading, router]);

  // While checking authentication and admin status, show a loading spinner.
  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is not an admin, show a loading spinner while redirecting.
  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Redirecting...</p>
      </div>
    );
  }

  // If the user is an admin, render the admin layout.
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
