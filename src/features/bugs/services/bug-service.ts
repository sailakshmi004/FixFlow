import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getBrowserProfile, getBrowserUser } from '@/features/auth/services/browser-session';
import { createNotification } from '@/features/notifications/services/notification-service';
import type { BugFormValues, BugWithRelations, BugCommentRow, BugAttachmentRow, BugActivityRow } from '@/features/bugs/types/bug.types';
import type { BugStatus } from '@/constants/statuses';

async function logActivity(bugId: string, action: string, oldValue?: unknown, newValue?: unknown) {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) return;
  await supabase.from('bug_activity_logs').insert({
    bug_id: bugId,
    user_id: profile.id,
    action,
    old_value: oldValue ?? null,
    new_value: newValue ?? null,
  } as never);
}

export async function getBugActivity(bugId: string): Promise<BugActivityRow[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('bug_activity_logs')
    .select('*, user:profiles(id, full_name, email)')
    .eq('bug_id', bugId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as BugActivityRow[];
}

export async function getFreelancerBugs(): Promise<BugWithRelations[]> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();

  if (!profile) return [];

  const { data: projectIds } = await supabase.from('projects').select('id').eq('freelancer_id', profile.id);
  if (!projectIds || projectIds.length === 0) return [];

  const ids = (projectIds as { id: string }[]).map((p) => p.id);

  const { data, error } = await supabase
    .from('bugs')
    .select('*, project:projects(id, name, freelancer_id), reporter:profiles!bugs_reported_by_fkey(id, full_name, email), assignee:profiles!bugs_assigned_to_fkey(id, full_name, email)')
    .in('project_id', ids)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as BugWithRelations[];
}

export async function getClientBugs(): Promise<BugWithRelations[]> {
  const supabase = createSupabaseBrowserClient();
  const user = await getBrowserUser();
  if (!user) return [];

  const { data: matchingClients } = await supabase.from('clients').select('id').eq('email', user.email ?? '');
  const clientIds = ((matchingClients ?? []) as { id: string }[]).map((c) => c.id);
  if (clientIds.length === 0) return [];

  const { data: projectIds } = await supabase.from('projects').select('id').in('client_id', clientIds);
  if (!projectIds || projectIds.length === 0) return [];

  const ids = (projectIds as { id: string }[]).map((p) => p.id);

  const { data, error } = await supabase
    .from('bugs')
    .select('*, project:projects(id, name, freelancer_id), reporter:profiles!bugs_reported_by_fkey(id, full_name, email), assignee:profiles!bugs_assigned_to_fkey(id, full_name, email)')
    .in('project_id', ids)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as BugWithRelations[];
}

export async function getBugById(bugId: string): Promise<BugWithRelations | null> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from('bugs')
    .select('*, project:projects(id, name, freelancer_id), reporter:profiles!bugs_reported_by_fkey(id, full_name, email), assignee:profiles!bugs_assigned_to_fkey(id, full_name, email)')
    .eq('id', bugId)
    .single();

  if (error) throw error;
  return data as BugWithRelations | null;
}

export async function getClientProjectsForBugs(): Promise<{ id: string; name: string }[]> {
  const supabase = createSupabaseBrowserClient();
  const user = await getBrowserUser();
  if (!user) return [];

  const { data: matchingClients } = await supabase.from('clients').select('id').eq('email', user.email ?? '');
  const clientIds = ((matchingClients ?? []) as { id: string }[]).map((c) => c.id);
  if (clientIds.length === 0) return [];

  const { data } = await supabase
    .from('projects')
    .select('id, name')
    .in('client_id', clientIds)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });

  return data ?? [];
}

export async function getFreelancerProjectsAndClients(): Promise<{ projects: { id: string; name: string }[]; clients: { id: string; name: string; email: string }[] }> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) return { projects: [], clients: [] };

  const [projectData, clientData] = await Promise.all([
    supabase.from('projects').select('id, name').eq('freelancer_id', profile.id).neq('status', 'cancelled').order('created_at', { ascending: false }),
    supabase.from('clients').select('id, name, email').eq('freelancer_id', profile.id).neq('status', 'archived').order('created_at', { ascending: false }),
  ]);

  return {
    projects: (projectData.data ?? []) as { id: string; name: string }[],
    clients: (clientData.data ?? []) as { id: string; name: string; email: string }[],
  };
}

