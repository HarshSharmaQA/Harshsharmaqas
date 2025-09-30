'use client';

import { useParams, notFound } from 'next/navigation';
import { collection, query, where, getDocs, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

type BlogPost = {
  title: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  featureImageUrl?: string;
  author: string;
  createdAt: Timestamp;
};

async function getPost(slug: string): Promise<BlogPost | null> {
  const q = query(collection(db, 'blogs'), where('slug', '==', slug), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const postDoc = querySnapshot.docs[0];
  return postDoc.data() as BlogPost;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      getPost(slug).then(fetchedPost => {
        if (fetchedPost) {
          setPost(fetchedPost);
          document.title = fetchedPost.seoTitle; // Set document title on client
        } else {
          notFound();
        }
        setLoading(false);
      }).catch(error => {
        console.error("Error fetching post: ", error);
        setLoading(false);
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

  if (!post) {
    return notFound();
  }

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
            <article className="prose prose-lg dark:prose-invert mx-auto">
                <div className="whitespace-pre-wrap text-foreground">
                {post.content}
                </div>
            </article>
        </div>
    </div>
  );
}
