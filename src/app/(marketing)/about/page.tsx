
'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

type SiteSettings = {
  aboutMeLong: string;
};

export default function AboutPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const aboutImage = PlaceHolderImages.find((img) => img.id === 'hero-image');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'site');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SiteSettings);
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">About Me</h1>
          <div className="prose prose-lg dark:prose-invert text-foreground">
            {settings?.aboutMeLong ? (
              <div dangerouslySetInnerHTML={{ __html: settings.aboutMeLong.replace(/\n/g, '<br />') }} />
            ) : (
              <>
                <p className="text-lg text-muted-foreground mb-6">
                  I'm Harsh Sharma, a passionate Software Development Engineer in Test (SDET) with a mission to improve software quality and help others grow in their careers.
                </p>
                <p>
                  With years of experience in both manual and automation testing, I've had the privilege of working on a wide range of projects, tackling complex challenges, and mentoring fellow QA professionals.
                </p>
                <p>
                  This blog is my way of giving back to the community that has taught me so much. Here, I share my insights on testing methodologies, development practices, career growth strategies, and the latest trends in the tech industry.
                </p>
                <p>
                  My goal is to create a valuable resource for aspiring testers and seasoned professionals alike. Whether you're just starting your journey or looking to take your skills to the next level, I hope you'll find something useful here.
                </p>
                <p>
                  Let's build better software, together.
                </p>
              </>
            )}
          </div>
        </div>
        <div className="order-1 md:order-2 flex justify-center">
          {aboutImage && (
            <Image
              src={aboutImage.imageUrl}
              alt="Harsh Sharma"
              width={350}
              height={350}
              className="rounded-lg object-cover aspect-square shadow-2xl"
              data-ai-hint={aboutImage.imageHint}
            />
          )}
        </div>
      </div>
    </div>
  );
}
