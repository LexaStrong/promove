import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LoginPage from '@/app/login/page';

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) {
    redirect('/dashboard');
  }

  return <LoginPage />;
}
