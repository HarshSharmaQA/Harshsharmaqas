
import Link from 'next/link';
import { Bot, Twitter, Github, Linkedin } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type SiteSettings = {
  socialTwitter: string;
  socialLinkedin: string;
  socialGithub: string;
  siteName: string;
};

async function getSettings(): Promise<SiteSettings | null> {
  try {
    const docRef = doc(db, 'settings', 'site');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SiteSettings;
    }
  } catch (error) {
    console.error("Error fetching site settings for footer:", error);
  }
  return null;
}

export default async function Footer() {
  const settings = await getSettings();

  return (
    <footer className="bg-card border-t">
      <div className="container py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">{settings?.siteName || 'QAWala'}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {settings?.siteName || 'QAWala'}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href={settings?.socialTwitter || '#'} className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href={settings?.socialGithub || '#'} className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href={settings?.socialLinkedin || '#'} className="text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
