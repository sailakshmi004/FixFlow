'use client';

import { useCallback, useEffect, useState } from 'react';
import { Clock, TrendingUp, Calendar, Hourglass } from 'lucide-react';
import {
  getTimeTrackingStats,
  formatDuration,
  formatHours,
} from '@/features/time-tracking/services/time-tracking-service';
import type { TimeTrackingStats } from '@/features/time-tracking/types/time-tracking.types';
import { Loader2 } from 'lucide-react';

export function TimerStats() {
  const [stats, setStats] = useState<TimeTrackingStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTimeTrackingStats();
      setStats(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!stats) return null;

  const summaryCards = [
    {
      label: 'Today',
      value: formatDuration(stats.todaySeconds),
      hours: formatHours(stats.todaySeconds),
      icon: Clock,
      gradient: 'from-blue-500/10 to-blue-600/5',
      textColor: 'text-blue-700',
    },
    {
      label: 'This Week',
      value: formatDuration(stats.weekSeconds),
      hours: formatHours(stats.weekSeconds),
      icon: Calendar,
      gradient: 'from-violet-500/10 to-violet-600/5',
      textColor: 'text-violet-700',
    },
    {
      label: 'This Month',
      value: formatDuration(stats.monthSeconds),
      hours: formatHours(stats.monthSeconds),
      icon: TrendingUp,
      gradient: 'from-emerald-500/10 to-emerald-600/5',
      textColor: 'text-emerald-700',
    },
    {
      label: 'Total',
      value: formatDuration(stats.totalSeconds),
      hours: formatHours(stats.totalSeconds),
      icon: Hourglass,
      gradient: 'from-amber-500/10 to-amber-600/5',
      textColor: 'text-amber-700',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="border-b border-slate-200/70 px-5 py-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Clock className="h-4 w-4" />
            Time Summary
          </h3>
        </div>
        <div className="divide-y divide-slate-100 p-2">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`flex items-center justify-between rounded-xl bg-gradient-to-r ${card.gradient} px-4 py-3`}
            >
              <div className="flex items-center gap-3">
                <card.icon className={`h-4 w-4 ${card.textColor}`} />
                <div>
                  <p className="text-xs font-medium text-slate-600">{card.label}</p>
                  <p className={`text-xs ${card.textColor}`}>{card.hours} hrs</p>
                </div>
              </div>
              <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                {card.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {stats.activeEntry && (
        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <p className="text-sm font-medium text-emerald-900">Timer Active</p>
          </div>
          <p className="mt-1 text-xs text-emerald-700">
            {stats.activeEntry.project?.name || 'Unknown project'}
          </p>
        </div>
      )}

      {stats.recentEntries.length > 0 && (
        <div className="rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-xl">
          <div className="border-b border-slate-200/70 px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Clock className="h-4 w-4" />
              Recent Activity
            </h3>
          </div>
          <div className="p-3">
            <div className="space-y-1">
              {stats.recentEntries.slice(0, 5).map((entry) => {
                const entryDuration = entry.is_running
                  ? Math.floor((Date.now() - new Date(entry.start_time).getTime()) / 1000)
                  : entry.duration_seconds ?? 0;

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-xl px-3 py-2 transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-slate-900">
                        {entry.project?.name || 'Unknown'}
                      </p>
                      {entry.description && (
                        <p className="truncate text-xs text-slate-500">{entry.description}</p>
                      )}
                    </div>
                    <span className="ml-2 whitespace-nowrap font-mono text-xs text-slate-600 tabular-nums">
                      {formatDuration(entryDuration)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}