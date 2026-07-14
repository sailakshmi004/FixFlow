'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Square, Clock, ChevronDown, ChevronUp, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  getActiveTimer,
  getTimeEntries,
  startTimer,
  stopTimer,
  deleteTimeEntry,
  formatDuration,
} from '@/features/time-tracking/services/time-tracking-service';
import type { TimeEntryWithProject } from '@/features/time-tracking/types/time-tracking.types';
import { getFreelancerProjects, type ProjectWithClient } from '@/features/projects/services/project-service';

export function LiveTimer() {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [entries, setEntries] = useState<TimeEntryWithProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [activeEntry, setActiveEntry] = useState<TimeEntryWithProject | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [starting, setStarting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [projectsData, entriesData, active] = await Promise.all([
        getFreelancerProjects(),
        getTimeEntries(20),
        getActiveTimer(),
      ]);
      setProjects(projectsData);
      setEntries(entriesData);
      setActiveEntry(active);
      if (active) {
        setElapsed(Math.floor((Date.now() - new Date(active.start_time).getTime()) / 1000));
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  // Tick the timer every second when running
  useEffect(() => {
    if (activeEntry) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeEntry]);

  const handleStart = async () => {
    if (!selectedProjectId || starting) return;
    setStarting(true);
    try {
      const newEntry = await startTimer(selectedProjectId, description || undefined);
      setActiveEntry(newEntry);
      setDescription('');
      setElapsed(Math.floor((Date.now() - new Date(newEntry.start_time).getTime()) / 1000));
      // Reload entries
      const entriesData = await getTimeEntries(20);
      setEntries(entriesData);
    } catch {
      // silent
    } finally {
      setStarting(false);
    }
  };

  const handleStop = async () => {
    if (!activeEntry) return;
    try {
      await stopTimer(activeEntry.id);
      setActiveEntry(null);
      setElapsed(0);
      const entriesData = await getTimeEntries(20);
      setEntries(entriesData);
    } catch {
      // silent
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      await deleteTimeEntry(entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Timer Banner */}
      {activeEntry && (
        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3">
                <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>
              <div>
                <p className="text-sm font-medium text-emerald-900">
                  {activeEntry.project?.name || 'Unknown project'}
                </p>
                {activeEntry.description && (
                  <p className="text-xs text-emerald-700">{activeEntry.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg font-bold text-emerald-900 tabular-nums">
                {formatDuration(elapsed)}
              </span>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 rounded-full"
                onClick={handleStop}
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                Stop
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Start Timer Form */}
      {!activeEntry && (
        <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-5 backdrop-blur-xl">
          <h3 className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Clock className="h-4 w-4" />
            Start Timer
          </h3>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="flex-1"
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.client ? ` (${p.client.name})` : ''}
                </option>
              ))}
            </Select>
            <input
              type="text"
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-xs"
            />
            <Button
              onClick={handleStart}
              disabled={!selectedProjectId || starting}
              className="gap-1.5"
            >
              {starting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
              Start
            </Button>
          </div>
        </div>
      )}

      {/* Time Entry History */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex w-full items-center justify-between border-b border-slate-200/70 px-5 py-3.5 text-left"
        >
          <span className="text-sm font-medium text-slate-700">
            Recent entries ({entries.length})
          </span>
          {showHistory ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>
        {showHistory && (
          <div className="p-3">
            {entries.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No time entries yet.</p>
            ) : (
              <div className="max-h-80 space-y-1 overflow-y-auto">
                {entries.map((entry) => {
                  const entryDuration = entry.is_running
                    ? Math.floor((Date.now() - new Date(entry.start_time).getTime()) / 1000)
                    : entry.duration_seconds ?? 0;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {entry.project?.name || 'Unknown'}
                        </p>
                        {entry.description && (
                          <p className="truncate text-xs text-slate-500">{entry.description}</p>
                        )}
                        <p className="text-xs text-slate-400">
                          {new Date(entry.start_time).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="whitespace-nowrap font-mono text-sm text-slate-600 tabular-nums">
                          {formatDuration(entryDuration)}
                        </span>
                        {!entry.is_running && (
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}