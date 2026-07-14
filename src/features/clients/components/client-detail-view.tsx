'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, FolderKanban, Bug, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClientDetail, type ClientDetail } from '@/features/clients/services/client-detail-service';

export function ClientDetailView({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClientDetail(clientId);
      setClient(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" /></div>;
  }

  if (!client) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-12 text-center backdrop-blur-xl">
        <p className="text-sm text-slate-500">Client not found.</p>
        <Button variant="outline" className="mt-4 rounded-2xl" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  const bugStats = {
    open: client.bugs.filter((b) => b.status === 'new' || b.status === 'accepted').length,
    inProgress: client.bugs.filter((b) => b.status === 'in_progress').length,
    completed: client.bugs.filter((b) => b.status === 'closed').length,
  };

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Back to clients
      </button>

      <div className="rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-950">{client.name}</h1>
              <p className="mt-1 text-sm text-slate-500">{client.company_name || 'No company'}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 capitalize">{client.status}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
            {client.email && <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-slate-400" />{client.email}</span>}
            {client.phone && <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-slate-400" />{client.phone}</span>}
          </div>
          {client.notes && <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3">{client.notes}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Projects', value: client.projects.length, icon: FolderKanban },
          { label: 'Open bugs', value: bugStats.open, icon: AlertTriangle },
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
            <FolderKanban className="h-4 w-4" />
            Projects ({client.projects.length})
          </div>
        </div>
        <div className="p-5">
          {client.projects.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No projects for this client.</p>
          ) : (
            <div className="space-y-2">
              {client.projects.map((p) => (
                <Link key={p.id} href={`/freelancer/projects/${p.id}`} className="block rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.bug_count} bugs · {p.status}</p>
                    </div>
                    {p.deadline && <span className="text-xs text-slate-400">Due {p.deadline}</span>}
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
            <Bug className="h-4 w-4" />
            Recent bugs ({client.bugs.length})
          </div>
        </div>
        <div className="p-5">
          {client.bugs.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No bugs reported by this client.</p>
          ) : (
            <div className="space-y-2">
              {client.bugs.slice(0, 10).map((bug) => (
                <Link key={bug.id} href={`/freelancer/bugs/${bug.id}`} className="block rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{bug.title}</p>
                      <p className="text-xs text-slate-500">{bug.project?.name} · {new Date(bug.created_at ?? '').toLocaleDateString()}</p>
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
