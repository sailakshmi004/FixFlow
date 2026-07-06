import { BugDetailView } from '@/features/bugs/components/bug-detail-view';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function FreelancerBugDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <BugDetailView bugId={id} role="freelancer" />;
}

