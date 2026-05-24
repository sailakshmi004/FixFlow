import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>Use this page later for support or sales contact details.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-slate-600">
          We will wire in the actual contact form once the core workspace is stable.
        </CardContent>
      </Card>
    </div>
  );
}
