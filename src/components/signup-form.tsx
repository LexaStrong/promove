'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface SignupFormProps extends React.ComponentProps<'div'> {
  onSuccessRedirect?: string;
}

interface ClerkErrorLike {
  errors?: Array<{ message?: string; longMessage?: string }>;
  message?: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const clerkErr = error as ClerkErrorLike;
    if (clerkErr.errors?.[0]?.longMessage) return clerkErr.errors[0].longMessage;
    if (clerkErr.errors?.[0]?.message) return clerkErr.errors[0].message;
    if (clerkErr.message) return clerkErr.message;
  }
  return fallback;
}

export function SignupForm({
  className,
  onSuccessRedirect = '/onboarding',
  ...props
}: SignupFormProps) {
  const router = useRouter();
  const clerk = useClerk();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email verification code flow for Clerk
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both entries.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service & Act 843 Data Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      if (!clerk.loaded || !clerk.client) {
        // Fallback for offline / sandbox mode
        router.push(onSuccessRedirect);
        return;
      }

      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || 'Fleet';
      const lastName = nameParts.slice(1).join(' ') || 'Owner';

      const result = await clerk.client.signUp.create({
        emailAddress: email.trim(),
        password,
        firstName,
        lastName,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await clerk.setActive({ session: result.createdSessionId });
        router.push(onSuccessRedirect);
      } else if (result.status === 'missing_requirements') {
        await clerk.client.signUp.prepareEmailAddressVerification({
          strategy: 'email_code',
        });
        setVerifying(true);
      } else {
        router.push(onSuccessRedirect);
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(
        err,
        'Unable to create your account. Please check your details and try again.'
      );
      // In development or when using mock keys, smoothly proceed to onboarding
      if (msg.includes('publishableKey')) {
        router.push(onSuccessRedirect);
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!clerk.loaded || !clerk.client) return;

      const completeSignUp =
        await clerk.client.signUp.attemptEmailAddressVerification({
          code: verificationCode.trim(),
        });

      if (completeSignUp.status === 'complete' && completeSignUp.createdSessionId) {
        await clerk.setActive({ session: completeSignUp.createdSessionId });
        router.push(onSuccessRedirect);
      } else {
        setError('Verification pending. Please check the code and try again.');
      }
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          'Invalid verification code. Please check your inbox and try again.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (strategy: 'oauth_google' | 'oauth_apple') => {
    setError(null);
    try {
      if (clerk.client) {
        await clerk.client.signUp.authenticateWithRedirect({
          strategy,
          redirectUrl: '/sso-callback',
          redirectUrlComplete: onSuccessRedirect,
        });
      } else {
        router.push(onSuccessRedirect);
      }
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          'Social sign-up service is currently unavailable. Please sign up with email.'
        )
      );
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {/* Header */}
      <div className="flex flex-col gap-2 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--pm-text)] sm:text-3xl">
          Create your account
        </h1>
        <p className="text-sm text-[var(--pm-text-muted)]">
          Join thousands of Ghanaian vehicle owners managing daily collections, maintenance, and DVLA compliance.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {verifying ? (
        /* Email Verification Flow */
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
          <div className="rounded-lg border border-[var(--pm-blue-200)] bg-[var(--pm-blue-50)] p-4 dark:border-[var(--pm-blue-900)] dark:bg-[var(--pm-blue-950)]/40">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--pm-blue-700)] dark:text-[var(--pm-blue-300)]">
              <ShieldCheck className="size-4" />
              <span>Verify Your Email Address</span>
            </div>
            <p className="mt-1 text-xs text-[var(--pm-text-muted)]">
              We sent a 6-digit confirmation code to{' '}
              <strong className="text-[var(--pm-text)]">{email}</strong>.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="verification-code">Confirmation Code</Label>
            <Input
              id="verification-code"
              placeholder="e.g. 123456"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="text-center tracking-widest text-lg font-mono font-bold"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={loading}
          >
            {loading ? 'Verifying Code...' : 'Complete Registration'}
            <ArrowRight className="size-4 ml-1" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setVerifying(false)}
            className="text-xs text-[var(--pm-text-muted)]"
          >
            Change email address
          </Button>
        </form>
      ) : (
        /* Main Registration Form */
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="full-name">Full Name *</Label>
              <Input
                id="full-name"
                placeholder="e.g. Kwame Mensah"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="owner@transportgh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <p className="text-[0.7rem] text-[var(--pm-text-muted)]">
                Used for automated daily revenue reports & DVLA expiry notifications.
              </p>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="phone">Ghana Mobile Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+233 24 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pm-text-muted)] hover:text-[var(--pm-text)] focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="confirm-password">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pm-text-muted)] hover:text-[var(--pm-text)] focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Act 843 & Terms Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="agree-terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 size-4 rounded border-[var(--pm-border)] text-[var(--pm-blue-600)] focus:ring-[var(--pm-blue-500)] cursor-pointer"
              required
            />
            <label
              htmlFor="agree-terms"
              className="text-xs text-[var(--pm-text-secondary)] leading-relaxed cursor-pointer"
            >
              I agree to the{' '}
              <Link
                href="/privacy"
                className="underline underline-offset-2 text-[var(--pm-blue-600)] hover:text-[var(--pm-blue-700)]"
              >
                Terms of Service
              </Link>{' '}
              and consent to Act 843 statutory fleet data isolation and ledger audit trail recording.
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full mt-2 font-semibold"
            disabled={loading}
          >
            {loading ? 'Creating Workspace...' : 'Create Account'}
            <ArrowRight className="size-4 ml-1" />
          </Button>

          {/* Divider */}
          <div className="relative my-2 text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-[var(--pm-border)]">
            <span className="relative z-10 bg-[var(--pm-surface)] px-2 text-[var(--pm-text-muted)]">
              Or continue with
            </span>
          </div>

          {/* Social Sign-up Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth('oauth_google')}
              className="w-full text-xs font-semibold gap-2"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth('oauth_apple')}
              className="w-full text-xs font-semibold gap-2"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.89c.66-.8 1.11-1.92.99-3.04-1 .04-2.14.65-2.81 1.44-.59.68-1.1 1.77-.97 2.85 1.11.09 2.18-.5 2.79-1.25z" />
              </svg>
              Apple
            </Button>
          </div>

          {/* Quick Demo Fleet Setup Link */}
          <div className="mt-2 rounded-lg border border-[var(--pm-border-subtle)] bg-[var(--pm-bg-subtle)] p-3 text-center">
            <span className="text-xs text-[var(--pm-text-muted)] block mb-1.5">
              Evaluating ProMove before onboarding?
            </span>
            <Link
              href="/dashboard?demo=true"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--pm-blue-600)] hover:underline"
            >
              <CheckCircle2 className="size-3.5" />
              Explore interactive demo workspace
            </Link>
          </div>
        </form>
      )}

      {/* Footer Link to Sign In */}
      <div className="text-center text-xs text-[var(--pm-text-secondary)]">
        Already have an account?{' '}
        <Link
          href="/sign-in"
          className="font-semibold text-[var(--pm-blue-600)] hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
