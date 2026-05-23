import { DashboardShell } from '@/components/layout/dashboard-shell';
import { requireRole } from '@/features/auth/services/session';

export default async function ClientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireRole('client');

  return <DashboardShell role="client" fullName={profile.full_name}>{children}</DashboardShell>;
}

