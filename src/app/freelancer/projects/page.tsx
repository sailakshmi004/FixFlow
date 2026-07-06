import { ProjectManagementBoard } from '@/features/projects/components/project-management-board';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FreelancerProjectsPage() {
  return (
    <div className="space-y-6">
      <Card className="border-white/70 bg-white/85">
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Assign work to clients and keep delivery context in one place.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          This view now supports basic project creation and archive actions.
        </CardContent>
      </Card>
      <ProjectManagementBoard />
    </div>
  );
}
