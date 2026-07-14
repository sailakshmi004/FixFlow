'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, Monitor, Globe, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBugById, updateBugStatus } from '@/features/bugs/services/bug-service';
import { BugComments } from '@/features/bugs/components/bug-comments';
import { BugAttachments } from '@/features/bugs/components/bug-attachments';
import { BugActivityTimeline } from '@/features/bugs/components/bug-activity-timeline';
import type { BugWithRelations } from '@/features/bugs/types/bug.types';
import type { BugStatus } from '@/constants/statuses';
import type { Role } from '@/types/database.types';

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
  change_request: { label: 'Change request', classes: 'bg-violet-50/80 text-violet-600 border border-violet-200/60' },
};

function getFreelancerActions(status: string | null): { label: string; nextStatus: BugStatus }[] {
  switch (status) {
    case 'new': return [
      { label: 'Accept', nextStatus: 'accepted' },
      { label: 'Start working', nextStatus: 'in_progress' },
      { label: 'Reject', nextStatus: 'rejected' },
    ];
    case 'accepted': return [
      { label: 'Start working', nextStatus: 'in_progress' },
      { label: 'Reject', nextStatus: 'rejected' },
    ];
    case 'in_progress': return [
      { label: 'Mark fixed', nextStatus: 'fixed' },
      { label: 'Reject', nextStatus: 'rejected' },
    ];
    case 'fixed': return [
      { label: 'Send for review', nextStatus: 'client_review' },
    ];
    case 'reopened': return [
      { label: 'Start working', nextStatus: 'in_progress' },
      { label: 'Reject', nextStatus: 'rejected' },
    ];
    default: return [];
  }
}

function getClientActions(status: string | null): { label: string; nextStatus: BugStatus }[] {
  switch (status) {
    case 'client_review': return [
      { label: 'Approve Fix', nextStatus: 'closed' },
      { label: 'Request Changes', nextStatus: 'reopened' },
    ];
    case 'closed': return [
      { label: 'Reopen', nextStatus: 'reopened' },
    ];
    default: return [];
  }
}

type BugDetailViewProps = {
  bugId: string;
  role: Role;
};

export function BugDetailView({ bugId, role }: BugDetailViewProps) {
  const router = useRouter();
  const [bug, setBug] = useState<BugWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadBug = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBugById(bugId);
      setBug(data);
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to load issue.');
    } finally {
      setLoading(false);
    }
  }, [bugId]);

  useEffect(() => { void loadBug(); }, [loadBug]);

  const onStatusAction = async (newStatus: BugStatus) => {
    setActionMessage(null);
    setActionLoading(true);
    try {
      await updateBugStatus(bugId, newStatus);
      await loadBug();
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const isFreelancer = role === 'freelancer';
  const actions = isFreelancer ? getFreelancerActions(bug?.status ?? null) : getClientActions(bug?.status ?? null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-12 text-center backdrop-blur-xl">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
          <AlertTriangle className="h-5 w-5 text-slate-400" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-600">Issue not found</p>
        <Button variant="outline" className="mt-4 rounded-2xl" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[bug.status ?? 'new'] ?? STATUS_STYLES.new;
  const typeStyle = TYPE_STYLES[bug.type ?? 'bug'] ?? TYPE_STYLES.bug;

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="border-b border-slate-200/70 px-6 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle.classes}`}>
              {statusStyle.label}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${typeStyle.classes}`}>
              {typeStyle.label}
            </span>
          </div>
          <h1 className="mt-3 text-xl font-bold text-slate-950">{bug.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{bug.project?.name}</p>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <h2 className="text-sm font-medium text-slate-700">Description</h2>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{bug.description || 'No description provided.'}</p>
          </div>

          {bug.steps_to_reproduce && (
            <div>
              <h2 className="text-sm font-medium text-slate-700">Steps to reproduce</h2>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{bug.steps_to_reproduce}</p>
            </div>
          )}

          {bug.expected_result && (
            <div>
              <h2 className="text-sm font-medium text-slate-700">Expected result</h2>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{bug.expected_result}</p>
            </div>
          )}

          {bug.actual_result && (
            <div>
              <h2 className="text-sm font-medium text-slate-700">Actual result</h2>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{bug.actual_result}</p>
            </div>
          )}

          <div className="grid gap-px rounded-2xl border border-slate-200/70 bg-slate-100 overflow-hidden sm:grid-cols-2">
            {[
              { icon: User, label: 'Reported by', value: bug.reporter?.full_name || bug.reporter?.email || 'Unknown' },
              { icon: User, label: 'Assigned to', value: bug.assignee?.full_name || bug.assignee?.email || 'Unassigned' },
              ...(bug.created_at ? [{ icon: Calendar, label: 'Created', value: new Date(bug.created_at).toLocaleDateString() }] : []),
              ...(bug.due_date ? [{ icon: Calendar, label: 'Due date', value: bug.due_date }] : []),
              ...(bug.browser_info ? [{ icon: Monitor, label: 'Browser', value: bug.browser_info }] : []),
              ...(bug.device_info ? [{ icon: Monitor, label: 'Device', value: bug.device_info }] : []),
              ...(bug.page_url ? [{ icon: Globe, label: 'Page URL', value: bug.page_url }] : []),
            ].map((item, i) => (
              <div key={i} className="bg-white px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="text-sm font-medium text-slate-950 truncate max-w-[250px]">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {actionMessage && <p className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{actionMessage}</p>}

          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-slate-200/70 pt-5">
              {actions.map((action) => (
                <Button
                  key={action.nextStatus}
                  onClick={() => void onStatusAction(action.nextStatus)}
                  disabled={actionLoading}
                  className="rounded-2xl px-5"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <BugAttachments bugId={bugId} />
      <BugActivityTimeline bugId={bugId} />
      <BugComments bugId={bugId} />
    </div>
  );
}
