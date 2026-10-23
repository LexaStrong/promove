'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { useAuth } from '@/lib/auth-context';
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
  UserCheck,
  Sparkles,
} from 'lucide-react';

interface LoginFormProps extends React.ComponentProps<'div'> {
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

export function LoginForm({
  className,
  onSuccessRedirect = '/dashboard',
  ...props
}: LoginFormProps) {
  const router = useRouter();
  const clerk = useClerk();
  const { login: localLogin } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clerk Multi-Factor / Email Code Verification State
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Handle Sign In Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanIdentifier = identifier.trim();

    try {
      if (!clerk.loaded || !clerk.client) {
        // Fallback to local operator login when Clerk client is offline
        await localLogin(cleanIdentifier, password);
        router.push(onSuccessRedirect);
        return;
      }

      try {
        const result = await clerk.client.signIn.create({
          identifier: cleanIdentifier,
          password,
        });

        if (result.status === 'complete' && result.createdSessionId) {
          await clerk.setActive({ session: result.createdSessionId });
          router.push(onSuccessRedirect);
        } else if (result.status === 'needs_second_factor') {
          setVerifying(true);
        } else {
          router.push(onSuccessRedirect);
        }
      } catch (clerkErr: unknown) {
        const msg = getErrorMessage(clerkErr, '');

        // If Clerk publishableKey is a mock/test key, seamlessly fallback to local operator mode
        if (msg.includes('publishableKey') || msg.includes('offline') || !msg) {
          await localLogin(cleanIdentifier, password);
          router.push(onSuccessRedirect);
          return;
        }

        setError(msg || 'Invalid credentials. Please verify your email/phone and password.');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Authentication error. Please try again or use local fallback.'));
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA Verification Code
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!clerk.loaded || !clerk.client) {
        router.push(onSuccessRedirect);
        return;
      }

      const res = await clerk.client.signIn.attemptSecondFactor({
        strategy: 'totp',
        code: verificationCode.trim(),
      });

      if (res.status === 'complete' && res.createdSessionId) {
        await clerk.setActive({ session: res.createdSessionId });
        router.push(onSuccessRedirect);
      } else {
        setError('Verification code invalid or expired. Please retry.');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Verification failed. Please check your authenticator code.'));
    } finally {
      setLoading(false);
    }
  };

  // OAuth Social Sign-in via Clerk
  const handleOAuth = async (strategy: 'oauth_google' | 'oauth_apple') => {
    setError(null);
    try {
      if (clerk.client) {
        await clerk.client.signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: '/sso-callback',
          redirectUrlComplete: onSuccessRedirect,
        });
      } else {
        router.push(onSuccessRedirect);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'OAuth sign-in could not be initiated.'));
    }
  };

  // One-click Demo Login Helper
  const handleLocalOperatorLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await localLogin('+233244123456', 'password123');
      router.push(onSuccessRedirect);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      {verifying ? (
        /* 2FA Verification Flow */
        <form onSubmit={handleVerify2FA} className="space-y-4">
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--pm-text)]">
              Two-Factor Authentication
            </h1>
            <p className="text-sm text-[var(--pm-text-secondary)]">
              Enter the 6-digit authentication code from your authenticator app to complete sign in.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-[var(--pm-error-light)] text-[var(--pm-error)] border border-[var(--pm-error)]">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="two-factor-code">Authentication Code</Label>
            <Input
              id="two-factor-code"
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="text-center font-mono tracking-widest text-lg"
              autoFocus
              required
            />
          </div>

          <Button type="submit" className="w-full font-semibold" disabled={loading}>
            {loading ? 'Verifying Code...' : 'Verify and Sign In'}
            <ArrowRight className="size-4 ml-1" />
          </Button>

          <button
            type="button"
            onClick={() => setVerifying(false)}
            className="w-full text-center text-xs text-[var(--pm-text-muted)] hover:underline"
          >
            &larr; Back to sign-in credentials
          </button>
        </form>
      ) : (
        /* Primary Login Form (shadcn login-02) */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--pm-text)]">
              Welcome back
            </h1>
            <p className="text-sm text-[var(--pm-text-secondary)]">
              Enter your email or Ghana mobile number to access your fleet operations.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-[var(--pm-error-light)] text-[var(--pm-error)] border border-[var(--pm-error)]">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="identifier">Email or Ghana Mobile Phone *</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="owner@promovegh.com or 024 123 4567"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password *</Label>
                <Link
                  href="/contact"
                  className="text-xs text-[var(--pm-blue-600)] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full mt-2 font-semibold"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="size-4 ml-1" />
          </Button>

          {/* Divider */}
          <div className="relative my-2 text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-[var(--pm-border)]">
            <span className="relative z-10 bg-[var(--pm-bg)] px-2 text-[var(--pm-text-muted)]">
              Or continue with
            </span>
          </div>

          {/* Social Sign-in Buttons */}
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

          {/* Quick Demo Workspace & Local Operator Fallback Options */}
          <div className="mt-2 rounded-lg border border-[var(--pm-border-subtle)] bg-[var(--pm-bg-subtle)] p-3 text-center space-y-2">
            <div>
              <span className="text-xs text-[var(--pm-text-muted)] block mb-1">
                Evaluating ProMove without an account?
              </span>
              <Link
                href="/dashboard?demo=true"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--pm-blue-600)] hover:underline"
              >
                <CheckCircle2 className="size-3.5" />
                Explore interactive demo workspace
              </Link>
            </div>

            <div className="pt-2 border-t border-[var(--pm-border-subtle)]">
              <button
                type="button"
                onClick={handleLocalOperatorLogin}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--pm-text-secondary)] hover:text-[var(--pm-text)] transition-colors cursor-pointer"
              >
                <UserCheck className="size-3.5 text-emerald-600" />
                <span>Sign in as Local Operator (Offline Fallback)</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Footer Link to Sign Up */}
      <div className="text-center text-xs text-[var(--pm-text-secondary)]">
        Don&apos;t have an account yet?{' '}
        <Link
          href="/signup"
          className="font-semibold text-[var(--pm-blue-600)] hover:underline underline-offset-4"
        >
          Create fleet account
        </Link>
      </div>
    </div>
  );
}
