'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, Send, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBugComments, addComment } from '@/features/bugs/services/bug-service';
import { commentSchema, type CommentInput } from '@/features/bugs/validations/bug.schema';
import type { BugCommentRow } from '@/features/bugs/types/bug.types';

type BugCommentsProps = {
  bugId: string;
};

export function BugComments({ bugId }: BugCommentsProps) {
  const [comments, setComments] = useState<BugCommentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: '' },
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getBugComments(bugId);
        setComments(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [bugId]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const newComment = await addComment(bugId, values.comment);
      setComments((prev) => [...prev, newComment]);
      form.reset();
    } catch {
      // silent
    }
  });

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="border-b border-slate-200/70 px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <MessageSquare className="h-4 w-4" />
          Comments
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{comments.length}</span>
        </div>
      </div>

      <div className="space-y-5 px-6 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
              <MessageSquare className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-2 text-sm text-slate-500">No comments yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                  {c.user?.full_name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-slate-950">{c.user?.full_name || c.user?.email || 'Unknown'}</span>
                    <span className="text-xs text-slate-400">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">{c.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex gap-2 pt-2 border-t border-slate-200/70">
          <input
            className="min-w-0 flex-1 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
            placeholder="Write a comment..."
            {...form.register('comment')}
          />
          <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-2xl" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
