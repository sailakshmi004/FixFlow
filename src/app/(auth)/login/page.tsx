import { LoginForm } from '@/features/auth/components/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access your freelancer, client, or admin dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
