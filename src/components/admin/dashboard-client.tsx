
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
import { format } from 'date-fns';

export function DashboardClient({ data }: { data: any }) {
    const { 
        totalUsers, 
        totalCourses, 
        totalRevenue,
        chartData,
        recentUsers
    } = data;
    
    const stats = [
        { title: 'Total Users', value: totalUsers.toLocaleString(), icon: <Users className="h-6 w-6 text-muted-foreground" />, change: '' },
        { title: 'Active Courses', value: totalCourses, icon: <BookOpen className="h-6 w-6 text-muted-foreground" />, change: '' },
        { title: 'Avg. Rank', value: '3.4', icon: <TrendingUp className="h-6 w-6 text-muted-foreground" />, change: '-0.2', note: 'mock data' },
        { title: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: <DollarSign className="h-6 w-6 text-muted-foreground" />, change: '', note: 'estimated' },
    ];

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
                    <p className="text-xs text-muted-foreground">
                        {stat.note === 'mock data' ? 'Mock Data' : stat.note === 'estimated' ? 'Estimated Total' : ''}
                    </p>
                    </CardContent>
                </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                <CardHeader>
                    <CardTitle className="font-headline">User Growth</CardTitle>
                    <CardDescription>New signups over time.</CardDescription>
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
                        <Bar dataKey="signups" fill="hsl(var(--primary))" name="New Signups" />
                    </BarChart>
                    </ResponsiveContainer>
                </CardContent>
                </Card>
                <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Recent Activity</CardTitle>
                    <CardDescription>A log of the newest users on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentUsers.length > 0 ? recentUsers.map((user: any) => (
                            <div key={user.uid} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt="Avatar" />
                                    <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.name} signed up.</p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.joinedAt ? format(user.joinedAt.toDate(), 'PPP p') : 'Just now'}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center">No recent user activity.</p>
                        )}
                    </div>
                </CardContent>
                </Card>
            </div>
        </div>
    );
}
