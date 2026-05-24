import { AuthShell } from '@/components/layout/auth-shell';

export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthShell
      title="Welcome back to FixFlow"
      description="Log in or create your workspace and keep bug reports, approvals, and invoices organized."
    >
      {children}
    </AuthShell>
  );
}
