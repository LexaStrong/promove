import React, { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { LoginForm } from '@/components/login-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { ShieldCheck, MapPin, Fuel, Database } from 'lucide-react';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Sign In to Your Fleet | ProMove Ghana',
  description:
    'Sign in to your ProMove fleet operations account to manage vehicles, daily pesewa driver collections, GPS tracking, and DVLA compliance.',
  alternates: {
    canonical: new URL('/login', siteUrl).toString(),
  },
};

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-[var(--pm-bg)]">
      {/* Left Column: Sign-in Form Container */}
      <div className="flex flex-col justify-between p-6 sm:p-8 md:p-12 lg:p-14">
        {/* Top Bar: Brand & Controls */}
        <div className="flex items-center justify-between pb-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            aria-label="ProMove home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="ProMove Logo"
              className="h-8 w-8 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-[var(--pm-text)] font-sans">
                ProMove
              </span>
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--pm-blue-600)]">
                Fleet Control
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[var(--pm-bg-subtle)] border border-[var(--pm-border-subtle)] px-2.5 py-0.5 text-xs font-medium text-[var(--pm-text-muted)]">
              🇬🇭 Ghana • v1.0
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Center: Login Form */}
        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-md">
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-8 text-sm text-[var(--pm-text-muted)]">
                  Loading sign-in form...
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>

        {/* Bottom Security / Trust Footer */}
        <div className="pt-6 border-t border-[var(--pm-border-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--pm-text-muted)]">
          <div className="flex items-center gap-2">
            <Database className="size-3.5 text-[var(--pm-blue-600)]" />
            <span>Postgres Multi-Tenant Isolation</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>Ghana Act 843 Statutory Protection</span>
          </div>
        </div>
      </div>

      {/* Right Column: Visual Cover Panel (shadcn login-02 feature) */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[var(--pm-surface)] border-l border-[var(--pm-border)] p-12">
        {/* Decorative Background Image */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/auth-splash-desktop.png"
            alt="ProMove Commercial Fleet Operations"
            className="h-full w-full object-cover opacity-35 dark:opacity-20 dark:brightness-[0.4] dark:grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--pm-surface)] via-transparent to-[var(--pm-surface)]/80" />
        </div>

        {/* Top Badge Overlay */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--pm-surface)]/90 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-[var(--pm-text)] shadow-sm border border-[var(--pm-border)]">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Telematics & Corridors</span>
          </div>
          <span className="text-xs font-mono font-medium text-[var(--pm-text-muted)]">
            CIRCLE • KASOA • TEMA • MADINA
          </span>
        </div>

        {/* Center Quotation / Testimonial */}
        <div className="relative z-10 my-auto max-w-lg space-y-4">
          <div className="inline-flex size-10 items-center justify-center rounded-xl bg-[var(--pm-blue-600)] text-white shadow-md">
            <ShieldCheck className="size-5" />
          </div>
          <blockquote className="text-xl font-medium leading-relaxed text-[var(--pm-text)]">
            &ldquo;Managing driver daily cash deposits and maintenance across 18 trotros used to be chaotic. With ProMove, every trip and payment is verified in real-time.&rdquo;
          </blockquote>
          <div className="text-sm">
            <div className="font-semibold text-[var(--pm-text)]">
              Kofi Mensah Darko
            </div>
            <div className="text-xs text-[var(--pm-text-muted)]">
              Managing Director • Darko Transit Line (Accra - Kasoa Corridor)
            </div>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-[var(--pm-border)]">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--pm-text)]">
              <MapPin className="size-3.5 text-[var(--pm-blue-600)]" />
              <span>Live Gateway</span>
            </div>
            <p className="text-[0.7rem] text-[var(--pm-text-muted)]">
              Traccar GPS integration with live speed radar.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--pm-text)]">
              <Fuel className="size-3.5 text-emerald-600" />
              <span>Exact Pesewas</span>
            </div>
            <p className="text-[0.7rem] text-[var(--pm-text-muted)]">
              Financial precision eliminating calculation drift.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--pm-text)]">
              <ShieldCheck className="size-3.5 text-amber-600" />
              <span>DVLA Expiry</span>
            </div>
            <p className="text-[0.7rem] text-[var(--pm-text-muted)]">
              Automated roadworthy & insurance alerts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
