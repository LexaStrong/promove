import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import SignupPage from '@/app/signup/page';

export default async function ClerkSignUpPage() {
  const { userId } = await auth();
  if (userId) {
    redirect('/dashboard');
  }

  return <SignupPage />;
}
