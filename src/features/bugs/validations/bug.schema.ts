import { z } from 'zod';
import { BUG_PRIORITIES, BUG_SEVERITIES, BUG_TYPES } from '@/constants/statuses';

export const reportBugSchema = z.object({
  projectId: z.string().min(1, 'Select a project.'),
  clientId: z.string().optional(),
  type: z.enum(BUG_TYPES, { required_error: 'Select bug or change request.' }),
  title: z.string().min(1, 'Title is required.').max(200, 'Title must be under 200 characters.'),
  description: z.string().min(1, 'Description is required.').max(5000, 'Description must be under 5000 characters.'),
  priority: z.enum(BUG_PRIORITIES).default('medium'),
  severity: z.enum(BUG_SEVERITIES).default('minor'),
});

export type ReportBugInput = z.infer<typeof reportBugSchema>;

export const clientReportBugSchema = z.object({
  projectId: z.string().min(1, 'Select a project.'),
  type: z.enum(BUG_TYPES, { required_error: 'Select bug or change request.' }),
  title: z.string().min(1, 'Title is required.').max(200, 'Title must be under 200 characters.'),
  description: z.string().min(1, 'Description is required.').max(5000, 'Description must be under 5000 characters.'),
  priority: z.enum(BUG_PRIORITIES).default('medium'),
  severity: z.enum(BUG_SEVERITIES).default('minor'),
});

export type ClientReportBugInput = z.infer<typeof clientReportBugSchema>;

export const commentSchema = z.object({
  comment: z.string().min(1, 'Comment cannot be empty.').max(2000, 'Comment must be under 2000 characters.'),
});

export type CommentInput = z.infer<typeof commentSchema>;
