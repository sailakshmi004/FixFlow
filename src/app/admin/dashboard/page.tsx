import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Platform monitoring and moderation tools will expand over time.</p>
      </div>
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Platform overview</CardTitle>
          <CardDescription>Users, projects, bugs, and subscriptions will be connected in future phases.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          The admin shell is protected and ready for centralized oversight features.
        </CardContent>
      </Card>
    </div>
  );
}

