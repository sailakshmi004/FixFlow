'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bug, AlertTriangle, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClientProjectDetail, type ProjectDetail } from '@/features/projects/services/project-detail-service';

export function ClientProjectDetailView({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClientProjectDetail(projectId);
      setProject(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" /></div>;
  }

  if (!project) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-12 text-center backdrop-blur-xl">
        <p className="text-sm text-slate-500">Project not found.</p>
        <Button variant="outline" className="mt-4 rounded-2xl" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  const bugStats = {
    open: project.bugs.filter((b) => b.status === 'new' || b.status === 'accepted').length,
    inProgress: project.bugs.filter((b) => b.status === 'in_progress').length,
    completed: project.bugs.filter((b) => b.status === 'closed').length,
  };

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </button>

      <div className="rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="px-6 py-5">
          <h1 className="text-xl font-bold text-slate-950">{project.name}</h1>
          {project.description && <p className="mt-2 text-sm text-slate-600">{project.description}</p>}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
            {project.deadline && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-slate-400" />Due {project.deadline}</span>}
            <span className="capitalize">Status: {project.status?.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Open issues', value: bugStats.open, icon: AlertTriangle },
          { label: 'In progress', value: bugStats.inProgress, icon: Clock },
          { label: 'Completed', value: bugStats.completed, icon: CheckCircle2 },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/70 bg-white/85 px-5 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
              <s.icon className="h-4 w-4 text-slate-300" />
            </div>
            <p className="mt-1.5 text-2xl font-bold text-slate-950">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="border-b border-slate-200/70 px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Bug className="h-4 w-4" />
            Issues ({project.bugs.length})
          </div>
        </div>
        <div className="p-5">
          {project.bugs.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No issues for this project.</p>
          ) : (
            <div className="space-y-2">
              {project.bugs.map((bug) => (
                <Link key={bug.id} href={`/client/bugs/${bug.id}`} className="block rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{bug.title}</p>
                      <p className="text-xs text-slate-500">{new Date(bug.created_at ?? '').toLocaleDateString()}</p>
                    </div>
                    <span className="ml-3 text-xs text-slate-400 capitalize">{bug.status?.replace('_', ' ')}</span>
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
