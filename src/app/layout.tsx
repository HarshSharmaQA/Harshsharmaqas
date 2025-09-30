
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function getSiteSettings() {
  try {
    const docRef = doc(db, 'settings', 'site');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        siteName: data.siteName || 'QAWala',
        description: data.heroDescription || 'The #1 destination for QA professionals and aspirants. Enhance your skills with our courses and tools.',
        keywords: data.metaKeywords || '',
      };
    }
  } catch (error) {
    console.error("Error fetching site settings for metadata:", error);
  }
  return {
    siteName: 'QAWala',
    description: 'The #1 destination for QA professionals and aspirants. Enhance your skills with our courses and tools.',
    keywords: 'QA, testing, software development, sdet, quality assurance',
  };
}


export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      default: `${settings.siteName} - Expert QA & Testing Resources`,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.description,
    keywords: settings.keywords,
  };
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
