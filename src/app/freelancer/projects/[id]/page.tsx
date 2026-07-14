import { FreelancerProjectDetailView } from '@/features/projects/components/freelancer-project-detail-view';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function FreelancerProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <FreelancerProjectDetailView projectId={id} />;
}

