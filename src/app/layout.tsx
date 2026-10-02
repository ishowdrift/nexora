import type { Metadata } from 'next';
import './globals.css';
import { NexoraProvider } from '@/providers/nexora-provider';

export const metadata: Metadata = {
  title: 'NEXORA — Business Operations, Organized.',
  description:
    'A production-grade multi-tenant B2B operations platform engineered with PostgreSQL Row-Level Security, organization-level RBAC, and strict tenant data isolation.',
  keywords: [
    'B2B SaaS',
    'Multi-tenant architecture',
    'PostgreSQL RLS',
    'Supabase',
    'RBAC',
    'Business Operations',
    'Next.js',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="bg-[#090A0F] text-gray-100 antialiased min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200"
        suppressHydrationWarning
      >
        <NexoraProvider>{children}</NexoraProvider>
      </body>
    </html>
  );
}
