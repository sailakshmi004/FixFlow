'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, FolderKanban, AlertTriangle, Clock, CheckCircle2, ListTodo, Calendar } from 'lucide-react';
import { getFreelancerDashboardStats, type FreelancerDashboardStats } from '@/features/dashboard/services/dashboard-service';
import { ROUTES } from '@/constants/routes';

export function FreelancerDashboard() {
  const [stats, setStats] = useState<FreelancerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getFreelancerDashboardStats();
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
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of your clients, projects, and issues.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Clients', value: stats.totalClients, icon: Users, href: ROUTES.freelancer.clients },
          { label: 'Projects', value: stats.totalProjects, icon: FolderKanban, href: ROUTES.freelancer.projects },
          { label: 'Open bugs', value: stats.openBugs, icon: AlertTriangle, href: ROUTES.freelancer.bugs },
          { label: 'In progress', value: stats.inProgressBugs, icon: Clock, href: ROUTES.freelancer.bugs },
          { label: 'Client review', value: stats.clientReviewBugs, icon: CheckCircle2, href: ROUTES.freelancer.bugs },
          { label: 'Closed', value: stats.closedBugs, icon: CheckCircle2, href: ROUTES.freelancer.bugs },
          { label: 'Urgent', value: stats.urgentBugs, icon: AlertTriangle, href: ROUTES.freelancer.bugs },
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

      <div className="grid gap-6 lg:grid-cols-2">
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
                  <Link key={bug.id} href={`/freelancer/bugs/${bug.id}`} className="block rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-50">
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

        <div className="rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-xl">
          <div className="border-b border-slate-200/70 px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Calendar className="h-4 w-4" />
              Upcoming deadlines
            </div>
          </div>
          <div className="p-5">
            {stats.upcomingDeadlines.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No upcoming deadlines.</p>
            ) : (
              <div className="space-y-2">
                {stats.upcomingDeadlines.map((d) => (
                  <div key={d.id} className="rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{d.name}</p>
                        <p className="text-xs text-slate-500">{d.client_name}</p>
                      </div>
                      <span className="text-xs font-medium text-slate-600">{d.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
