import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getBrowserProfile, getBrowserUser } from '@/features/auth/services/browser-session';
import type { ClientRow, ProjectRow } from '@/types/database.types';
import type { ProjectFormValues } from '@/features/projects/types/project.types';

export type ProjectWithClient = ProjectRow & {
  client?: Pick<ClientRow, 'id' | 'name' | 'email' | 'company_name' | 'status'> | null;
};

export async function getFreelancerProjects(): Promise<ProjectWithClient[]> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();

  if (!profile) {
    return [];
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*, client:clients(id, name, email, company_name, status)')
    .eq('freelancer_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ProjectWithClient[];
}

export async function getClientProjects(): Promise<ProjectWithClient[]> {
  const supabase = createSupabaseBrowserClient();
  const user = await getBrowserUser();

  if (!user) {
    return [];
  }

  const { data: matchingClients } = await supabase
    .from('clients')
    .select('id, name, email, company_name, status')
    .eq('email', user.email ?? '');

  const clientIds = ((matchingClients ?? []) as Pick<ClientRow, 'id'>[]).map((client) => client.id);

  if (clientIds.length === 0) {
    return [];
  }

  const { data } = await supabase
    .from('projects')
    .select('*, client:clients(id, name, email, company_name, status)')
    .in('client_id', clientIds)
    .order('created_at', { ascending: false });

  return (data ?? []) as ProjectWithClient[];
}

export async function createProject(values: ProjectFormValues) {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();

  if (!profile) {
    throw new Error('Unable to resolve the current freelancer profile.');
  }

  const budget = values.budget ? Number(values.budget) : null;

  const { data, error } = await supabase
    .from('projects')
    .insert({
      freelancer_id: profile.id,
      client_id: values.clientId,
      name: values.name,
      description: values.description || null,
      tech_stack: values.techStack || null,
      project_url: values.projectUrl || null,
      github_url: values.githubUrl || null,
      status: values.status,
      start_date: values.startDate || null,
      deadline: values.deadline || null,
      budget: Number.isFinite(budget) ? budget : null
    } as never)
    .select('*, client:clients(id, name, email, company_name, status)')
    .single();

  if (error) {
    throw error;
  }

  return data as ProjectWithClient;
}

export async function archiveProject(projectId: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('projects')
    .update({ status: 'cancelled' } as never)
    .eq('id', projectId);

  if (error) {
    throw error;
  }
}
