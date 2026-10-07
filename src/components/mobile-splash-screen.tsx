'use client';

import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronDown, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth as useFleetAuth } from '@/lib/auth-context';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/theme-toggle';

interface MobileSplashScreenProps {
  /** If true, fills the entire viewport without being restricted to mobile media queries */
  standalone?: boolean;
  /** Whether to show the secondary "explore overview" scroll trigger */
  showExploreLink?: boolean;
}

export default function MobileSplashScreen({
  standalone = false,
  showExploreLink = true,
}: MobileSplashScreenProps) {
  const router = useRouter();
  const fleetAuth = useFleetAuth();
  const { isSignedIn: isClerkSignedIn, isLoaded: isClerkLoaded, user: clerkUser } = useClerkUser();

  const isSignedIn = useMemo(() => {
    return Boolean(fleetAuth?.isAuthenticated || (isClerkLoaded && isClerkSignedIn));
  }, [fleetAuth?.isAuthenticated, isClerkLoaded, isClerkSignedIn]);

  const displayName = useMemo(() => {
    if (clerkUser?.firstName) return clerkUser.firstName;
    if (clerkUser?.fullName) return clerkUser.fullName;
    if (fleetAuth?.user?.full_name) return fleetAuth.user.full_name;
    return 'Fleet Operator';
  }, [clerkUser, fleetAuth?.user]);

  const handleContinue = useCallback(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [isSignedIn, router]);

  const handleScrollToDetails = useCallback(() => {
    const el = document.getElementById('pm-landing-details');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <section
      className={`pm-mobile-splash-card ${standalone ? 'pm-mobile-splash-standalone' : ''}`}
      aria-label="ProMove Mobile Splash Screen"
    >
      {/* Background artwork */}
      <div className="pm-mobile-splash-media" aria-hidden="true">
        <picture>
          <source srcSet="/splash-mobile.webp" type="image/webp" />
          <img
            src="/splash-mobile.png"
            alt="ProMove Ghana Fleet and Commercial Vehicles"
            className="pm-mobile-splash-img"
            fetchPriority="high"
          />
        </picture>
        <div className="pm-mobile-splash-vignette-top" />
        <div className="pm-mobile-splash-vignette-bottom" />
      </div>

      {/* Top subtle brand pill & theme switcher */}
      <header className="pm-mobile-splash-header">
        <div className="pm-mobile-splash-badge">
          <span className="pm-mobile-splash-live-dot" />
          <span>GHANA FLEET OS • v1.0</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Bottom interactive action card */}
      <div className="pm-mobile-splash-footer">
        <div className="pm-mobile-splash-headline-box">
          <h1 className="pm-mobile-splash-title">
            ProMove Fleet Control
          </h1>
          <p className="pm-mobile-splash-subtitle">
            Ghana&apos;s digital operating system for trotros, taxis, buses, and commercial transport.
          </p>
        </div>

        <div className="pm-mobile-splash-action-tray">
          <button
            type="button"
            onClick={handleContinue}
            id="pm-splash-continue-btn"
            className="pm-mobile-splash-continue-btn"
            aria-label={isSignedIn ? 'Continue to Dashboard' : 'Continue to Sign In'}
          >
            <span>Continue</span>
            <ArrowRight size={20} className="pm-mobile-splash-btn-arrow" />
          </button>

          <div className="pm-mobile-splash-status-indicator">
            {isSignedIn ? (
              <span className="pm-mobile-splash-signed-in">
                <CheckCircle2 size={14} className="pm-mobile-splash-status-icon success" />
                <span>Signed in as <strong>{displayName}</strong> • Goes to Dashboard</span>
              </span>
            ) : (
              <span className="pm-mobile-splash-signed-out">
                <ShieldCheck size={14} className="pm-mobile-splash-status-icon muted" />
                <span>Goes to Ghana Mobile Sign-In</span>
              </span>
            )}
          </div>

          {showExploreLink && (
            <button
              type="button"
              onClick={handleScrollToDetails}
              className="pm-mobile-splash-explore-link"
              aria-label="Scroll down to explore fleet features and specifications"
            >
              <span>Explore full web platform</span>
              <ChevronDown size={14} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
