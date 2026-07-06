'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { archiveClient, createClient, getFreelancerClients } from '@/features/clients/services/client-service';
import type { ClientRow } from '@/types/database.types';

const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required.'),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived'])
});

type ClientFormInput = z.infer<typeof clientSchema>;

function getStatusTone(status: ClientRow['status']) {
  if (status === 'archived') return 'secondary';
  if (status === 'inactive') return 'outline';
  return 'default';
}

export function ClientManagementBoard() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const form = useForm<ClientFormInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      companyName: '',
      notes: '',
      status: 'active'
    }
  });

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFreelancerClients();
      setClients(data);
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to load clients.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const activeCount = useMemo(() => clients.filter((client) => client.status === 'active').length, [clients]);

  const onSubmit = form.handleSubmit(async (values) => {
    setActionMessage(null);
    try {
      await createClient(values);
      form.reset();
      await loadClients();
      setActionMessage('Client created successfully.');
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to create client.');
    }
  });

  const onArchive = async (clientId: string) => {
    setActionMessage(null);
    try {
      await archiveClient(clientId);
      await loadClients();
      setActionMessage('Client archived.');
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to archive client.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/70 bg-white/85">
          <CardHeader className="pb-3">
            <CardDescription>Total clients</CardDescription>
            <CardTitle className="text-3xl">{clients.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-white/70 bg-white/85">
          <CardHeader className="pb-3">
            <CardDescription>Active clients</CardDescription>
            <CardTitle className="text-3xl">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-white/70 bg-white/85">
          <CardHeader className="pb-3">
            <CardDescription>Archived clients</CardDescription>
            <CardTitle className="text-3xl">{clients.filter((client) => client.status === 'archived').length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <CardTitle>Client list</CardTitle>
            <CardDescription>Manage the people and companies you work with.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? <p className="text-sm text-slate-500">Loading clients...</p> : null}
            {!loading && clients.length === 0 ? <p className="text-sm text-slate-500">No clients yet. Add your first client on the right.</p> : null}
            {clients.map((client) => (
              <div key={client.id} className="rounded-3xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{client.name}</p>
                      <Badge variant={getStatusTone(client.status)}>{client.status ?? 'active'}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{client.email}</p>
                    <p className="text-sm text-slate-500">
                      {client.company_name || 'No company name'} {client.phone ? `· ${client.phone}` : ''}
                    </p>
                    {client.notes ? <p className="text-sm text-slate-600">{client.notes}</p> : null}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => void onArchive(client.id)} disabled={(client.status ?? 'active') === 'archived'}>
                    Archive
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <CardTitle>Add client</CardTitle>
            <CardDescription>Create and organize a new client workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Client name</Label>
                <Input id="name" placeholder="Acme Studio" {...form.register('name')} />
                {form.formState.errors.name ? <p className="text-sm text-red-600">{form.formState.errors.name.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="client@example.com" {...form.register('email')} />
                {form.formState.errors.email ? <p className="text-sm text-red-600">{form.formState.errors.email.message}</p> : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+91 98765 43210" {...form.register('phone')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company</Label>
                  <Input id="companyName" placeholder="Acme Pvt Ltd" {...form.register('companyName')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" placeholder="Important context for this client" {...form.register('notes')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" {...form.register('status')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
              {actionMessage ? <p className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{actionMessage}</p> : null}
              <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating client...' : 'Create client'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
