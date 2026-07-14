import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getBrowserProfile } from '@/features/auth/services/browser-session';
import type { ClientRow, ProjectRow, BugRow } from '@/types/database.types';

export type ClientDetail = ClientRow & {
  projects: (ProjectRow & { bug_count: number })[];
  bugs: (BugRow & { project: { name: string } | null })[];
};

export async function getClientDetail(clientId: string): Promise<ClientDetail | null> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) return null;

  const { data: client } = await supabase.from('clients').select('*').eq('id', clientId).eq('freelancer_id', profile.id).single();
  if (!client) return null;

  const [projectsRes, bugsRes] = await Promise.all([
    supabase.from('projects').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
    supabase.from('bugs').select('*, project:projects(name)').in('project_id',
      (await supabase.from('projects').select('id').eq('client_id', clientId)).data?.map((p: { id: string }) => p.id) ?? []
    ).order('created_at', { ascending: false }),
  ]);

  const projects = ((projectsRes.data ?? []) as ProjectRow[]).map((p) => ({
    ...p,
    bug_count: (bugsRes.data ?? []).filter((b: BugRow) => b.project_id === p.id).length,
  }));

  return {
    ...(client as ClientRow),
    projects,
    bugs: (bugsRes.data ?? []) as (BugRow & { project: { name: string } | null })[],
  } as ClientDetail;
}
