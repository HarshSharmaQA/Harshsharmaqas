
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import type { Course } from '@/lib/mock-data';
import { DashboardClient } from '@/components/admin/dashboard-client';
import { type BlogPost } from './blogs/page';

async function getDashboardData() {
  // Fetch all collections in parallel
  const [courseSnapshot, blogSnapshot, testimonialSnapshot] =
    await Promise.all([
      getDocs(collection(db, 'courses')),
      getDocs(query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(5))),
      getDocs(collection(db, 'testimonials')),
    ]);

  const courses = courseSnapshot.docs.map(doc => doc.data() as Course);
  const recentPosts = blogSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));

  const totalCourses = courses.length;
  const totalBlogs = blogSnapshot.size;
  const totalTestimonials = testimonialSnapshot.size;

  // NOTE: Revenue is a simple sum of all course prices.
  // This mock calculation assumes each course is sold once per month for chart data.
  const totalRevenue = courses.reduce((sum, course) => sum + course.price, 0);

  // Process sales data for chart
  const monthlySales: { [key: string]: { name: string; sales: number } } = {};
  // Mocking some sales data based on course prices for the last few months for demonstration
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = format(d, 'MMM');
      const monthlyTotal = courses.reduce((sum, course) => {
        // simple mock logic to generate varied data
        return sum + course.price * (i + 1) * (Math.random() * 0.5 + 0.8);
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

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return <DashboardClient data={data} />;
}
