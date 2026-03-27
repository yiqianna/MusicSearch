import React, { useState } from 'react';

import '../explore-page.css';

const QUICK_PICKS = [
  'Taylor Swift',
  'Daft Punk',
  'Adele',
  'Bruno Mars',
  'The Weeknd',
  'Kendrick Lamar',
];

export default function AlbumSearchForm({
  searchCallback,
  isWaiting,
  recentSearches = [],
  onRemoveRecent,
}) {
  const [queryText, setQueryText] = useState('');

  const handleChange = (event) => {
    setQueryText(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (queryText.trim().length === 0) {
      return;
    }
    searchCallback(encodeURIComponent(queryText.trim()));
  };

  const handleQuickPick = (term) => {
    setQueryText(term);
    searchCallback(encodeURIComponent(term));
  };

  const handleClear = () => {
    setQueryText('');
  };

  const hasValue = queryText.length > 0;

  return (
    <div className="ex-search-card">
      <form className="ex-input-row" onSubmit={handleSubmit}>
        <div className={`ex-input-wrap${hasValue ? ' has-value' : ''}`}>
          <svg
            className="ex-input-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="searchQuery"
            type="text"
            className="ex-search-input"
            placeholder="Try: Taylor Swift, Daft Punk, Adele…"
            autoComplete="off"
            value={queryText}
            onChange={handleChange}
          />
          <button
            type="button"
            className="ex-clear-btn"
            title="Clear"
            aria-label="Clear search"
            onClick={handleClear}
          >
            ✕
          </button>
        </div>
        <button
          type="submit"
          className="ex-search-btn"
          disabled={isWaiting}
          aria-busy={isWaiting}
        >
          {isWaiting ? (
            <span className="ex-btn-spinner" aria-label="Searching" />
          ) : (
            <>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
            </>
          )}
        </button>
      </form>

      <div className="ex-row-label">Suggestions</div>
      <div className="ex-chip-row">
        {QUICK_PICKS.map((term) => (
          <button
            key={term}
            type="button"
            className="ex-chip"
            onClick={() => handleQuickPick(term)}
          >
            {term}
          </button>
        ))}
      </div>

      {recentSearches.length > 0 && (
        <>
          <div className="ex-row-label">Recent searches</div>
          <div className="ex-chip-row">
            {recentSearches.map((term) => (
              <div key={term} className="ex-chip ex-chip-recent">
                <button
                  type="button"
                  className="ex-chip-fill"
                  onClick={() => handleQuickPick(term)}
                >
                  {term}
                </button>
                <button
                  type="button"
                  className="ex-chip-x"
                  title="Remove"
                  aria-label={`Remove ${term} from recent`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveRecent?.(term);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
