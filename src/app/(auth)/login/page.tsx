import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access your freelancer, client, or admin dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div className="py-2 text-sm text-slate-500">Loading sign-in form...</div>}>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
