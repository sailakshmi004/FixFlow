import { PublicShell } from '@/components/layout/public-shell';

export const dynamic = 'force-dynamic';

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <PublicShell>{children}</PublicShell>;
}
