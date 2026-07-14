'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getClientProjects, type ProjectWithClient } from '@/features/projects/services/project-service';

function getProjectTone(status: ProjectWithClient['status']) {
  if (status === 'completed') return 'secondary';
  if (status === 'on_hold' || status === 'cancelled') return 'outline';
  return 'default';
}

export function ClientProjectsBoard() {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const data = await getClientProjects();
        setProjects(data);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load projects.');
      } finally {
        setLoading(false);
      }
    }

    void loadProjects();
  }, []);

  return (
    <Card className="border-white/70 bg-white/85">
      <CardHeader>
        <CardTitle>My projects</CardTitle>
        <CardDescription>Projects assigned to your workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? <p className="text-sm text-slate-500">Loading projects...</p> : null}
        {errorMessage ? <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}
        {!loading && projects.length === 0 && !errorMessage ? <p className="text-sm text-slate-500">No assigned projects yet.</p> : null}
        {projects.map((project) => (
          <div key={project.id} className="rounded-3xl border border-slate-200/70 bg-slate-50 px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/client/projects/${project.id}`} className="font-semibold text-slate-950 hover:text-slate-600">
                    {project.name}
                  </Link>
                  <Badge variant={getProjectTone(project.status)}>{project.status ?? 'active'}</Badge>
                </div>
                <p className="text-sm text-slate-600">{project.description || 'No description added yet.'}</p>
                <p className="text-sm text-slate-500">
                  {project.client?.name || 'Assigned client'} {project.deadline ? `· Deadline: ${project.deadline}` : ''}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
