
import { notFound } from 'next/navigation';
import { collection, query, where, getDocs, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShareButton } from '@/components/blog/share-button';
import type { Metadata } from 'next';

type BlogPost = {
  id: string;
  title: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  featureImageUrl?: string;
  author: string;
  createdAt: Timestamp;
  slug: string;
};

async function getPost(slug: string): Promise<BlogPost | null> {
  const q = query(collection(db, 'blogs'), where('slug', '==', slug), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const postDoc = querySnapshot.docs[0];
  return { id: postDoc.id, ...postDoc.data() } as BlogPost;
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
        </div>
    </div>
  );
}
