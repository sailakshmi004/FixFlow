import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function FreelancerRootPage() {
  redirect(ROUTES.freelancer.dashboard);
}

