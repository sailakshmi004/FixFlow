import type { TimeEntryRow } from '@/types/database.types';

export type TimeEntryFormValues = {
  projectId: string;
  description?: string;
  hourlyRate?: number;
};

export type ActiveTimerEntry = TimeEntryRow & {
  project: { id: string; name: string; client: { name: string } | null } | null;
};

export type TimeEntryWithProject = TimeEntryRow & {
  project: { id: string; name: string; client: { name: string } | null } | null;
};

export type TimeTrackingStats = {
  todaySeconds: number;
  weekSeconds: number;
  monthSeconds: number;
  totalSeconds: number;
  activeEntry: ActiveTimerEntry | null;
  recentEntries: TimeEntryWithProject[];
};