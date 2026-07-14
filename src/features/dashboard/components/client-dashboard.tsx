'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderKanban, AlertTriangle, Clock, CheckCircle2, ListTodo, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClientDashboardStats, type ClientDashboardStats } from '@/features/dashboard/services/dashboard-service';
import { ROUTES } from '@/constants/routes';

export function ClientDashboard() {
  const [stats, setStats] = useState<ClientDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getClientDashboardStats();
        setStats(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Overview of your projects and issues.</p>
        </div>
        <Link href={ROUTES.client.reportBug}>
          <Button className="gap-2 rounded-2xl">
            <Plus className="h-4 w-4" />
            Report issue
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Projects', value: stats.totalProjects, icon: FolderKanban, href: ROUTES.client.projects },
          { label: 'Open issues', value: stats.openBugs, icon: AlertTriangle, href: ROUTES.client.bugs },
          { label: 'In progress', value: stats.inProgressBugs, icon: Clock, href: ROUTES.client.bugs },
          { label: 'Completed', value: stats.completedBugs, icon: CheckCircle2, href: ROUTES.client.bugs },
        ].map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="rounded-2xl border border-slate-200/70 bg-white/85 px-5 py-4 backdrop-blur-xl transition-colors hover:bg-white">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">{s.label}</p>
                <s.icon className="h-4 w-4 text-slate-300" />
              </div>
              <p className="mt-1.5 text-2xl font-bold text-slate-950">{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="border-b border-slate-200/70 px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <ListTodo className="h-4 w-4" />
            Recent issues
          </div>
        </div>
        <div className="p-5">
          {stats.recentBugs.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No issues reported yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentBugs.map((bug) => (
                <Link key={bug.id} href={`/client/bugs/${bug.id}`} className="block rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{bug.title}</p>
                      <p className="text-xs text-slate-500">{bug.project_name} · {new Date(bug.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="ml-3 text-xs text-slate-400 capitalize">{bug.status.replace('_', ' ')}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
