import Link from 'next/link';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  seoDescription: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

async function getBlogPosts(): Promise<BlogPost[]> {
  const blogsCollection = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
  const blogsSnapshot = await getDocs(blogsCollection);
  const blogList = blogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
  return blogList;
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="bg-background">
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">Our Blog</h1>
          <p className="text-lg text-muted-foreground mt-2">Insights, tutorials, and news from the QA Ranker team.</p>
        </div>

        {posts.length === 0 ? (
           <div className="text-center py-16">
              <h2 className="text-2xl font-headline mb-2">No Posts Yet</h2>
              <p className="text-muted-foreground">Check back soon for our latest articles!</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl h-20">{post.title}</CardTitle>
                  <CardDescription>
                    {format(new Date(post.createdAt.seconds * 1000), 'MMMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <p className="text-muted-foreground mb-6 flex-grow">{post.seoDescription}</p>
                  <Button asChild variant="outline">
                    <Link href={`/blog/${post.slug}`}>
                      Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
