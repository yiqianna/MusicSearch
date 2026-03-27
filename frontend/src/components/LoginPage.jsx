import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import '../login-page.css';

/**
 * Sign-in / sign-up UI. Wire Firebase Auth here before production, e.g.:
 *   import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
 *   import { app } from './firebase';
 */
export default function LoginPage({ theme = 'dark', onToggleTheme = () => {} }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter email and password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password should be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setSubmitting(true);
    try {
      // TODO: replace with Firebase Auth
      // const auth = getAuth(app);
      // if (mode === 'signin') {
      //   await signInWithEmailAndPassword(auth, trimmedEmail, password);
      // } else {
      //   await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      // }
      await new Promise((r) => setTimeout(r, 400));
      navigate('/explore', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-orb login-orb1" aria-hidden />
      <div className="login-orb login-orb2" aria-hidden />

      <header className="login-topbar">
        <Link className="login-back" to="/">
          ← Home
        </Link>
        <button type="button" className="login-theme-btn" onClick={onToggleTheme}>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </header>

      <div className="login-page-inner">
        <div className="login-card-wrap">
          <div className="login-card">
            <p className="login-brand">MusicSearch</p>
            <h1 className="login-title">
              {mode === 'signin' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="login-sub">
              {mode === 'signin'
                ? 'Sign in to sync favorites across devices once Firebase is connected.'
                : 'Sign up with email — authentication will use Firebase.'}
            </p>

            <div className="login-tabs" role="tablist" aria-label="Auth mode">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signin'}
                className={`login-tab${mode === 'signin' ? ' active' : ''}`}
                onClick={() => {
                  setMode('signin');
                  setError('');
                }}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signup'}
                className={`login-tab${mode === 'signup' ? ' active' : ''}`}
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
              >
                Sign up
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="login-field">
                <label className="login-label" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  className="login-input"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="login-field">
                <label className="login-label" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  className="login-input"
                  type="password"
                  name="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {mode === 'signup' && (
                <div className="login-field">
                  <label className="login-label" htmlFor="login-confirm">
                    Confirm password
                  </label>
                  <input
                    id="login-confirm"
                    className="login-input"
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(ev) => setConfirmPassword(ev.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              )}

              {error ? <p className="login-error" role="alert">{error}</p> : null}

              <button type="submit" className="login-submit" disabled={submitting}>
                {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <p className="login-hint">
              Demo: submit continues to Explore. Add your Firebase config and call{' '}
              <code>signInWithEmailAndPassword</code> / <code>createUserWithEmailAndPassword</code>{' '}
              in <code>LoginPage.jsx</code>.
            </p>
          </div>
        </div>

        <p className="login-footer">
          <Link to="/explore">Continue without signing in</Link>
        </p>
      </div>
    </div>
  );
}
