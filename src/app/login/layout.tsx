import type { Metadata } from 'next';
import { privatePageRobots } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to ProMove fleet operations.',
  robots: privatePageRobots,
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
