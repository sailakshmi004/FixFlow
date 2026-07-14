import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getBrowserProfile, getBrowserUser } from '@/features/auth/services/browser-session';

export type FreelancerDashboardStats = {
  totalClients: number;
  totalProjects: number;
  openBugs: number;
  urgentBugs: number;
  inProgressBugs: number;
  clientReviewBugs: number;
  closedBugs: number;
  recentBugs: { id: string; title: string; status: string; project_name: string; created_at: string }[];
  upcomingDeadlines: { id: string; name: string; deadline: string; client_name: string }[];
};

export type ClientDashboardStats = {
  totalProjects: number;
  openBugs: number;
  completedBugs: number;
  inProgressBugs: number;
  recentBugs: { id: string; title: string; status: string; project_name: string; created_at: string }[];
};

export async function getFreelancerDashboardStats(): Promise<FreelancerDashboardStats> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) return { totalClients: 0, totalProjects: 0, openBugs: 0, urgentBugs: 0, inProgressBugs: 0, clientReviewBugs: 0, closedBugs: 0, recentBugs: [], upcomingDeadlines: [] };

  const [clientsRes, projectsRes, bugsRes, deadlinesRes] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('freelancer_id', profile.id),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('freelancer_id', profile.id),
    supabase.from('bugs').select('id, title, status, priority, project:projects(name), created_at').in('project_id',
      (await supabase.from('projects').select('id').eq('freelancer_id', profile.id)).data?.map((p: { id: string }) => p.id) ?? []
    ).order('created_at', { ascending: false }),
    supabase.from('projects').select('id, name, deadline, client:clients(name)').eq('freelancer_id', profile.id).not('deadline', 'is', null).gte('deadline', new Date().toISOString().split('T')[0]).order('deadline', { ascending: true }).limit(5),
  ]);

  const bugs = (bugsRes.data ?? []) as { id: string; title: string; status: string; priority: string | null; project: { name: string } | null; created_at: string }[];
  const deadlines = (deadlinesRes.data ?? []) as { id: string; name: string; deadline: string; client: { name: string } | null }[];

  return {
    totalClients: clientsRes.count ?? 0,
    totalProjects: projectsRes.count ?? 0,
    openBugs: bugs.filter((b) => b.status === 'new' || b.status === 'accepted').length,
    urgentBugs: bugs.filter((b) => b.priority === 'urgent' && b.status !== 'closed' && b.status !== 'rejected').length,
    inProgressBugs: bugs.filter((b) => b.status === 'in_progress').length,
    clientReviewBugs: bugs.filter((b) => b.status === 'client_review').length,
    closedBugs: bugs.filter((b) => b.status === 'closed').length,
    recentBugs: bugs.slice(0, 5).map((b) => ({ id: b.id, title: b.title, status: b.status, project_name: b.project?.name ?? '', created_at: b.created_at })),
    upcomingDeadlines: deadlines.map((d) => ({ id: d.id, name: d.name, deadline: d.deadline, client_name: d.client?.name ?? '' })),
  };
}

export async function getClientDashboardStats(): Promise<ClientDashboardStats> {
  const supabase = createSupabaseBrowserClient();
  const user = await getBrowserUser();
  if (!user) return { totalProjects: 0, openBugs: 0, completedBugs: 0, inProgressBugs: 0, recentBugs: [] };

  const { data: matchingClients } = await supabase.from('clients').select('id').eq('email', user.email ?? '');
  const clientIds = ((matchingClients ?? []) as { id: string }[]).map((c) => c.id);
  if (clientIds.length === 0) return { totalProjects: 0, openBugs: 0, completedBugs: 0, inProgressBugs: 0, recentBugs: [] };

  const [projectsRes, bugsRes] = await Promise.all([
    supabase.from('projects').select('id', { count: 'exact', head: true }).in('client_id', clientIds),
    supabase.from('bugs').select('id, title, status, project:projects(name), created_at').in('project_id',
      (await supabase.from('projects').select('id').in('client_id', clientIds)).data?.map((p: { id: string }) => p.id) ?? []
    ).order('created_at', { ascending: false }),
  ]);

  const bugs = (bugsRes.data ?? []) as { id: string; title: string; status: string; project: { name: string } | null; created_at: string }[];

  return {
    totalProjects: projectsRes.count ?? 0,
    openBugs: bugs.filter((b) => b.status === 'new' || b.status === 'accepted').length,
    completedBugs: bugs.filter((b) => b.status === 'closed').length,
    inProgressBugs: bugs.filter((b) => b.status === 'in_progress').length,
    recentBugs: bugs.slice(0, 5).map((b) => ({ id: b.id, title: b.title, status: b.status, project_name: b.project?.name ?? '', created_at: b.created_at })),
  };
}