
'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Loader2 } from 'lucide-react';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const [siteName, setSiteName] = useState('QAWala');
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'site');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const settings = docSnap.data();
          if (settings.siteName) {
            setSiteName(settings.siteName);
            document.title = settings.siteName;
          }
          if (settings.heroDescription) {
             const metaDescription = document.querySelector('meta[name="description"]');
             if (metaDescription) {
                metaDescription.setAttribute('content', settings.heroDescription);
             }
          }
        }
      } catch (error) {
        console.error("Error fetching site settings for layout:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);
  
  if (loading && isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header siteName={siteName} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
