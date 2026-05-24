import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ROUTES, getDashboardRoute } from '@/constants/routes';
import { DEFAULT_ROLE, type Role } from '@/constants/roles';
import type { ProfileRow } from '@/types/database.types';

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (profile) {
    return profile;
  }

  const role = (user.user_metadata?.role as Role | undefined) ?? DEFAULT_ROLE;
  const fullName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'FixFlow User';

  const { data: createdProfile } = await supabase
    .from('profiles')
    .insert({
      auth_user_id: user.id,
      full_name: fullName,
      email: user.email ?? '',
      role,
      is_active: true
    } as never)
    .select('*')
    .single();

  return createdProfile ?? null;
}

export async function requireProfile() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(ROUTES.login);
  }

  return profile;
}

export async function requireRole(expectedRole: Role) {
  const profile = await requireProfile();

  if (profile.role !== expectedRole) {
    redirect(getDashboardRoute(profile.role));
  }

  return profile;
}
