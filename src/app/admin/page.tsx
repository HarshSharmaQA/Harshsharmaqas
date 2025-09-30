
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
  const data = await getDashboardData();
  
  return <DashboardClient data={data} />;
}
