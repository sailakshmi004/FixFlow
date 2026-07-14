import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getBrowserProfile } from '@/features/auth/services/browser-session';
import type { ClientRow } from '@/types/database.types';
import type { ClientFormValues } from '@/features/clients/types/client.types';

export async function getFreelancerClients(): Promise<ClientRow[]> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();

  if (!profile) {
    return [];
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('freelancer_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createClient(values: ClientFormValues) {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();

  if (!profile) {
    throw new Error('Unable to resolve the current freelancer profile.');
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      freelancer_id: profile.id,
      name: values.name,
      email: values.email,
      phone: values.phone || null,
      company_name: values.companyName || null,
      notes: values.notes || null,
      status: values.status
    } as never)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function archiveClient(clientId: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('clients')
    .update({ status: 'archived' } as never)
    .eq('id', clientId);

  if (error) {
    throw error;
  }
}

export async function updateClient(clientId: string, values: Partial<ClientFormValues>) {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase
    .from('clients')
    .update({
      name: values.name,
      email: values.email,
      phone: values.phone || null,
      company_name: values.companyName || null,
      notes: values.notes || null,
      status: values.status
    } as never)
    .eq('id', clientId);

  if (error) {
    throw error;
  }
}
