import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getBrowserProfile } from '@/features/auth/services/browser-session';

export type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string | null;
  link: string | null;
  is_read: boolean | null;
  created_at: string | null;
};

export async function getNotifications(): Promise<NotificationRow[]> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []) as NotificationRow[];
}

export async function getUnreadCount(): Promise<number> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('is_read', false);

  if (error) return 0;
  return count ?? 0;
}

export async function markAsRead(notificationId: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  await supabase.from('notifications').update({ is_read: true } as never).eq('id', notificationId);
}

export async function markAllAsRead(): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) return;
  await supabase.from('notifications').update({ is_read: true } as never).eq('user_id', profile.id).eq('is_read', false);
}

export async function deleteNotification(notificationId: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  await supabase.from('notifications').delete().eq('id', notificationId);
}

export async function clearAll(): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) return;
  await supabase.from('notifications').delete().eq('user_id', profile.id);
}

export async function createNotification(userId: string, title: string, message: string, type?: string, link?: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message,
    type: type ?? null,
    link: link ?? null,
    is_read: false,
  } as never);
}
