'use client';

import { useEffect, useState } from 'react';
import { FileImage, File, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getBugAttachments } from '@/features/bugs/services/bug-service';
import type { BugAttachmentRow } from '@/features/bugs/types/bug.types';

type BugAttachmentsProps = {
  bugId: string;
};

export function BugAttachments({ bugId }: BugAttachmentsProps) {
  const [attachments, setAttachments] = useState<BugAttachmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getBugAttachments(bugId);
        setAttachments(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [bugId]);

  if (loading) return null;
  if (attachments.length === 0) return null;

  const images = attachments.filter((a) => a.file_type?.startsWith('image/'));
  const videos = attachments.filter((a) => a.file_type?.startsWith('video/'));
  const others = attachments.filter((a) => !a.file_type?.startsWith('image/') && !a.file_type?.startsWith('video/'));

  return (
    <>
      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <FileImage className="h-4 w-4" />
            Attachments ({attachments.length})
          </div>
        </div>
        <div className="space-y-4 p-6">
          {images.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => setPreviewIndex(i)}
                  className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                >
                  <img src={a.file_url} alt={a.file_name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                    <FileImage className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </button>
              ))}
            </div>
          )}
          {videos.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {videos.map((a) => (
                <div key={a.id} className="overflow-hidden rounded-xl border border-slate-200 bg-black">
                  <video controls className="w-full" preload="metadata">
                    <source src={a.file_url} type={a.file_type ?? undefined} />
                  </video>
                </div>
              ))}
            </div>
          )}
          {others.length > 0 && (
            <div className="space-y-2">
              {others.map((a) => (
                <a
                  key={a.id}
                  href={a.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-colors hover:bg-slate-100"
                >
                  <File className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1 truncate text-slate-700">{a.file_name}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {previewIndex !== null && images[previewIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setPreviewIndex(null)}>
          <button onClick={() => setPreviewIndex(null)} className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70">
            <X className="h-5 w-5" />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setPreviewIndex((prev) => (prev! - 1 + images.length) % images.length); }}
                className="absolute left-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setPreviewIndex((prev) => (prev! + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <img
            src={images[previewIndex].file_url}
            alt={images[previewIndex].file_name}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
