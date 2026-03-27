import React from 'react';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket, faUser } from '@fortawesome/free-solid-svg-icons';

/**
 * Fixed top-right account control: log-in icon, or user menu with sign out.
 */
export default function AuthCorner({ user, onSignOut }) {
  if (!user) {
    return (
      <Link
        to="/login"
        className="auth-corner auth-corner--guest"
        aria-label="Log in"
      >
        <FontAwesomeIcon icon={faRightToBracket} />
      </Link>
    );
  }

  return (
    <details className="auth-corner auth-corner--user">
      <summary className="auth-corner-trigger" aria-label="Account menu">
        <FontAwesomeIcon icon={faUser} />
      </summary>
      <div className="auth-corner-panel">
        <span className="auth-corner-email" title={user.email || ''}>
          {user.email || 'Signed in'}
        </span>
        <button type="button" className="auth-corner-signout" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </details>
  );
}
