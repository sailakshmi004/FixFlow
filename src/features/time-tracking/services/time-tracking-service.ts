import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getBrowserProfile } from '@/features/auth/services/browser-session';
import type { TimeEntryRow } from '@/types/database.types';
import type { ActiveTimerEntry, TimeEntryWithProject, TimeTrackingStats } from '@/features/time-tracking/types/time-tracking.types';

export type TimeSummaryItem = {
  projectId: string;
  projectName: string;
  totalSeconds: number;
};

export async function getActiveTimer(): Promise<ActiveTimerEntry | null> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) return null;

  const { data } = await supabase
    .from('time_entries')
    .select('*, project:projects(id, name, client:clients(name))')
    .eq('freelancer_id', profile.id)
    .eq('is_running', true)
    .single();

  return data as ActiveTimerEntry | null;
}

export async function getTimeEntries(limit = 50): Promise<TimeEntryWithProject[]> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) return [];

  const { data } = await supabase
    .from('time_entries')
    .select('*, project:projects(id, name, client:clients(name))')
    .eq('freelancer_id', profile.id)
    .order('start_time', { ascending: false })
    .limit(limit);

  return (data ?? []) as TimeEntryWithProject[];
}

export async function getTimeTrackingStats(): Promise<TimeTrackingStats> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) {
    return { todaySeconds: 0, weekSeconds: 0, monthSeconds: 0, totalSeconds: 0, activeEntry: null, recentEntries: [] };
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: entries } = await supabase
    .from('time_entries')
    .select('*, project:projects(id, name, client:clients(name))')
    .eq('freelancer_id', profile.id)
    .order('start_time', { ascending: false });

  if (!entries) {
    return { todaySeconds: 0, weekSeconds: 0, monthSeconds: 0, totalSeconds: 0, activeEntry: null, recentEntries: [] };
  }

  const allEntries = entries as TimeEntryWithProject[];
  const activeEntry = allEntries.find((e) => e.is_running) ?? null;
  const recentEntries = allEntries.slice(0, 10);

  let todaySeconds = 0;
  let weekSeconds = 0;
  let monthSeconds = 0;
  let totalSeconds = 0;

  for (const entry of allEntries) {
    let seconds: number;

    if (entry.is_running && entry.start_time) {
      seconds = Math.floor((now.getTime() - new Date(entry.start_time).getTime()) / 1000);
    } else if (entry.duration_seconds) {
      seconds = entry.duration_seconds;
    } else if (entry.start_time && entry.end_time) {
      seconds = Math.floor((new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / 1000);
    } else {
      continue;
    }

    totalSeconds += seconds;

    if (entry.start_time >= startOfDay) {
      todaySeconds += seconds;
    }
    if (entry.start_time >= startOfWeek) {
      weekSeconds += seconds;
    }
    if (entry.start_time >= startOfMonth) {
      monthSeconds += seconds;
    }
  }

  return { todaySeconds, weekSeconds, monthSeconds, totalSeconds, activeEntry, recentEntries };
}

export async function getTimeEntriesByProject(projectId: string): Promise<TimeEntryWithProject[]> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) return [];

  const { data } = await supabase
    .from('time_entries')
    .select('*, project:projects(id, name, client:clients(name))')
    .eq('freelancer_id', profile.id)
    .eq('project_id', projectId)
    .order('start_time', { ascending: false });

  return (data ?? []) as TimeEntryWithProject[];
}

export async function getTimeSummaryByProject(): Promise<TimeSummaryItem[]> {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) return [];

  const { data: entries } = await supabase
    .from('time_entries')
    .select('*, project:projects(id, name)')
    .eq('freelancer_id', profile.id);

  if (!entries) return [];

  const projectMap = new Map<string, TimeSummaryItem>();

  for (const entry of entries as (TimeEntryRow & { project: { id: string; name: string } | null })[]) {
    if (!entry.project) continue;

    let seconds: number;
    if (entry.is_running && entry.start_time) {
      seconds = Math.floor((Date.now() - new Date(entry.start_time).getTime()) / 1000);
    } else if (entry.duration_seconds) {
      seconds = entry.duration_seconds;
    } else if (entry.start_time && entry.end_time) {
      seconds = Math.floor((new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / 1000);
    } else {
      continue;
    }

    const existing = projectMap.get(entry.project.id);
    if (existing) {
      existing.totalSeconds += seconds;
    } else {
      projectMap.set(entry.project.id, {
        projectId: entry.project.id,
        projectName: entry.project.name,
        totalSeconds: seconds,
      });
    }
  }

  return Array.from(projectMap.values()).sort((a, b) => b.totalSeconds - a.totalSeconds);
}

export async function startTimer(projectId: string, description?: string, hourlyRate?: number) {
  const supabase = createSupabaseBrowserClient();
  const profile = await getBrowserProfile();
  if (!profile) throw new Error('Unable to resolve profile.');

  // Stop any existing running timer first
  await supabase
    .from('time_entries')
    .update({ is_running: false, end_time: new Date().toISOString() } as never)
    .eq('freelancer_id', profile.id)
    .eq('is_running', true);

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      freelancer_id: profile.id,
      project_id: projectId,
      description: description || null,
      start_time: new Date().toISOString(),
      is_running: true,
      hourly_rate: hourlyRate || null,
    } as never)
    .select('*, project:projects(id, name, client:clients(name))')
    .single();

  if (error) throw error;
  return data as ActiveTimerEntry;
}

export async function stopTimer(entryId: string) {
  const supabase = createSupabaseBrowserClient();
  const now = new Date().toISOString();

  // Get the entry first to calculate duration
  const { data: rawEntry } = await supabase
    .from('time_entries')
    .select('*')
    .eq('id', entryId)
    .single();

  if (!rawEntry) throw new Error('Timer entry not found');

  const entry = rawEntry as TimeEntryRow;
  const startTime = new Date(entry.start_time).getTime();
  const endTime = Date.now();
  const durationSeconds = Math.floor((endTime - startTime) / 1000);

  const { error } = await supabase
    .from('time_entries')
    .update({
      is_running: false,
      end_time: now,
      duration_seconds: durationSeconds,
    } as never)
    .eq('id', entryId);

  if (error) throw error;
}

export async function deleteTimeEntry(entryId: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', entryId);

  if (error) throw error;
}

export async function updateTimeEntry(
  entryId: string,
  data: { description?: string; hourly_rate?: number | null }
) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('time_entries')
    .update(data as never)
    .eq('id', entryId);

  if (error) throw error;
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatHours(seconds: number): string {
  const hrs = seconds / 3600;
  return hrs.toFixed(2);
}