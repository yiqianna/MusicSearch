import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

import AuthCorner from './AuthCorner';
import LandingWaveCanvas from './LandingWaveCanvas';
import '../landing-waveform.css';

const WAVE_BARS = 38;

export default function LandingPage({
  theme,
  onToggleTheme,
  user,
  onSignOut,
  onGoogleSignIn,
}) {
  const [googleBusy, setGoogleBusy] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const waveBars = useMemo(
    () =>
      Array.from({ length: WAVE_BARS }, () => ({
        h: 6 + Math.random() * 28,
        dur: 1.2 + Math.random() * 0.8,
      })),
    []
  );

  useEffect(() => {
    if (!emailModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setEmailModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [emailModalOpen]);

  const handleGoogle = async () => {
    setGoogleBusy(true);
    try {
      await onGoogleSignIn();
    } finally {
      setGoogleBusy(false);
    }
  };

  const closeModal = () => setEmailModalOpen(false);

  return (
    <div className="landing-page landing-wave">
      <LandingWaveCanvas theme={theme} />
      <AuthCorner user={user} onSignOut={onSignOut} />

      <div className="landing-wave-shell">
        <nav className="lw-nav" aria-label="Primary">
          <div className="lw-nav-left">
            <Link className="lw-logo" to="/">
              <div className="lw-logo-mark" aria-hidden>
                <div className="lw-logo-bar" />
                <div className="lw-logo-bar" />
                <div className="lw-logo-bar" />
                <div className="lw-logo-bar" />
                <div className="lw-logo-bar" />
              </div>
              <span className="lw-logo-text">Waveform</span>
            </Link>
          </div>
          <div className="lw-nav-right">
            <button type="button" className="lw-theme-toggle" onClick={onToggleTheme}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </nav>

        <main className="lw-hero">
          <div className="lw-hero-eyebrow">Now playing your discovery</div>
          <h1 className="lw-hero-title">
            Your space to explore
            <br />
            albums &amp; <em>preview tracks</em>
          </h1>
          <p className="lw-hero-sub">
            Search the catalog, save favorites, and listen to snippets — all in one calm, focused
            experience.
          </p>

          <div className="lw-cta-stack">
            {user ? (
              <Link to="/explore" className="lw-btn-explore">
                Go to Explore
                <span className="lw-arrow" aria-hidden>
                  →
                </span>
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  className="lw-btn-google"
                  onClick={handleGoogle}
                  disabled={googleBusy}
                >
                  <svg className="lw-g-icon" viewBox="0 0 24 24" aria-hidden>
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
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {googleBusy ? 'Opening Google…' : 'Continue with Google'}
                </button>

                <div className="lw-divider">
                  <span>OR</span>
                </div>

                <Link to="/explore" className="lw-btn-explore">
                  Explore without signing in
                  <span className="lw-arrow" aria-hidden>
                    →
                  </span>
                </Link>

                <button type="button" className="lw-btn-email" onClick={() => setEmailModalOpen(true)}>
                  Email sign-in
                </button>
              </>
            )}
          </div>

          <div className="lw-wave-strip" aria-hidden>
            {waveBars.map((bar, i) => (
              <div
                key={i}
                className="lw-wave-bar"
                style={{
                  height: `${bar.h}px`,
                  animationDelay: `${i * 0.045}s`,
                  animationDuration: `${bar.dur}s`,
                }}
              />
            ))}
          </div>
        </main>

        <footer className="lw-footer">
          Powered by the{' '}
          <a
            href="https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/Searching.html"
            target="_blank"
            rel="noreferrer"
          >
            iTunes Search API
          </a>
        </footer>
      </div>

      <div
        className={`lw-modal-backdrop${emailModalOpen ? ' lw-open' : ''}`}
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div
          className="lw-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lw-email-modal-title"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button type="button" className="lw-modal-close" onClick={closeModal} aria-label="Close">
            ✕
          </button>
          <h2 id="lw-email-modal-title" className="lw-modal-title">
            Sign in with email
          </h2>
          <p className="lw-modal-sub">Continue to the login page to use email and password.</p>
          <Link to="/login" className="lw-modal-cta" onClick={closeModal}>
            Continue →
          </Link>
        </div>
      </div>
    </div>
  );
}
