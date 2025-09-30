'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Loader2, Linkedin, Twitter, Github } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type BlogPost } from '@/app/admin/blogs/page';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

async function getRecentPosts(): Promise<BlogPost[]> {
    const postsCol = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(6));
    const postsSnapshot = await getDocs(postsCol);
    const postList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
    return postList;
}

export default function HomePage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const fallbackImage = PlaceHolderImages.find(img => img.id === 'course-detail-banner');
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');

  useEffect(() => {
    getRecentPosts().then(fetchedPosts => {
      setPosts(fetchedPosts);
      setLoading(false);
    }).catch(error => {
      console.error("Error fetching posts: ", error);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">
                Harsh Sharma
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-6">
                Software Development Engineer In Test (SDET)
              </p>
              <p className="text-muted-foreground mb-8">
                I write about testing, development, and career growth. Join me on a journey to build better software.
              </p>
              <div className="flex items-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/blog">
                    Read The Blog <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <div className="flex items-center gap-2">
                   <Button variant="outline" size="icon" asChild>
                     <Link href="#"><Linkedin /></Link>
                   </Button>
                   <Button variant="outline" size="icon" asChild>
                     <Link href="#"><Twitter /></Link>
                   </Button>
                   <Button variant="outline" size="icon" asChild>
                     <Link href="#"><Github /></Link>
                   </Button>
                </div>
              </div>
            </div>
             <div className="order-1 md:order-2 flex justify-center">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt="Harsh Sharma"
                  width={350}
                  height={350}
                  className="rounded-full object-cover aspect-square shadow-2xl"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section id="latest-posts" className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Latest Posts</h2>
              <p className="text-lg text-muted-foreground mt-2">Check out my newest articles and tutorials.</p>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-16">
                    <h2 className="text-2xl font-headline mb-2">No Posts Yet</h2>
                    <p className="text-muted-foreground">The admin hasn't published any posts. Check back soon!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => {
                    const imageUrl = post.featureImageUrl || fallbackImage?.imageUrl || "https://picsum.photos/seed/blog/400/250";
                    return (
                        <Card key={post.id} className="flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300 group bg-background">
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
