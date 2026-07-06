import { ClientProjectsBoard } from '@/features/projects/components/client-projects-board';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientProjectsPage() {
  return (
    <div className="space-y-6">
      <Card className="border-white/70 bg-white/85">
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>See the work assigned to you by your freelancer.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          This is the first client-facing Phase 2 view for project visibility.
        </CardContent>
      </Card>
      <ClientProjectsBoard />
    </div>
  );
}
