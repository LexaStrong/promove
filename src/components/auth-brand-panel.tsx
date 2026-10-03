import Link from 'next/link';

export default function AuthBrandPanel() {
  return (
    <aside className="pm-login-brand-panel" aria-label="About ProMove">
      <Link href="/" className="pm-login-splash-link" aria-label="ProMove home">
        <picture className="pm-login-splash">
          <source media="(max-width: 560px)" srcSet="/auth-splash-mobile.png" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/auth-splash-desktop.png"
            alt="ProMove fleet vehicles on a scenic road"
            fetchPriority="high"
          />
        </picture>
      </Link>
    </aside>
  );
}