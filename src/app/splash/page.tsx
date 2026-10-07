import type { Metadata } from 'next';
import MobileSplashScreen from '@/components/mobile-splash-screen';
import { privatePageRobots } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Mobile Welcome | ProMove Fleet',
  description: 'ProMove fleet management mobile splash and onboarding welcome screen.',
  robots: privatePageRobots,
};

export default function SplashPage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        backgroundColor: '#07161F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MobileSplashScreen standalone={true} showExploreLink={false} />
    </main>
  );
}
