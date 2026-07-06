import type { BugRow } from '@/types/database.types';
import type { BugPriority, BugSeverity, BugType } from '@/constants/statuses';

export type BugFormValues = {
  projectId: string;
  clientId?: string;
  type: BugType;
  title: string;
  description: string;
  priority: BugPriority;
  severity: BugSeverity;
};

export type BugWithRelations = BugRow & {
  project: { id: string; name: string; freelancer_id: string | null } | null;
  reporter: { id: string; full_name: string; email: string } | null;
  assignee: { id: string; full_name: string; email: string } | null;
};

export type BugCommentRow = {
  id: string;
  bug_id: string;
  user_id: string;
  comment: string;
  created_at: string | null;
  user: { id: string; full_name: string; email: string } | null;
};

export type BugAttachmentRow = {
  id: string;
  bug_id: string;
  uploaded_by: string | null;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string | null;
};
