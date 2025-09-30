import { notFound } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

type BlogPost = {
  title: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
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

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container py-12 md:py-16">
      <article className="prose prose-lg dark:prose-invert mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-headline !mb-2">{post.title}</h1>
            <p className="text-muted-foreground">
                Posted on {format(new Date(post.createdAt.seconds * 1000), 'MMMM d, yyyy')}
            </p>
        </div>
        
        {/* We can use dangerouslySetInnerHTML here if content contains HTML, or just render it directly if it's markdown/plain text */}
        {/* For now, let's treat it as plain text and wrap it in a div that preserves whitespace */}
        <div className="whitespace-pre-wrap text-foreground">
          {post.content}
        </div>
      </article>
    </div>
  );
}

// Add metadata generation for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.seoTitle,
    description: post.seoDescription,
  }
}
