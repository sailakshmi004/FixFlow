import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm text-slate-600">The page you’re looking for does not exist yet.</p>
        <Link href={ROUTES.home} className={cn(buttonVariants(), 'mt-6')}>
          Go home
        </Link>
      </div>
    </div>
  );
}
