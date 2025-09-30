'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { app, db } from '@/lib/firebase';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/admin-sidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const auth = getAuth(app);
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) {
      // Still waiting for auth state to load
      return;
    }
    if (!user) {
      // If no user, redirect to login and stop checking
      router.replace('/login');
      setIsChecking(false);
      return;
    }

    // User is authenticated, now check their role in Firestore
    const checkAdminStatus = async () => {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        setIsAdmin(true);
      } else {
        // User is not an admin, redirect them to the homepage
        toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'You do not have permission to access the admin area.',
        });
        router.replace('/'); 
      }
      setIsChecking(false);
    };

    checkAdminStatus();
  }, [user, loading, router]);

  // This loading state covers auth check, Firestore check, and admin status
  if (loading || isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If, after all checks, the user is not an admin, render nothing (or a redirect).
  // The useEffect hook already handles the redirection.
  if (!isAdmin) {
     return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Redirecting...</p>
      </div>
    );
  }
  
  // Only render the admin layout if the user is a confirmed admin
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
