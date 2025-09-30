import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type BlogPost } from '@/app/admin/blogs/page';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

async function getRecentPosts(): Promise<BlogPost[]> {
    const postsCol = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(6));
    const postsSnapshot = await getDocs(postsCol);
    const postList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
    return postList;
}

export default async function HomePage() {
  const posts = await getRecentPosts();
  const fallbackImage = PlaceHolderImages.find(img => img.id === 'course-detail-banner');

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-card">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">
              Welcome to QAWala
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Insights, tutorials, and news from the QAWala team. Your #1 destination for QA content.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/courses">
                  Explore Courses
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section id="latest-posts" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Latest Posts</h2>
              <p className="text-lg text-muted-foreground mt-2">Check out our newest articles and tutorials.</p>
            </div>
            
            {posts.length === 0 ? (
                <div className="text-center py-16">
                    <h2 className="text-2xl font-headline mb-2">No Posts Yet</h2>
                    <p className="text-muted-foreground">The admin hasn't published any posts. Check back soon!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => {
                    const imageUrl = post.featureImageUrl || fallbackImage?.imageUrl || "https://picsum.photos/seed/blog/400/250";
                    return (
                        <Card key={post.id} className="flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300 group">
                            <Link href={`/blog/${post.slug}`} className="block overflow-hidden rounded-t-lg">
                            <Image
                                src={imageUrl}
                                alt={post.title}
                                width={400}
                                height={250}
                                className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                                data-ai-hint="blog post image"
                            />
                            </Link>
                            <CardHeader>
                            <CardTitle className="font-headline text-xl h-16">
                                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                            </CardTitle>
                            <CardDescription>
                                {post.createdAt ? format(new Date(post.createdAt.seconds * 1000), 'MMMM d, yyyy') : ''}
                            </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col">
                            <p className="text-muted-foreground mb-6 flex-grow text-sm">{post.seoDescription}</p>
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
            )}

            <div className="text-center mt-12">
                <Button size="lg" asChild>
                    <Link href="/blog">View All Posts</Link>
                </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
