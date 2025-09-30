
'use client';

import { useParams, notFound } from 'next/navigation';
import { collection, query, where, getDocs, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type Page = {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
};

async function getPage(slug: string): Promise<Page | null> {
  const q = query(collection(db, 'pages'), where('slug', '==', slug), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const pageDoc = querySnapshot.docs[0];
  return { id: pageDoc.id, ...pageDoc.data() } as Page;
}

export default function CustomPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      getPage(slug).then(fetchedPage => {
        if (fetchedPage) {
          setPage(fetchedPage);
        } else {
          // This is how Next.js app router triggers a 404
          notFound();
        }
        setLoading(false);
      }).catch(error => {
        console.error("Error fetching page: ", error);
        setLoading(false);
        notFound();
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!page) {
    // This should be handled by the notFound() in useEffect, but as a fallback
    return notFound();
  }

  return (
    <div className="container py-12 md:py-20">
        <Card>
            <CardContent className="p-6 md:p-10">
                <h1 className="text-4xl md:text-5xl font-bold font-headline mb-8">{page.title}</h1>
                <div 
                    className="prose prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: page.content }} 
                />
            </CardContent>
        </Card>
    </div>
  );
}
