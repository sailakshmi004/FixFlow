import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { ProfileRow } from '@/types/database.types';
import type { AuthFormValues, RegisterFormValues } from '@/features/auth/types/auth.types';
import { getDashboardRoute } from '@/constants/routes';
import type { Role } from '@/constants/roles';

function mapProfile(profile: ProfileRow | null, fallbackEmail: string, fallbackRole: Role): ProfileRow {
  return (
    profile ?? {
      id: '',
      auth_user_id: null,
      full_name: '',
      email: fallbackEmail,
      phone: null,
      role: fallbackRole,
      avatar_url: null,
      is_active: true,
      created_at: null,
      updated_at: null
    }
  );
}

export async function registerUser(values: RegisterFormValues) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
        role: values.role
      }
    }
  });

  if (error) {
    throw error;
  }

  if (data.user) {
    const { data: existingProfile, error: lookupError } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', data.user.id)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (!existingProfile) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          auth_user_id: data.user.id,
          full_name: values.fullName,
          email: values.email,
          role: values.role,
          is_active: true
        } as never
      ]);

      if (profileError) {
        throw profileError;
      }
    }
  }

  return {
    user: data.user,
    profile: mapProfile(null, values.email, values.role),
    redirectTo: getDashboardRoute(values.role),
    requiresEmailConfirmation: !data.session
  };
}

export async function loginUser(values: AuthFormValues) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password
  });

  if (error) {
    throw error;
  }

  const user = data.user;

  if (!user) {
    throw new Error('Unable to sign in.');
  }

  const role = (user.user_metadata?.role ?? 'freelancer') as Role;

  return {
    user,
    profile: mapProfile(null, user.email ?? values.email, role),
    redirectTo: getDashboardRoute(role)
  };
}

export async function logoutUser() {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function syncProfileFromAuthUser() {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (profile) {
    return profile;
  }

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'BugNest User';
  const role = (user.user_metadata?.role as Role | undefined) ?? 'freelancer';

  const { data: createdProfile, error: createError } = await supabase
    .from('profiles')
    .insert([
      {
        auth_user_id: user.id,
        full_name: fullName,
        email: user.email ?? '',
        role,
        is_active: true
      } as never
    ])
    .select('*')
    .single();

  if (createError) {
    throw createError;
  }

  return createdProfile;
}
