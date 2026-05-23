import { ShieldCheck, TimerReset } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  ['Total clients', '0'],
  ['Total projects', '0'],
  ['Open bugs', '0'],
  ['Urgent bugs', '0']
];

export default function FreelancerDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="muted" className="w-fit bg-white/80 text-slate-600">
            Freelancer workspace
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Freelancer Dashboard</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Track clients, projects, and bug resolution from one clean workspace. Phase 1 gives you the shell, Phase 2 and 3 will bring the workflow to life.
          </p>
        </div>
        <Card className="border-white/70 bg-white/80">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-950">Protected workspace</p>
              <p className="text-xs text-slate-500">Role-aware and ready for CRUD modules</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <Card key={label} className="border-white/70 bg-white/85">
            <CardHeader className="pb-2">
              <CardDescription>{label}</CardDescription>
              <CardTitle className="text-3xl tracking-tight">{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <CardTitle>Next step</CardTitle>
            <CardDescription>Client and project management will be added in Phase 2.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>This shell is already protected, role-aware, and ready for the workflow modules.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Recent bugs', 'Pending reviews', 'Upcoming deadlines', 'Invoices due'].map((label) => (
                <div key={label} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">Coming in a later phase</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-slate-950 text-white">
          <CardHeader>
            <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950">
              <TimerReset className="h-5 w-5" />
            </div>
            <CardTitle className="text-white">Workflow focus</CardTitle>
            <CardDescription className="text-slate-300">Everything centers on a simple bug lifecycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {['Report issue', 'Fix issue', 'Send for review', 'Approve or reopen'].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-950">
                  {index + 1}
                </div>
                <p className="text-sm text-slate-100">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
