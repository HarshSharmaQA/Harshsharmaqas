
import { DashboardClient } from '@/components/admin/dashboard-client';
import { getDashboardData, type DashboardData } from '@/lib/data';

export default async function AdminDashboard() {
  const data: DashboardData = await getDashboardData();
  return <DashboardClient initialData={data} />;
}
