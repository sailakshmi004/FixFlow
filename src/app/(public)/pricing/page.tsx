import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>Pricing will be expanded later. The MVP focuses on the core workflow first.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-slate-600">
          The current phase keeps the product ready for future subscription and billing layers.
        </CardContent>
      </Card>
    </div>
  );
}
