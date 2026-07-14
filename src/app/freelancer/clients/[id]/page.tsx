import { ClientDetailView } from '@/features/clients/components/client-detail-view';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function FreelancerClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ClientDetailView clientId={id} />;
}

