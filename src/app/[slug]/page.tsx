
import { notFound } from 'next/navigation';
import { collection, query, where, getDocs, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import type { Metadata } from 'next';

type Page = {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  slug: string;
  status: 'draft' | 'published';
  password?: string;
};

async function getPage(slug: string): Promise<Page | null> {
  const q = query(collection(db, 'pages'), where('slug', '==', slug), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const pageDoc = querySnapshot.docs[0];
  const pageData = { id: pageDoc.id, ...pageDoc.data() } as Page;
  
  // Do not show draft pages to the public
  if (pageData.status === 'draft') {
      return null;
  }

  // TODO: Add password protection logic here if pageData.password exists

  return pageData;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getPage(params.slug);
  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }
  return {
    title: page.title,
  };
}

export default async function CustomPage({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);

  if (!page) {
    notFound();
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
