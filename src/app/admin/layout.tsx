import { DashboardShell } from '@/components/layout/dashboard-shell';
import { requireRole } from '@/features/auth/services/session';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireRole('admin');

  return <DashboardShell role="admin" fullName={profile.full_name}>{children}</DashboardShell>;
}
