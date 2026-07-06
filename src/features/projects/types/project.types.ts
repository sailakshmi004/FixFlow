import type { ProjectRow } from '@/types/database.types';

export type ProjectFormValues = {
  clientId: string;
  name: string;
  description?: string;
  techStack?: string;
  projectUrl?: string;
  githubUrl?: string;
  status: NonNullable<ProjectRow['status']>;
  startDate?: string;
  deadline?: string;
  budget?: string;
};
