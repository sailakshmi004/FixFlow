import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { ProfileRow } from '@/types/database.types';
import { DEFAULT_ROLE, type Role } from '@/constants/roles';

export async function getBrowserUser() {
  const supabase = createSupabaseBrowserClient();

  try {
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  } catch {
    return null;
  }
}

export async function getBrowserProfile(): Promise<ProfileRow | null> {
  const supabase = createSupabaseBrowserClient();
  const user = await getBrowserUser();

  if (!user) {
    return null;
  }

  try {
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
  } catch {
    return null;
  }
}