export async function createBug(values: BugFormValues): Promise<BugWithRelations> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) throw new Error('Unable to resolve your profile.');

  let assigneeId: string | null = null;

  if (values.clientId) {
    const { data: clientRecord } = await supabase.from('clients').select('email').eq('id', values.clientId).single();
    const clientEmail = (clientRecord as { email: string } | null)?.email;
    if (clientEmail) {
      const { data: assigneeProfile } = await supabase.from('profiles').select('id').eq('email', clientEmail).maybeSingle();
      assigneeId = (assigneeProfile as { id: string } | null)?.id ?? null;
    }
  } else {
    const projectResult = await supabase.from('projects').select('freelancer_id').eq('id', values.projectId).single();
    const project = projectResult.data as { freelancer_id: string | null } | null;
    assigneeId = project?.freelancer_id ?? null;
  }

  const { data, error } = await supabase
    .from('bugs')
    .insert({
      project_id: values.projectId,
      reported_by: profile.id,
      assigned_to: assigneeId,
      title: values.title,
      description: values.description,
      type: values.type,
      priority: values.priority,
      severity: values.severity,
      status: 'open',
    } as never)
    .select('*, project:projects(id, name, freelancer_id), reporter:profiles!bugs_reported_by_fkey(id, full_name, email), assignee:profiles!bugs_assigned_to_fkey(id, full_name, email)')
    .single();

  if (error) throw error;

  const bug = data as BugWithRelations;
  await logActivity(bug.id, 'bug_created', null, { title: bug.title, type: bug.type, priority: bug.priority, severity: bug.severity });

  if (assigneeId && assigneeId !== profile.id) {
    await createNotification(assigneeId, 'New issue reported', `${bug.title} — ${bug.project?.name ?? 'Unknown project'}`, 'bug_created', `/freelancer/bugs/${bug.id}`);
  }

  return bug;
}

export async function updateBugStatus(bugId: string, status: BugStatus): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) throw new Error('Unable to resolve your profile.');

  const { data: bug } = await supabase
    .from('bugs')
    .select('title, status, reported_by, project:projects(name)')
    .eq('id', bugId)
    .single();
  const currentBug = bug as { title: string; status: string | null; reported_by: string | null; project: { name: string } | null } | null;

  const { error } = await supabase.from('bugs').update({ status } as never).eq('id', bugId);
  if (error) throw error;

  await logActivity(bugId, 'status_change', currentBug?.status, status);

  if (currentBug && currentBug.reported_by && currentBug.reported_by !== profile.id) {
    await createNotification(currentBug.reported_by, `Issue ${status.replace('_', ' ')}`, `${currentBug.title} — ${currentBug.project?.name ?? ''}`, 'status_change', `/client/bugs/${bugId}`);
  }
}

export async function getBugComments(bugId: string): Promise<BugCommentRow[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('bug_comments')
    .select('*, user:profiles(id, full_name, email)')
    .eq('bug_id', bugId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as BugCommentRow[];
}

export async function addComment(bugId: string, comment: string): Promise<BugCommentRow> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) throw new Error('Unable to resolve your profile.');

  const { data, error } = await supabase
    .from('bug_comments')
    .insert({ bug_id: bugId, user_id: profile.id, comment } as never)
    .select('*, user:profiles(id, full_name, email)')
    .single();

  if (error) throw error;

  await logActivity(bugId, 'comment_added', null, { comment: comment.substring(0, 100) });

  const { data: bug } = await supabase
    .from('bugs')
    .select('title, reported_by, assigned_to, project:projects(name)')
    .eq('id', bugId)
    .single();
  const currentBug = bug as { title: string; reported_by: string | null; assigned_to: string | null; project: { name: string } | null } | null;

  if (currentBug) {
    const targets = [currentBug.reported_by, currentBug.assigned_to].filter((id): id is string => id !== null && id !== profile.id);
    const uniqueTargets = [...new Set(targets)];
    await Promise.all(uniqueTargets.map((uid) =>
      createNotification(uid, 'New comment', `${profile.full_name || profile.email} commented on "${currentBug.title}"`, 'comment')
    ));
  }

  return data as BugCommentRow;
}

export async function getBugAttachments(bugId: string): Promise<BugAttachmentRow[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('bug_attachments')
    .select('*')
    .eq('bug_id', bugId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as BugAttachmentRow[];
}

export async function uploadAttachment(bugId: string, file: File): Promise<BugAttachmentRow> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) throw new Error('Unable to resolve your profile.');

  const fileExt = file.name.split('.').pop();
  const fileName = `${bugId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from('bug-attachments').upload(fileName, file);
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('bug-attachments').getPublicUrl(fileName);

  const { data, error } = await supabase
    .from('bug_attachments')
    .insert({
      bug_id: bugId,
      uploaded_by: profile.id,
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_type: file.type,
      file_size: file.size,
    } as never)
    .select('*')
    .single();

  if (error) {
    await supabase.storage.from('bug-attachments').remove([fileName]);
    throw error;
  }

  return data as BugAttachmentRow;
}
