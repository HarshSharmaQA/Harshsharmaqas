
import { notFound } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Course } from '@/lib/mock-data';
import { CourseDetails } from './course-details';
import type { Metadata } from 'next';

type CourseDetailPageProps = {
  params: Promise<{ slug: string }>;
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

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);

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

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  return <CourseDetails course={course} />;
}
