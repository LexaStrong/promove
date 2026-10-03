import type { Metadata } from 'next';
import { privatePageRobots } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Driver app',
  description: 'ProMove tools for assigned drivers.',
  robots: privatePageRobots,
};

export default function DriverAppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
