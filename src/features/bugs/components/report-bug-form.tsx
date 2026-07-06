'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bug, GitPullRequest, Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { getClientProjectsForBugs, createBug, uploadAttachment } from '@/features/bugs/services/bug-service';
import { clientReportBugSchema, type ClientReportBugInput } from '@/features/bugs/validations/bug.schema';
import { ROUTES } from '@/constants/routes';

export function ReportBugForm() {
  const router = useRouter();
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const form = useForm<ClientReportBugInput>({
    resolver: zodResolver(clientReportBugSchema),
    defaultValues: {
      projectId: '',
      type: 'bug',
      title: '',
      description: '',
      priority: 'medium',
      severity: 'minor',
    },
  });

  useEffect(() => {
    async function load() {
      setLoadingProjects(true);
      try {
        const data = await getClientProjectsForBugs();
        setProjects(data);
        if (data[0]) form.setValue('projectId', data[0].id);
      } catch {
        setActionMessage('Unable to load projects.');
      } finally {
        setLoadingProjects(false);
      }
    }
    void load();
  }, [form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setActionMessage(null);
    try {
      const bug = await createBug({ ...values, clientId: '' });
      if (files.length > 0) {
        setUploading(true);
        await Promise.all(files.map((f) => uploadAttachment(bug.id, f)));
        setUploading(false);
      }
      router.push(ROUTES.client.bugs);
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to report issue.');
    }
  });

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-950">Report an issue</h1>
        <p className="mt-1 text-sm text-slate-500">Submit a bug or change request for one of your projects.</p>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="border-b border-slate-200/70 px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Bug className="h-4 w-4" />
            Issue details
          </div>
        </div>

        <form className="space-y-5 p-6" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="projectId">Project</Label>
            <Select id="projectId" {...form.register('projectId')}>
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
            {form.formState.errors.projectId && <p className="text-xs text-red-500">{form.formState.errors.projectId.message}</p>}
            {!loadingProjects && projects.length === 0 && (
              <p className="flex items-center gap-1.5 text-xs text-amber-600">
                <AlertCircle className="h-3 w-3" />
                No active projects assigned to you.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Issue type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => form.setValue('type', 'bug')}
                className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                  form.watch('type') === 'bug'
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : 'border-slate-200/70 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Bug className="h-4 w-4" />
                Bug
              </button>
              <button
                type="button"
                onClick={() => form.setValue('type', 'change_request')}
                className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                  form.watch('type') === 'change_request'
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : 'border-slate-200/70 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <GitPullRequest className="h-4 w-4" />
                Change request
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g. Login button not working on mobile" {...form.register('title')} />
            {form.formState.errors.title && <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={5}
              className="w-full resize-none rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
              placeholder="Describe what happened, what you expected, and how to reproduce it..."
              {...form.register('description')}
            />
            {form.formState.errors.description && <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Select id="priority" {...form.register('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="severity">Severity</Label>
              <Select id="severity" {...form.register('severity')}>
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
                <option value="blocker">Blocker</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Attachments (optional)</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200/70 px-4 py-8 text-sm text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50">
              <Upload className="h-5 w-5" />
              <span className="font-medium">Click to upload screenshots or videos</span>
              <span className="text-xs text-slate-400">PNG, JPG, GIF, MP4</span>
              <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={addFiles} />
            </label>
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                    <span className="max-w-[120px] truncate">{f.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {actionMessage && <p className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{actionMessage}</p>}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={form.formState.isSubmitting || uploading || projects.length === 0} className="rounded-2xl px-6">
              {form.formState.isSubmitting || uploading ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</span>
              ) : (
                'Submit issue'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-2xl px-6">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
