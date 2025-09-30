
import { notFound } from 'next/navigation';
import { collection, query, where, getDocs, limit, Timestamp, collectionGroup } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShareButton } from '@/components/blog/share-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { type BlogPost } from '@/app/admin/blogs/page';
import loading from './loading';

async function getPost(slug: string): Promise<BlogPost | null> {
  const q = query(collection(db, 'blogs'), where('slug', '==', slug), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const postDoc = querySnapshot.docs[0];
  return { id: postDoc.id, ...postDoc.data() } as BlogPost;
}

async function getRelatedPosts(category: string, currentPostId: string): Promise<BlogPost[]> {
    if (!category) return []; // Don't query if category is undefined
    const q = query(
        collection(db, 'blogs'), 
        where('category', '==', category),
        limit(4) // Fetch one extra to exclude the current post
    );
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as BlogPost))
        .filter(post => post.id !== currentPostId);

    return posts.slice(0, 3); // Return at most 3 related posts
}

export async function generateStaticParams() {
  const postsSnapshot = await getDocs(collection(db, 'blogs'));
  return postsSnapshot.docs.map(doc => ({
    slug: doc.data().slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const awaitedParams = await params;
  const post = await getPost(awaitedParams.slug);
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  return {
    title: post.seoTitle,
    description: post.seoDescription,
    openGraph: {
      title: post.seoTitle,
      description: post.seoDescription,
      images: [
        {
          url: post.featureImageUrl || PlaceHolderImages.find(img => img.id === 'course-detail-banner')?.imageUrl || '',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}


export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = post.category ? await getRelatedPosts(post.category, post.id) : [];
  const fallbackImage = PlaceHolderImages.find(img => img.id === 'course-detail-banner');
  const imageUrl = post.featureImageUrl || fallbackImage?.imageUrl || "https://picsum.photos/seed/blog-detail/1200/600";

  return (
    <div>
        <section className="relative h-64 md:h-96 w-full">
            <Image
                src={imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                data-ai-hint="blog post image"
                priority
            />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center text-white p-4 max-w-4xl">
                <h1 className="text-4xl md:text-6xl font-bold font-headline">{post.title}</h1>
                <p className="text-lg mt-4">
                    By {post.author} on {post.createdAt ? format(post.createdAt.toDate(), 'MMMM d, yyyy') : '...'}
                </p>
            </div>
            </div>
        </section>

        <div className="container py-12 md:py-16">
             <div className="max-w-prose mx-auto mb-8 flex items-center justify-end gap-2">
                <ShareButton post={{title: post.title, seoDescription: post.seoDescription}} />
            </div>
            <article className="prose prose-lg dark:prose-invert mx-auto">
                <div className="whitespace-pre-wrap text-foreground">
                {post.content}
                </div>
            </article>

            {relatedPosts.length > 0 && (
                <section className="mt-16 md:mt-24 border-t pt-12">
                    <h2 className="text-3xl font-bold font-headline text-center mb-12">Related Posts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {relatedPosts.map((relatedPost) => {
                            const relatedImageUrl = relatedPost.featureImageUrl || fallbackImage?.imageUrl || "https://picsum.photos/seed/blog/400/250";
                            return (
                                <Card key={relatedPost.id} className="flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300 group bg-card">
                                    <Link href={`/blog/${relatedPost.slug}`} className="block overflow-hidden rounded-t-lg">
                                    <Image
                                        src={relatedImageUrl}
                                        alt={relatedPost.title}
                                        width={400}
                                        height={250}
                                        className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                                        data-ai-hint="blog post image"
                                    />
                                    </Link>
                                    <CardHeader>
                                        <CardTitle className="font-headline text-xl">
                                            <Link href={`/blog/${relatedPost.slug}`}>{relatedPost.title}</Link>
                                        </CardTitle>
                                        <CardDescription>
                                            {relatedPost.createdAt ? format(new Date(relatedPost.createdAt.seconds * 1000), 'MMMM d, yyyy') : ''}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow flex flex-col">
                                        <p className="text-muted-foreground mb-4 flex-grow text-sm">{relatedPost.seoDescription}</p>
                                        <Button asChild variant="outline" className="mt-auto">
                                            <Link href={`/blog/${relatedPost.slug}`}>
                                            Read More <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    </div>
  );
}
