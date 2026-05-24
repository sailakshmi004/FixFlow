import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FixFlow',
  description: 'Client-friendly bug tracking for freelance developers.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
