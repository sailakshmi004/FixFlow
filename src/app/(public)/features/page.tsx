import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FeaturesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>BugNest is designed to keep bug tracking simple for freelancers and clients.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-slate-600">
          The Phase 1 build includes authentication, role-based routing, dashboard shells, and the Supabase connection foundation.
        </CardContent>
      </Card>
    </div>
  );
}

