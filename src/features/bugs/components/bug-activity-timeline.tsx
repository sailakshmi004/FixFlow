'use client';

import { useEffect, useState } from 'react';
import { History, Bug, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { getBugActivity } from '@/features/bugs/services/bug-service';
import type { BugActivityRow } from '@/features/bugs/types/bug.types';

const ACTION_META: Record<string, { label: string; icon: typeof History }> = {
  bug_created: { label: 'Issue created', icon: Bug },
  status_change: { label: 'Status changed', icon: ArrowRight },
  comment_added: { label: 'Comment added', icon: MessageSquare },
};

type BugActivityTimelineProps = {
  bugId: string;
};

export function BugActivityTimeline({ bugId }: BugActivityTimelineProps) {
  const [activities, setActivities] = useState<BugActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getBugActivity(bugId);
        setActivities(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [bugId]);

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="border-b border-slate-200/70 px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <History className="h-4 w-4" />
          Activity
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{activities.length}</span>
        </div>
      </div>

      <div className="px-6 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
              <History className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-2 text-sm text-slate-500">No activity yet.</p>
          </div>
        ) : (
          <div className="relative space-y-0">
            {activities.map((a, i) => {
              const meta = ACTION_META[a.action] ?? { label: a.action, icon: History };
              const Icon = meta.icon;
              const isLast = i === activities.length - 1;

              return (
                <div key={a.id} className="flex gap-4 pb-6 relative">
                  {!isLast && <div className="absolute left-[15px] top-8 bottom-0 w-px bg-slate-200" />}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white">
                    <Icon className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-slate-900">{a.user?.full_name || a.user?.email || 'Unknown'}</span>
                      <span className="text-xs text-slate-400">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {a.action === 'bug_created' && 'created this issue'}
                      {a.action === 'status_change' && `changed status from ${a.old_value ?? '?'} to ${a.new_value ?? '?'}`}
                      {a.action === 'comment_added' && 'added a comment'}
                      {!['bug_created', 'status_change', 'comment_added'].includes(a.action) && a.action}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
