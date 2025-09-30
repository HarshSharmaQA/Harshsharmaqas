
import type { ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

async function getSiteName() {
  try {
    const docRef = doc(db, 'settings', 'site');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().siteName || 'QAWala';
    }
  } catch (error) {
    console.error("Error fetching site name:", error);
  }
  return 'QAWala';
}


export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const siteName = await getSiteName();

  return (
    <div className="flex min-h-screen flex-col">
      <Header siteName={siteName} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
