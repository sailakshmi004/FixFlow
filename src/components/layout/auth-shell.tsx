import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export function AuthShell({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.06),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_52%,_#eef2ff_100%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="flex flex-col justify-between rounded-[2rem] border border-slate-200/70 bg-slate-950 p-8 text-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.55)] sm:p-10">
            <div>
              <Link href={ROUTES.home} className="mb-8 inline-flex items-center gap-3 text-lg font-semibold tracking-wide text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-bold text-slate-950">
                  F
                </span>
                FixFlow
              </Link>
              <p className="text-sm uppercase tracking-[0.28em] text-sky-300">Client-friendly bug tracking</p>
              <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">{description}</p>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {['Fast reporting', 'Clear approvals', 'Simple invoicing'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200/70 bg-white p-6 text-slate-950 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.28)] sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
