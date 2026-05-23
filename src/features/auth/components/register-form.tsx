'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { registerSchema, type RegisterSchema } from '@/features/auth/validations/auth.schema';
import { registerUser } from '@/features/auth/services/auth-service';
import { ROUTES } from '@/constants/routes';
import { ROLES, ROLE_LABELS } from '@/constants/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

export function RegisterForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'freelancer'
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      const result = await registerUser(values);
      if (result.requiresEmailConfirmation) {
        setSuccessMessage('Account created. Check your email to confirm your account before signing in.');
        return;
      }
      window.location.assign(result.redirectTo);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create account.');
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" placeholder="Sai Kumar" {...form.register('fullName')} />
        {form.formState.errors.fullName ? <p className="text-sm text-red-600">{form.formState.errors.fullName.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...form.register('email')} />
        {form.formState.errors.email ? <p className="text-sm text-red-600">{form.formState.errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select id="role" {...form.register('role')}>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </Select>
        {form.formState.errors.role ? <p className="text-sm text-red-600">{form.formState.errors.role.message}</p> : null}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 6 characters" {...form.register('password')} />
          {form.formState.errors.password ? <p className="text-sm text-red-600">{form.formState.errors.password.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" type="password" placeholder="Repeat password" {...form.register('confirmPassword')} />
          {form.formState.errors.confirmPassword ? <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p> : null}
        </div>
      </div>
      {errorMessage ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}
      {successMessage ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p> : null}
      <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href={ROUTES.login} className="font-medium text-slate-950 underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
