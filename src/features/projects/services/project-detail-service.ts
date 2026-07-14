import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getBrowserProfile, getBrowserUser } from '@/features/auth/services/browser-session';
import type { ProjectRow, BugRow, ClientRow } from '@/types/database.types';

export type ProjectDetail = ProjectRow & {
  client: Pick<ClientRow, 'id' | 'name' | 'email' | 'company_name'> | null;
  bugs: (BugRow & { reporter: { full_name: string; email: string } | null })[];
};

export async function getFreelancerProjectDetail(projectId: string): Promise<ProjectDetail | null> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) return null;

  const { data: project } = await supabase
    .from('projects')
    .select('*, client:clients(id, name, email, company_name)')
    .eq('id', projectId)
    .eq('freelancer_id', profile.id)
    .single();

  if (!project) return null;

  const { data: bugs } = await supabase
    .from('bugs')
    .select('*, reporter:profiles!bugs_reported_by_fkey(full_name, email)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  return {
    ...(project as ProjectRow),
    client: (project as unknown as { client: Pick<ClientRow, 'id' | 'name' | 'email' | 'company_name'> | null }).client,
    bugs: (bugs ?? []) as (BugRow & { reporter: { full_name: string; email: string } | null })[],
  } as ProjectDetail;
}

export async function getClientProjectDetail(projectId: string): Promise<ProjectDetail | null> {
  const supabase = createSupabaseBrowserClient();
  const user = await getBrowserUser();
  if (!user) return null;

  const { data: matchingClients } = await supabase.from('clients').select('id').eq('email', user.email ?? '');
  const clientIds = ((matchingClients ?? []) as { id: string }[]).map((c) => c.id);
  if (clientIds.length === 0) return null;

  const { data: project } = await supabase
    .from('projects')
    .select('*, client:clients(id, name, email, company_name)')
    .eq('id', projectId)
    .in('client_id', clientIds)
    .single();

  if (!project) return null;

  const { data: bugs } = await supabase
    .from('bugs')
    .select('*, reporter:profiles!bugs_reported_by_fkey(full_name, email)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  return {
    ...(project as ProjectRow),
    client: (project as unknown as { client: Pick<ClientRow, 'id' | 'name' | 'email' | 'company_name'> | null }).client,
    bugs: (bugs ?? []) as (BugRow & { reporter: { full_name: string; email: string } | null })[],
  } as ProjectDetail;
}
