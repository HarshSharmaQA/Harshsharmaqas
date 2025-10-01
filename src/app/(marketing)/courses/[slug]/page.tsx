
import { notFound } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Course } from '@/lib/mock-data';
import { CourseDetails } from './course-details';
import type { Metadata } from 'next';

// The props for a dynamic page in this project's specific configuration expect
// the params to be a Promise. This type definition reflects that.
// We also add generateStaticParams to be consistent with the working blog page.

type CourseDetailPageProps = {
    params: { slug: string };
};

export async function generateStaticParams() {
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    return coursesSnapshot.docs.map(doc => ({
        slug: doc.data().slug,
    }));
}


async function getCourse(slug: string): Promise<Course | null> {
  const q = query(collection(db, 'courses'), where('slug', '==', slug), limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const courseDoc = querySnapshot.docs[0];
  return courseDoc.data() as Course;
}

// Replicating the blog's metadata function structure and the `await params` pattern
export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const course = await getCourse(awaitedParams.slug);

  if (!course) {
    return {
      title: 'Course Not Found',
    };
  }
  return {
    title: course.title,
    description: course.description,
  };
}

// Replicating the blog's page component structure and the `await params` pattern
export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const awaitedParams = await params;
  const course = await getCourse(awaitedParams.slug);

  if (!course) {
    notFound();
  }

  return <CourseDetails course={course} />;
}
