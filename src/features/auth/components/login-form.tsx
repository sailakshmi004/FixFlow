'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginSchema, type LoginSchema } from '@/features/auth/validations/auth.schema';
import { loginUser } from '@/features/auth/services/auth-service';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setErrorMessage(null);
      const result = await loginUser(values);
      const nextPath = searchParams.get('next') ?? result.redirectTo;
      await new Promise((resolve) => setTimeout(resolve, 150));
      window.location.assign(nextPath);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to log in.');
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...form.register('email')} />
        {form.formState.errors.email ? <p className="text-sm text-red-600">{form.formState.errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...form.register('password')} />
        {form.formState.errors.password ? <p className="text-sm text-red-600">{form.formState.errors.password.message}</p> : null}
      </div>
      {errorMessage ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}
      <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
      <p className="text-center text-sm text-slate-600">
        No account yet?{' '}
        <Link href={ROUTES.register} className="font-medium text-slate-950 underline underline-offset-4">
          Create one
        </Link>
      </p>
    </form>
  );
}
