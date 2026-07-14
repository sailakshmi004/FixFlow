import { ClientProjectDetailView } from '@/features/projects/components/client-project-detail-view';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ClientProjectDetailView projectId={id} />;
}

