

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getDashboardRoute } from '@/constants/routes';
import { ROLE_LABELS } from '@/constants/roles';
import { getCurrentProfile } from '@/features/auth/services/session';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Features', href: ROUTES.features },
  { label: 'Pricing', href: ROUTES.pricing },
  { label: 'Contact', href: ROUTES.contact }
];

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
  return initials || 'F';
}

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.08),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_46%,_#eef2ff_100%)]" />
      <header className="relative border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href={ROUTES.home} className="flex items-center gap-3 text-xl font-bold tracking-tight text-slate-950">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-soft">
              F
            </span>
            <span>FixFlow</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-slate-950">
                {item.label}
              </Link>
            ))}
          </nav>
          {profile ? (
            <div className="flex items-center gap-3">
              <Link
                href={getDashboardRoute(profile.role)}
                className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                  {getInitials(profile.full_name)}
                </span>
                <span className="min-w-0">
                  <span className="block max-w-36 truncate text-sm font-semibold text-slate-950">{profile.full_name}</span>
                  <span className="block text-xs text-slate-500">{ROLE_LABELS[profile.role]} workspace</span>
                </span>
              </Link>
              <Link href={getDashboardRoute(profile.role)} className={buttonVariants()}>
                Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={ROUTES.login} className={cn(buttonVariants({ variant: 'outline' }), 'hidden sm:inline-flex')}>
                Log in
              </Link>
              <Link href={ROUTES.register} className={buttonVariants()}>
                Get started
              </Link>
            </div>
          )}
        </div>
      </header>
      <main className="relative">{children}</main>
      <footer className="relative border-t border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8">
          FixFlow helps freelancers manage client bugs, approvals, and invoices in one place.
        </div>
      </footer>
    </div>
  );
}
