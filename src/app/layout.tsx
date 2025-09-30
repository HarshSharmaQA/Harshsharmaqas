
'use client'

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [siteName, setSiteName] = useState('QAWala');
  const [description, setDescription] = useState('The #1 destination for QA professionals and aspirants. Enhance your skills with our courses and tools.');

   useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'site');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const settings = docSnap.data();
          setSiteName(settings.siteName || 'QAWala');
          setDescription(settings.heroDescription || 'The #1 destination for QA professionals and aspirants.');
        }
      } catch (error) {
        console.error("Error fetching site settings for layout:", error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    document.title = siteName;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
        const newMeta = document.createElement('meta');
        newMeta.name = 'description';
        newMeta.content = description;
        document.head.appendChild(newMeta);
    }
  }, [siteName, description]);


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
