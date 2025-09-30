
'use server';

import { collection, getDocs, query, orderBy, limit, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BlogPost } from '@/app/admin/blogs/page';
import type { Course } from '@/lib/mock-data';
import { format } from 'date-fns';

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

export interface DashboardData {
  totalCourses: number;
  totalRevenue: number;
  totalBlogs: number;
  totalTestimonials: number;
  chartData: { name: string; sales: number }[];
  recentPosts: BlogPost[];
}

async function getRecentPostsHomepage() {
    const postsCol = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(3));
    const postsSnapshot = await getDocs(postsCol);
    return postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
}

async function getFeaturedCourses() {
    const coursesCol = query(collection(db, 'courses'), limit(3));
    const coursesSnapshot = await getDocs(coursesCol);
    return coursesSnapshot.docs.map(doc => doc.data() as Course);
}

async function getTestimonials() {
    const testimonialsCol = query(collection(db, 'testimonials'), orderBy('name'), limit(3));
    const testimonialsSnapshot = await getDocs(testimonialsCol);
    return testimonialsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
}

async function getSettings() {
    const docRef = doc(db, 'settings', 'site');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SiteSettings;
    }
    return null;
}


export async function getHomepageData() {
    const [posts, courses, testimonials, settings] = await Promise.all([
        getRecentPostsHomepage(),
        getFeaturedCourses(),
        getTestimonials(),
        getSettings(),
    ]);
    return { posts, courses, testimonials, settings };
}

export async function getDashboardData(): Promise<DashboardData> {
  // Fetch all collections in parallel
  const [courseSnapshot, blogSnapshot, testimonialSnapshot] =
    await Promise.all([
      getDocs(collection(db, 'courses')),
      getDocs(query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(5))),
      getDocs(collection(db, 'testimonials')),
    ]);

  const courses = courseSnapshot.docs.map(doc => doc.data() as Course);
  // Convert Timestamp to a serializable format (string)
  const recentPosts = blogSnapshot.docs.map(doc => {
      const data = doc.data();
      // Firestore timestamps need to be converted to a serializable format for client components
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt : new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds);
      
      const post: BlogPost = {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        author: data.author,
        category: data.category,
        seoDescription: data.seoDescription,
        createdAt: createdAt,
      };

      if (data.featureImageUrl) {
        post.featureImageUrl = data.featureImageUrl;
      }
       if (data.faqs) {
        post.faqs = data.faqs;
      }
      return post;
  });


  const totalCourses = courses.length;
  const totalBlogs = blogSnapshot.size;
  const totalTestimonials = testimonialSnapshot.size;

  // NOTE: Revenue is a simple sum of all course prices.
  // This mock calculation assumes each course is sold once per month for chart data.
  const totalRevenue = courses.reduce((sum, course) => sum + (course.price || 0), 0);

  // Process sales data for chart
  const monthlySales: { [key: string]: { name: string; sales: number } } = {};
  // Mocking some sales data based on course prices for the last few months for demonstration
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = format(d, 'MMM');
      const monthlyTotal = courses.reduce((sum, course) => {
        // simple mock logic to generate varied data
        return sum + (course.price || 0) * (i + 1) * (Math.random() * 0.5 + 0.8);
      }, 0);
      monthlySales[month] = { name: month, sales: Math.round(monthlyTotal) };
  }

  const chartData = Object.values(monthlySales);

  return {
    totalCourses,
    totalRevenue,
    totalBlogs,
    totalTestimonials,
    chartData,
    recentPosts,
  };
}
