export const CLIENT_STATUSES = ['active', 'inactive', 'archived'] as const;
export const PROJECT_STATUSES = ['planning', 'active', 'testing', 'completed', 'on_hold', 'cancelled'] as const;
export const BUG_STATUSES = ['new', 'accepted', 'in_progress', 'fixed', 'client_review', 'reopened', 'closed', 'rejected'] as const;
export const BUG_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const BUG_SEVERITIES = ['minor', 'major', 'critical', 'blocker'] as const;
export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type BugStatus = (typeof BUG_STATUSES)[number];
export type BugPriority = (typeof BUG_PRIORITIES)[number];
export type BugSeverity = (typeof BUG_SEVERITIES)[number];
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

