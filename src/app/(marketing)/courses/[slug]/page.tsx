
import { notFound } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Course } from '@/lib/mock-data';
import { CourseDetails } from './course-details';
import type { Metadata } from 'next';

type Props = {
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourse(params.slug);

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

export default async function CourseDetailPage({ params }: Props) {
  const course = await getCourse(params.slug);

  if (!course) {
    notFound();
  }

  return <CourseDetails course={course} />;
}
