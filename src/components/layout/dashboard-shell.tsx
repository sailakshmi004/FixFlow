'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, LogOut } from 'lucide-react';
import { ROUTES, getRoleNavItems } from '@/constants/routes';
import { ROLE_LABELS, type Role } from '@/constants/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { logoutUser } from '@/features/auth/services/auth-service';

type DashboardShellProps = {
  role: Role;
  fullName: string;
  children: React.ReactNode;
};

export function DashboardShell({ role, fullName, children }: DashboardShellProps) {
  const pathname = usePathname();
  const navItems = getRoleNavItems(role);

  return (
    <div className="relative min-h-screen text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.06),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]" />
      <div className="relative grid min-h-screen lg:grid-cols-[300px_1fr]">
        <aside className="border-r border-slate-200/70 bg-white/85 backdrop-blur-xl">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200/70 px-6 py-6">
              <Link href={ROUTES.dashboard[role] as never} className="flex items-center gap-3 text-xl font-bold tracking-tight">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-soft">
                  F
                </span>
                <span>FixFlow</span>
              </Link>
              <p className="mt-2 text-sm text-slate-500">{ROLE_LABELS[role]} workspace</p>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href as never}
                    className={cn(
                      'flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-slate-950 text-white shadow-soft'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    )}
                  >
                    <span>
                      <span className="block">{item.label}</span>
                      {item.description ? <span className={cn('block text-xs', active ? 'text-slate-300' : 'text-slate-400')}>{item.description}</span> : null}
                    </span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-slate-200/70 p-4">
              <div className="rounded-3xl bg-slate-950 px-4 py-4 text-white shadow-soft">
                <p className="text-sm font-medium">{fullName}</p>
                <p className="text-xs text-slate-300">{ROLE_LABELS[role]}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <div className="relative hidden flex-1 md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="h-11 rounded-full bg-white pl-10" placeholder="Search bugs, projects, clients..." />
              </div>
              <Button variant="outline" size="icon" className="ml-auto">
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={async () => {
                  await logoutUser();
                  window.location.assign(ROUTES.login);
                }}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
