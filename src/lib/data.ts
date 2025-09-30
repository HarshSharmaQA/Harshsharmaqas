'use server';

import { unstable_cache as cache } from 'next/cache';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BlogPost } from '@/app/admin/blogs/page';
import type { Course } from '@/lib/mock-data';

type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  stars: number;
};

type SiteSettings = {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImageUrl?: string;
  socialTwitter: string;
  socialLinkedin: string;
  socialGithub: string;
  siteName: string;
};

const getRecentPosts = cache(
  async () => {
    const postsCol = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(3));
    const postsSnapshot = await getDocs(postsCol);
    return postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
  },
  ['recent-posts'],
  { revalidate: 3600 }
);

const getFeaturedCourses = cache(
  async () => {
    const coursesCol = query(collection(db, 'courses'), limit(3));
    const coursesSnapshot = await getDocs(coursesCol);
    return coursesSnapshot.docs.map(doc => doc.data() as Course);
  },
  ['featured-courses'],
  { revalidate: 3600 }
);

const getTestimonials = cache(
  async () => {
    const testimonialsCol = query(collection(db, 'testimonials'), orderBy('name'), limit(3));
    const testimonialsSnapshot = await getDocs(testimonialsCol);
    return testimonialsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
  },
  ['testimonials'],
  { revalidate: 3600 }
);

const getSettings = cache(
  async () => {
    const docRef = doc(db, 'settings', 'site');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SiteSettings;
    }
    return null;
  },
  ['site-settings'],
  { revalidate: 3600 }
);


export async function getHomepageData() {
    const [posts, courses, testimonials, settings] = await Promise.all([
        getRecentPosts(),
        getFeaturedCourses(),
        getTestimonials(),
        getSettings(),
    ]);
    return { posts, courses, testimonials, settings };
}
