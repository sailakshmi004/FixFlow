import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Workflow, Sparkles, MessageSquareMore, BadgeCheck, Layers3 } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const highlights = [
  {
    icon: Workflow,
    title: 'One workflow',
    description: 'Clients report issues, freelancers resolve them, and approvals stay in one place.'
  },
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    description: 'Freelancer, client, and admin views keep the experience simple and secure.'
  },
  {
    icon: CheckCircle2,
    title: 'Approval flow',
    description: 'Move from bug reported to fixed, reviewed, approved, and closed without chaos.'
  }
];

const workflow = [
  'Freelancer creates client',
  'Freelancer creates project',
  'Client reports bug',
  'Freelancer fixes bug',
  'Client approves or reopens',
  'Invoice is tracked'
];

const metrics = [
  ['Client-friendly', 'Simple labels and clear actions'],
  ['Approval-first', 'Fixes go through client review'],
  ['All-in-one', 'Bugs, comments, and invoices together']
];

export default function PublicHomePage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="border-slate-200 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-500">
              BugNest
            </Badge>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
              <Sparkles className="h-3.5 w-3.5" />
              Built for freelancers and clients
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Client-friendly bug tracking for freelance developers.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Keep client communication, bug reports, approvals, comments, and invoices in one calm workspace instead of scattered chats and spreadsheets.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={ROUTES.register} className={cn(buttonVariants({ size: 'lg' }), 'inline-flex items-center gap-2')}>
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={ROUTES.login} className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              Log in
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {metrics.map(([title, description]) => (
              <Card key={title} className="border-white/70 bg-white/70">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm">{title}</CardTitle>
                  <CardDescription className="text-sm">{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden border-white/70 bg-white/85">
          <CardHeader className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.7),_rgba(248,250,252,0.9))]" />
            <div className="relative">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white">
                <Layers3 className="h-3.5 w-3.5" />
                Workflow preview
              </div>
              <CardTitle>BugNest workflow</CardTitle>
              <CardDescription>Phase 1 foundation is ready for authentication and role-based workspace routing.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {workflow.map((step, index) => (
              <div key={step} className="flex items-center gap-4 rounded-3xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-soft">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{step}</p>
                  <p className="text-xs text-slate-500">Simple, client-friendly progress flow</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border-white/70 bg-white/80">
              <CardHeader>
                <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-soft">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/70 bg-white/80">
          <CardHeader>
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <MessageSquareMore className="h-5 w-5" />
            </div>
            <CardTitle>Made for client communication</CardTitle>
            <CardDescription>
              BugNest keeps the language simple so clients can report issues, review progress, and approve fixes without developer jargon.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-white/70 bg-slate-950 text-white">
          <CardHeader>
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-white">Everything in one flow</CardTitle>
            <CardDescription className="text-slate-300">
              Bugs, comments, attachments, approvals, and invoices live together so nothing gets lost between WhatsApp, email, and spreadsheets.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
