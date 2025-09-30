
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
import { type Course } from '@/lib/mock-data';

type User = {
  uid: string;
  name: string;
  email: string;
  joinedAt: Timestamp;
};

async function getDashboardData() {
    // Fetch all collections in parallel
    const [userSnapshot, courseSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'courses'))
    ]);

    const users = userSnapshot.docs.map(doc => doc.data() as User);
    const courses = courseSnapshot.docs.map(doc => doc.data() as Course);

    const totalUsers = users.length;
    const totalCourses = courses.length;

    // NOTE: Revenue is a simple sum of all course prices. 
    // This mock calculation assumes each course is sold once.
    const totalRevenue = courses.reduce((sum, course) => sum + course.price, 0);

    // Process user growth data
    const monthlySignups: { [key: string]: { name: string; signups: number } } = {};
    users.forEach(user => {
        if (user.joinedAt) {
            const month = format(user.joinedAt.toDate(), 'MMM');
            if (!monthlySignups[month]) {
                monthlySignups[month] = { name: month, signups: 0 };
            }
            monthlySignups[month].signups++;
        }
    });

    const chartData = Object.values(monthlySignups).slice(-7); // Get last 7 months of data

     // Get recent users
    const recentUsersQuery = query(collection(db, 'users'), orderBy('joinedAt', 'desc'), limit(3));
    const recentUsersSnapshot = await getDocs(recentUsersQuery);
    const recentUsers = recentUsersSnapshot.docs.map(doc => doc.data() as User);


    return {
        totalUsers,
        totalCourses,
        totalRevenue,
        chartData,
        recentUsers,
    };
}


export default async function AdminDashboard() {
  const { 
    totalUsers, 
    totalCourses, 
    totalRevenue,
    chartData,
    recentUsers
  } = await getDashboardData();
  
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
                {recentUsers.length > 0 ? recentUsers.map(user => (
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
