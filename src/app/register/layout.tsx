import type { Metadata } from 'next';
import { privatePageRobots } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create a ProMove owner account and fleet workspace.',
  robots: privatePageRobots,
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
