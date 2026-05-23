import { DashboardShell } from '@/components/layout/dashboard-shell';
import { requireRole } from '@/features/auth/services/session';

export default async function FreelancerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireRole('freelancer');

  return <DashboardShell role="freelancer" fullName={profile.full_name}>{children}</DashboardShell>;
}

