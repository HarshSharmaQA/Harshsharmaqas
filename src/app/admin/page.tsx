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
import { Users, BookOpen, TrendingUp, DollarSign } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const stats = [
  { title: 'Total Users', value: '1,254', icon: <Users className="h-6 w-6 text-muted-foreground" />, change: '+12%' },
  { title: 'Active Courses', value: '12', icon: <BookOpen className="h-6 w-6 text-muted-foreground" />, change: '' },
  { title: 'Avg. Rank', value: '3.4', icon: <TrendingUp className="h-6 w-6 text-muted-foreground" />, change: '-0.2' },
  { title: 'Revenue', value: '$8,450', icon: <DollarSign className="h-6 w-6 text-muted-foreground" />, change: '+20.1%' },
];

const chartData = [
  { name: 'Jan', users: 400, signups: 240 },
  { name: 'Feb', users: 300, signups: 139 },
  { name: 'Mar', users: 200, signups: 980 },
  { name: 'Apr', users: 278, signups: 390 },
  { name: 'May', users: 189, signups: 480 },
  { name: 'Jun', users: 239, signups: 380 },
  { name: 'Jul', users: 349, signups: 430 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">User Growth</CardTitle>
            <CardDescription>New users and signups over the last 7 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Bar dataKey="users" fill="hsl(var(--primary))" name="Total Users" />
                <Bar dataKey="signups" fill="hsl(var(--accent))" name="New Signups" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>A log of recent events on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="https://picsum.photos/seed/user1/100/100" alt="Avatar" />
                        <AvatarFallback>U1</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Olivia Martin enrolled in "API Testing".</p>
                        <p className="text-sm text-muted-foreground">5 minutes ago</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="https://picsum.photos/seed/user2/100/100" alt="Avatar" />
                        <AvatarFallback>U2</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Jackson Lee signed up.</p>
                        <p className="text-sm text-muted-foreground">15 minutes ago</p>
                    </div>
                </div>
                 <div className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="https://picsum.photos/seed/user3/100/100" alt="Avatar" />
                        <AvatarFallback>U3</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Admin ran an SEO Audit.</p>
                        <p className="text-sm text-muted-foreground">1 hour ago</p>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
