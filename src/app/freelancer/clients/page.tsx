import { ClientManagementBoard } from '@/features/clients/components/client-management-board';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FreelancerClientsPage() {
  return (
    <div className="space-y-6">
      <Card className="border-white/70 bg-white/85">
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>Manage client workspaces, contact details, and status.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Phase 2 starts here with real client records instead of placeholder content.
        </CardContent>
      </Card>
      <ClientManagementBoard />
    </div>
  );
}
