import type { ClientRow } from '@/types/database.types';

export type ClientFormValues = {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  notes?: string;
  status: NonNullable<ClientRow['status']>;
};
