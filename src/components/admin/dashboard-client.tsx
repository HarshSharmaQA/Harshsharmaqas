
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  BookOpen,
  Newspaper,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { type BlogPost } from '@/app/admin/blogs/page';
import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Course } from '@/lib/mock-data';
import { Skeleton } from '../ui/skeleton';

interface DashboardData {
  totalCourses: number;
  totalRevenue: number;
  totalBlogs: number;
  totalTestimonials: number;
  chartData: { name: string; sales: number }[];
  recentPosts: BlogPost[];
}

async function getDashboardData(): Promise<DashboardData> {
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
      const post: any = { 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      };
      if (data.updatedAt) {
        post.updatedAt = data.updatedAt.toDate().toISOString();
      }
      return post as BlogPost;
  });


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


export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${(data?.totalRevenue || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <DollarSign className="h-6 w-6 text-muted-foreground" />,
      note: 'Estimated from all courses',
    },
    {
      title: 'Active Courses',
      value: data?.totalCourses || 0,
      icon: <BookOpen className="h-6 w-6 text-muted-foreground" />,
      note: `${data?.totalCourses || 0} courses online`,
    },
    {
      title: 'Blog Posts',
      value: data?.totalBlogs || 0,
      icon: <Newspaper className="h-6 w-6 text-muted-foreground" />,
      note: `${data?.totalBlogs || 0} posts published`,
    },
    {
      title: 'Testimonials',
      value: data?.totalTestimonials || 0,
      icon: <Star className="h-6 w-6 text-muted-foreground" />,
      note: `From ${data?.totalTestimonials || 0} happy customers`,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <div className="flex items-center gap-2">
            <Button asChild>
                <Link href="/admin/blogs/create">Create Post</Link>
            </Button>
             <Button asChild variant="outline">
                <Link href="/admin/courses">Manage Courses</Link>
            </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-2/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/2 mb-2" />
                        <Skeleton className="h-3 w-3/4" />
                    </CardContent>
                </Card>
            ))
        ) : (
            stats.map((stat) => (
            <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.note}</p>
                </CardContent>
            </Card>
            ))
        )}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Monthly Sales Overview</CardTitle>
            <CardDescription>A summary of course sales revenue over the past months.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                     <Skeleton className="w-full h-full" />
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                    tickFormatter={(value) =>
                        `$${(value as number).toLocaleString()}`
                    }
                    />
                    <Tooltip
                    contentStyle={{
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                    }}
                    formatter={(value) => [`$${(value as number).toLocaleString()}`, 'Sales']}
                    />
                    <Legend />
                    <Bar
                    dataKey="sales"
                    fill="hsl(var(--primary))"
                    name="Monthly Sales"
                    radius={[4, 4, 0, 0]}
                    />
                </BarChart>
                </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Blog Posts</CardTitle>
            <CardDescription>Your most recently published articles.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <Skeleton className="h-5 w-5 rounded-sm" />
                            <div className="flex-grow space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                        </div>
                    ))
                ) : data?.recentPosts && data.recentPosts.length > 0 ? (
                    data.recentPosts.map((post: BlogPost) => (
                    <div key={post.id} className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <Newspaper className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-grow">
                        <p className="text-sm font-medium leading-tight truncate">{post.title}</p>
                        <p className="text-xs text-muted-foreground">
                            {post.createdAt
                            ? format(new Date(post.createdAt), 'MMMM d, yyyy')
                            : 'Just now'}
                        </p>
                        </div>
                        <Button asChild variant="ghost" size="sm" className="flex-shrink-0">
                            <Link href={`/admin/blogs/${post.id}/edit`}>Edit</Link>
                        </Button>
                    </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center">
                    No blog posts yet.
                    </p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
