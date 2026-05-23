import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function ClientRootPage() {
  redirect(ROUTES.client.dashboard);
}

