'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bug, CheckCircle2, Clock, AlertTriangle, ListTodo } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getFreelancerBugs, updateBugStatus } from '@/features/bugs/services/bug-service';
import type { BugWithRelations } from '@/features/bugs/types/bug.types';
import type { BugStatus } from '@/constants/statuses';

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  new: { label: 'New', classes: 'bg-amber-50/80 text-amber-700 border border-amber-200/60' },
  accepted: { label: 'Accepted', classes: 'bg-sky-50/80 text-sky-700 border border-sky-200/60' },
  in_progress: { label: 'In progress', classes: 'bg-blue-50/80 text-blue-700 border border-blue-200/60' },
  fixed: { label: 'Fixed', classes: 'bg-teal-50/80 text-teal-700 border border-teal-200/60' },
  client_review: { label: 'Client review', classes: 'bg-purple-50/80 text-purple-700 border border-purple-200/60' },
  reopened: { label: 'Reopened', classes: 'bg-orange-50/80 text-orange-700 border border-orange-200/60' },
  closed: { label: 'Closed', classes: 'bg-emerald-50/80 text-emerald-700 border border-emerald-200/60' },
  rejected: { label: 'Rejected', classes: 'bg-red-50/80 text-red-700 border border-red-200/60' },
};

const TYPE_STYLES: Record<string, { label: string; classes: string }> = {
  bug: { label: 'Bug', classes: 'bg-rose-50/80 text-rose-600 border border-rose-200/60' },
  change_request: { label: 'Change', classes: 'bg-violet-50/80 text-violet-600 border border-violet-200/60' },
};

const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low'] as const;

function getNextActions(status: string | null): { label: string; nextStatus: BugStatus }[] {
  switch (status) {
    case 'new':
      return [
        { label: 'Accept', nextStatus: 'accepted' },
        { label: 'Start working', nextStatus: 'in_progress' },
        { label: 'Reject', nextStatus: 'rejected' },
      ];
    case 'accepted':
      return [
        { label: 'Start working', nextStatus: 'in_progress' },
        { label: 'Reject', nextStatus: 'rejected' },
      ];
    case 'in_progress':
      return [
        { label: 'Mark fixed', nextStatus: 'fixed' },
        { label: 'Reject', nextStatus: 'rejected' },
      ];
    case 'fixed':
      return [
        { label: 'Send for review', nextStatus: 'client_review' },
      ];
    case 'reopened':
      return [
        { label: 'Start working', nextStatus: 'in_progress' },
        { label: 'Reject', nextStatus: 'rejected' },
      ];
    default:
      return [];
  }
}

export function FreelancerBugBoard() {
  const [bugs, setBugs] = useState<BugWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadBugs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFreelancerBugs();
      setBugs(data);
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to load issues.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadBugs(); }, [loadBugs]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel('bugs-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'bugs' }, () => { void loadBugs(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadBugs]);

  const stats = useMemo(() => ({
    total: bugs.length,
    new: bugs.filter((b) => b.status === 'new').length,
    inProgress: bugs.filter((b) => b.status === 'in_progress').length,
    clientReview: bugs.filter((b) => b.status === 'client_review').length,
    closed: bugs.filter((b) => b.status === 'closed').length,
  }), [bugs]);

  const filteredBugs = useMemo(() => {
    if (statusFilter === 'all') return bugs;
    return bugs.filter((b) => b.status === statusFilter);
  }, [bugs, statusFilter]);

  const sortedBugs = useMemo(() => {
    return [...filteredBugs].sort((a, b) => {
      const aIdx = PRIORITY_ORDER.indexOf((a.priority ?? 'medium') as typeof PRIORITY_ORDER[number]);
      const bIdx = PRIORITY_ORDER.indexOf((b.priority ?? 'medium') as typeof PRIORITY_ORDER[number]);
      return aIdx - bIdx;
    });
  }, [filteredBugs]);

  const onStatusAction = async (bugId: string, newStatus: BugStatus) => {
    setActionMessage(null);
    try {
      await updateBugStatus(bugId, newStatus);
      await loadBugs();
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to update status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-950">Issues</h1>
        <p className="mt-1 text-sm text-slate-500">Bugs and change requests reported by your clients.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total issues', value: stats.total, icon: ListTodo },
          { label: 'New', value: stats.new, icon: AlertTriangle },
          { label: 'In progress', value: stats.inProgress, icon: Clock },
          { label: 'Client review', value: stats.clientReview, icon: CheckCircle2 },
          { label: 'Closed', value: stats.closed, icon: CheckCircle2 },
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
        <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Bug className="h-4 w-4" />
            All issues
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{bugs.length}</span>
          </div>
          <div className="w-40">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All status</option>
              <option value="new">New</option>
              <option value="accepted">Accepted</option>
              <option value="in_progress">In progress</option>
              <option value="fixed">Fixed</option>
              <option value="client_review">Client review</option>
              <option value="reopened">Reopened</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            </div>
          ) : actionMessage ? (
            <p className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{actionMessage}</p>
          ) : sortedBugs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                <ListTodo className="h-5 w-5 text-slate-400" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-600">No issues found</p>
              <p className="mt-1 text-xs text-slate-400">Issues reported by clients will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedBugs.map((bug) => {
                const statusStyle = STATUS_STYLES[bug.status ?? 'new'] ?? STATUS_STYLES.new;
                const typeStyle = TYPE_STYLES[bug.type ?? 'bug'] ?? TYPE_STYLES.bug;
                const actions = getNextActions(bug.status);

                return (
                  <div key={bug.id} className="rounded-2xl border border-slate-200/70 bg-slate-50/50 px-5 py-4 transition-colors hover:bg-slate-50">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/freelancer/bugs/${bug.id}`} className="font-semibold text-slate-950 hover:text-slate-600">
                            {bug.title}
                          </Link>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.classes}`}>
                            {statusStyle.label}
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeStyle.classes}`}>
                            {typeStyle.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>{bug.project?.name}</span>
                          <span>By {bug.reporter?.full_name || bug.reporter?.email || 'Unknown'}</span>
                          <span>{bug.priority ?? 'medium'} priority</span>
                          {bug.created_at && <span>{new Date(bug.created_at).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-1.5">
                        {actions.map((action) => (
                          <button
                            key={action.nextStatus}
                            onClick={() => void onStatusAction(bug.id, action.nextStatus)}
                            className="rounded-xl border border-slate-200/70 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
                          >
                            {action.label}
                          </button>
                        ))}
                        <Link
                          href={`/freelancer/bugs/${bug.id}`}
                          className="rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
