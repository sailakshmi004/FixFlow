'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Bug, AlertTriangle, Clock, CheckCircle2, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClientBugs } from '@/features/bugs/services/bug-service';
import type { BugWithRelations } from '@/features/bugs/types/bug.types';
import { ROUTES } from '@/constants/routes';

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  open: { label: 'Open', classes: 'bg-amber-50/80 text-amber-700 border border-amber-200/60' },
  in_progress: { label: 'In progress', classes: 'bg-blue-50/80 text-blue-700 border border-blue-200/60' },
  declined: { label: 'Declined', classes: 'bg-red-50/80 text-red-700 border border-red-200/60' },
  completed: { label: 'Completed', classes: 'bg-emerald-50/80 text-emerald-700 border border-emerald-200/60' },
};

const TYPE_STYLES: Record<string, { label: string; classes: string }> = {
  bug: { label: 'Bug', classes: 'bg-rose-50/80 text-rose-600 border border-rose-200/60' },
  change_request: { label: 'Change', classes: 'bg-violet-50/80 text-violet-600 border border-violet-200/60' },
};

export function ClientBugsBoard() {
  const [bugs, setBugs] = useState<BugWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadBugs = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getClientBugs();
      setBugs(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load issues.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadBugs(); }, [loadBugs]);

  const stats = useMemo(() => ({
    total: bugs.length,
    open: bugs.filter((b) => b.status === 'open').length,
    inProgress: bugs.filter((b) => b.status === 'in_progress').length,
    completed: bugs.filter((b) => b.status === 'completed').length,
  }), [bugs]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">My issues</h1>
          <p className="mt-1 text-sm text-slate-500">Track bugs and change requests for your projects.</p>
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
          { label: 'Total', value: stats.total, icon: ListTodo },
          { label: 'Open', value: stats.open, icon: AlertTriangle },
          { label: 'In progress', value: stats.inProgress, icon: Clock },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2 },
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
        <div className="flex items-center gap-2 border-b border-slate-200/70 px-6 py-4 text-sm font-medium text-slate-700">
          <Bug className="h-4 w-4" />
          All issues
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{bugs.length}</span>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            </div>
          ) : errorMessage ? (
            <p className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{errorMessage}</p>
          ) : bugs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                <ListTodo className="h-5 w-5 text-slate-400" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-600">No issues reported</p>
              <p className="mt-1 text-xs text-slate-400">Report a bug or change request to get started.</p>
              <Link href={ROUTES.client.reportBug}>
                <Button className="mt-4 gap-2 rounded-2xl">
                  <Plus className="h-4 w-4" />
                  Report issue
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bugs.map((bug) => {
                const statusStyle = STATUS_STYLES[bug.status ?? 'open'] ?? STATUS_STYLES.open;
                const typeStyle = TYPE_STYLES[bug.type ?? 'bug'] ?? TYPE_STYLES.bug;

                return (
                  <Link key={bug.id} href={`/client/bugs/${bug.id}`} className="block">
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 px-5 py-4 transition-colors hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-950">{bug.title}</span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.classes}`}>
                              {statusStyle.label}
                            </span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeStyle.classes}`}>
                              {typeStyle.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>{bug.project?.name}</span>
                            <span>{bug.priority ?? 'medium'} priority</span>
                            {bug.created_at && <span>{new Date(bug.created_at).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
