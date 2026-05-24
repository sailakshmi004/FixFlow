import { RegisterForm } from '@/features/auth/components/register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Choose freelancer or client to start using FixFlow.</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
