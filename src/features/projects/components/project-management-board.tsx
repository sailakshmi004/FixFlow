'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { createProject, archiveProject, getFreelancerProjects, type ProjectWithClient } from '@/features/projects/services/project-service';
import { getFreelancerClients } from '@/features/clients/services/client-service';
import type { ClientRow } from '@/types/database.types';

const projectSchema = z.object({
  clientId: z.string().min(1, 'Select a client.'),
  name: z.string().min(1, 'Project name is required.'),
  description: z.string().optional(),
  techStack: z.string().optional(),
  projectUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  status: z.enum(['planning', 'active', 'testing', 'completed', 'on_hold', 'cancelled']),
  startDate: z.string().optional(),
  deadline: z.string().optional(),
  budget: z.string().optional()
});

type ProjectFormInput = z.infer<typeof projectSchema>;

function getProjectTone(status: ProjectWithClient['status']) {
  if (status === 'completed') return 'secondary';
  if (status === 'on_hold' || status === 'cancelled') return 'outline';
  return 'default';
}

export function ProjectManagementBoard() {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const form = useForm<ProjectFormInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      clientId: '',
      name: '',
      description: '',
      techStack: '',
      projectUrl: '',
      githubUrl: '',
      status: 'active',
      startDate: '',
      deadline: '',
      budget: ''
    }
  });

  const loadProjectsAndClients = useCallback(async () => {
    setLoading(true);
    try {
      const [projectData, clientData] = await Promise.all([getFreelancerProjects(), getFreelancerClients()]);
      setProjects(projectData);
      setClients(clientData);
      if (!form.getValues('clientId') && clientData[0]) {
        form.setValue('clientId', clientData[0].id);
      }
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to load projects.');
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    void loadProjectsAndClients();
  }, [loadProjectsAndClients]);

  const activeCount = useMemo(() => projects.filter((project) => project.status === 'active').length, [projects]);

  const onSubmit = form.handleSubmit(async (values) => {
    setActionMessage(null);
    try {
      await createProject(values);
      form.reset({
        clientId: values.clientId,
        name: '',
        description: '',
        techStack: '',
        projectUrl: '',
        githubUrl: '',
        status: 'active',
        startDate: '',
        deadline: '',
        budget: ''
      });
      await loadProjectsAndClients();
      setActionMessage('Project created successfully.');
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to create project.');
    }
  });

  const onArchive = async (projectId: string) => {
    setActionMessage(null);
    try {
      await archiveProject(projectId);
      await loadProjectsAndClients();
      setActionMessage('Project archived.');
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to archive project.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/70 bg-white/85">
          <CardHeader className="pb-3">
            <CardDescription>Total projects</CardDescription>
            <CardTitle className="text-3xl">{projects.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-white/70 bg-white/85">
          <CardHeader className="pb-3">
            <CardDescription>Active projects</CardDescription>
            <CardTitle className="text-3xl">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-white/70 bg-white/85">
          <CardHeader className="pb-3">
            <CardDescription>Linked clients</CardDescription>
            <CardTitle className="text-3xl">{clients.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <CardTitle>Project list</CardTitle>
            <CardDescription>Track the work tied to each client workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? <p className="text-sm text-slate-500">Loading projects...</p> : null}
            {!loading && projects.length === 0 ? <p className="text-sm text-slate-500">No projects yet. Create your first project on the right.</p> : null}
            {projects.map((project) => (
              <div key={project.id} className="rounded-3xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{project.name}</p>
                      <Badge variant={getProjectTone(project.status)}>{project.status ?? 'active'}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {project.client?.name || 'Unassigned client'} {project.client?.company_name ? `· ${project.client.company_name}` : ''}
                    </p>
                    {project.description ? <p className="text-sm text-slate-600">{project.description}</p> : null}
                    <p className="text-sm text-slate-500">
                      {project.deadline ? `Deadline: ${project.deadline}` : 'No deadline set'}
                      {project.budget ? ` · Budget: ${project.budget}` : ''}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => void onArchive(project.id)} disabled={(project.status ?? 'active') === 'cancelled'}>
                    Archive
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <CardTitle>Add project</CardTitle>
            <CardDescription>Create and assign a project to a client.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="clientId">Client</Label>
                <Select id="clientId" {...form.register('clientId')}>
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </Select>
                {form.formState.errors.clientId ? <p className="text-sm text-red-600">{form.formState.errors.clientId.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Project name</Label>
                <Input id="name" placeholder="Website Redesign" {...form.register('name')} />
                {form.formState.errors.name ? <p className="text-sm text-red-600">{form.formState.errors.name.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Short project overview" {...form.register('description')} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="techStack">Tech stack</Label>
                  <Input id="techStack" placeholder="Next.js, Supabase" {...form.register('techStack')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select id="status" {...form.register('status')}>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="testing">Testing</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On hold</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="projectUrl">Project URL</Label>
                  <Input id="projectUrl" placeholder="https://..." {...form.register('projectUrl')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input id="githubUrl" placeholder="https://github.com/..." {...form.register('githubUrl')} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start date</Label>
                  <Input id="startDate" type="date" {...form.register('startDate')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input id="deadline" type="date" {...form.register('deadline')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input id="budget" type="number" min="0" step="0.01" placeholder="25000" {...form.register('budget')} />
              </div>
              {actionMessage ? <p className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{actionMessage}</p> : null}
              <Button className="w-full" type="submit" disabled={form.formState.isSubmitting || clients.length === 0}>
                {form.formState.isSubmitting ? 'Creating project...' : 'Create project'}
              </Button>
              {clients.length === 0 ? <p className="text-sm text-slate-500">Create a client first before adding projects.</p> : null}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
