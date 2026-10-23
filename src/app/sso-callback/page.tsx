import React from 'react';
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--pm-bg)] p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Animated Loading Spinner */}
        <div className="size-10 animate-spin rounded-full border-4 border-[var(--pm-blue-200)] border-t-[var(--pm-blue-600)]" />
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[var(--pm-text)]">
            Completing Clerk SSO Authentication...
          </h2>
          <p className="text-xs text-[var(--pm-text-muted)]">
            Syncing credentials and connecting your fleet workspace.
          </p>
        </div>
        {/* Clerk Callback Component */}
        <AuthenticateWithRedirectCallback
          signInForceRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/onboarding"
        />
      </div>
    </div>
  );
}
