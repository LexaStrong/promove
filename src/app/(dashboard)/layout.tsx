import type { Metadata } from 'next';
import AppShell from '@/components/app-shell';
import { privatePageRobots } from '@/lib/site';

export const metadata: Metadata = {
  robots: privatePageRobots,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
