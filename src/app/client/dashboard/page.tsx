import { FolderKanban, MessageCircle, SquarePen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  ['My projects', '0'],
  ['Open bugs', '0'],
  ['Waiting for review', '0'],
  ['Pending invoices', '0']
];

export default function ClientDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="muted" className="w-fit bg-white/80 text-slate-600">
            Client portal
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Client Dashboard</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            A simple portal for reporting issues, following progress, and approving fixes without technical clutter.
          </p>
        </div>
        <Card className="border-white/70 bg-white/80">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-950">Friendly language</p>
              <p className="text-xs text-slate-500">Use simple actions like Report Issue and Approve Fix</p>
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
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <SquarePen className="h-5 w-5" />
            </div>
            <CardTitle>Report issues clearly</CardTitle>
            <CardDescription>Clients will be able to share screenshots, videos, and plain-language details.</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-white/70 bg-slate-950 text-white">
          <CardHeader>
            <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950">
              <FolderKanban className="h-5 w-5" />
            </div>
            <CardTitle className="text-white">Keep progress visible</CardTitle>
            <CardDescription className="text-slate-300">Clients can follow the status of every bug and review the latest updates.</CardDescription>
          </CardHeader>
        </Card>
      </div>
      <Card className="border-white/70 bg-white/85">
        <CardHeader>
          <CardTitle>Client portal</CardTitle>
          <CardDescription>Bug reporting and review flows come in the next phase.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          The client UI stays focused on the essentials, with labels like Report Issue, View Progress, Approve Fix, and Request Changes.
        </CardContent>
      </Card>
    </div>
  );
}
