import { requireRole } from '@/features/auth/services/session';
import { LiveTimer } from '@/features/time-tracking/components/live-timer';
import { TimerStats } from '@/features/time-tracking/components/timer-stats';

export const dynamic = 'force-dynamic';

export default async function TimeTrackingPage() {
  await requireRole('freelancer');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-950">Time Tracking</h1>
        <p className="mt-1 text-sm text-slate-500">Track time spent on your projects.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LiveTimer />
        </div>
        <div>
          <TimerStats />
        </div>
      </div>
    </div>
  );
}
