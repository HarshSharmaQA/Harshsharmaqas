
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
  // Hardcoded content for the 'test' page as requested
  if (slug === 'test') {
    return {
      id: 'test-page',
      title: 'Test Page',
      content: `<p>Of course. I understand that you want to refine the behavior of the sidebar toggle button. Your goal is to ensure that clicking the PanelLeft icon correctly collapses and expands the admin sidebar, showing only icons when collapsed.</p><p>Based on your request, I will adjust the AdminSidebar component to ensure the toggle functionality works as intended, cleanly switching between the expanded and collapsed states.</p><p>Here are the changes I'll make:</p>`,
      createdAt: Timestamp.now(),
      slug: 'test',
      status: 'published',
    };
  }

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
        <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6 md:p-10">
                <h1 className="text-4xl md:text-5xl font-bold font-headline mb-8 text-center">{page.title}</h1>
                <div 
                    className="prose prose-lg dark:prose-invert max-w-none mx-auto"
                    dangerouslySetInnerHTML={{ __html: page.content }} 
                />
            </CardContent>
        </Card>
    </div>
  );
}
