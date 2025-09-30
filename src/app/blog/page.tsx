
import Link from 'next/link';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  seoDescription: string;
  featureImageUrl?: string;
  createdAt: Timestamp;
};

async function getBlogPosts(): Promise<BlogPost[]> {
  const blogsCollection = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
  const blogsSnapshot = await getDocs(blogsCollection);
  const blogList = blogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
  return blogList;
}

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const fallbackImage = PlaceHolderImages.find(img => img.id === 'course-detail-banner');

  return (
    <div className="bg-background">
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">Our Blog</h1>
          <p className="text-lg text-muted-foreground mt-2">Insights, tutorials, and news from the QAWala team.</p>
        </div>

        {posts.length === 0 ? (
           <div className="text-center py-16">
              <h2 className="text-2xl font-headline mb-2">No Posts Yet</h2>
              <p className="text-muted-foreground">Check back soon for our latest articles!</p>
           </div>
        ) : (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => {
                  const imageUrl = post.featureImageUrl || fallbackImage?.imageUrl || "https://picsum.photos/seed/blog/400/250";
                  return (
                <Card key={post.id} className="flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300 group">
                  <div className="overflow-hidden rounded-t-lg">
                    <Link href={`/blog/${post.slug}`}>
                      <Image
                        src={imageUrl}
                        alt={post.title}
                        width={400}
                        height={250}
                        className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                        data-ai-hint="blog post image"
                      />
                    </Link>
                  </div>
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </CardTitle>
                    <CardDescription>
                      {post.createdAt ? format(post.createdAt.toDate(), 'MMMM d, yyyy') : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <p className="text-muted-foreground mb-4 flex-grow text-sm">{post.seoDescription}</p>
                    <Button asChild variant="outline" className="mt-auto">
                      <Link href={`/blog/${post.slug}`}>
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

    
