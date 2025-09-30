
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
  Users,
  BookOpen,
  Newspaper,
  Star,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { type BlogPost } from '@/app/admin/blogs/page';

export function DashboardClient({ data }: { data: any }) {
  const {
    totalCourses,
    totalRevenue,
    totalBlogs,
    totalTestimonials,
    chartData,
    recentPosts,
  } = data;

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <DollarSign className="h-6 w-6 text-muted-foreground" />,
      note: 'Estimated from all courses',
    },
    {
      title: 'Active Courses',
      value: totalCourses,
      icon: <BookOpen className="h-6 w-6 text-muted-foreground" />,
      note: `${totalCourses} courses online`,
    },
    {
      title: 'Blog Posts',
      value: totalBlogs,
      icon: <Newspaper className="h-6 w-6 text-muted-foreground" />,
      note: `${totalBlogs} posts published`,
    },
    {
      title: 'Testimonials',
      value: totalTestimonials,
      icon: <Star className="h-6 w-6 text-muted-foreground" />,
      note: `From ${totalTestimonials} happy customers`,
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
        {stats.map((stat) => (
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
        ))}
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
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
              {recentPosts.length > 0 ? (
                recentPosts.map((post: BlogPost) => (
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
