import React from 'react';
import { Link } from 'react-router';

export default function LandingPage({ theme, onToggleTheme }) {
  return (
    <div className="landing-page">
      <div className="landing-bg" aria-hidden="true">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
        <div className="landing-grid" />
        <div className="landing-glow" />
      </div>

      <header className="landing-nav">
        <div className="landing-nav-left">
          <span className="landing-nav-muted">DISCOVER</span>
          <span className="landing-nav-muted">PREVIEW</span>
        </div>
        <div className="landing-logo">MusicSearch</div>
        <div className="landing-nav-right">
          <Link to="/login" className="landing-nav-link">Log in</Link>
          <Link to="/favorites" className="landing-nav-link">Favorites</Link>
          <button type="button" className="landing-theme-btn" onClick={onToggleTheme}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <main className="landing-hero">
        <div className="landing-chips">
          <span className="landing-chip">Search</span>
          <span className="landing-chip">Save</span>
          <span className="landing-chip">Listen</span>
        </div>
        <h1 className="landing-headline">
          Your space to explore albums and preview tracks
        </h1>
        <p className="landing-subhead">
          Search the catalog, save favorites, and listen to snippets in one calm, focused experience.
        </p>
        <Link to="/explore" className="landing-cta">
          Explore
          <span className="landing-cta-arrow" aria-hidden>→</span>
        </Link>
      </main>

      <footer className="landing-footer">
        <small>
          Powered by the{' '}
          <a href="https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/">
            iTunes Search API
          </a>
        </small>
      </footer>
    </div>
  );
}
