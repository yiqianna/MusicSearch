import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';

import AlbumCoverImg from './AlbumCoverImg';
import '../explore-page.css';

const SORT_OPTIONS = [
  { key: 'relevance', label: 'Relevance', desc: 'Best match first' },
  { key: 'newest', label: 'Newest', desc: 'Latest releases' },
  { key: 'oldest', label: 'Oldest', desc: 'Classic first' },
  { key: 'az', label: 'A → Z', desc: 'Alphabetical' },
  { key: 'za', label: 'Z → A', desc: 'Reverse alpha' },
];

function releaseMs(album) {
  if (!album.releaseDate) {
    return 0;
  }
  const t = new Date(album.releaseDate).getTime();
  return Number.isFinite(t) ? t : 0;
}

function sortAlbums(albums, sort) {
  const copy = [...albums];
  if (sort === 'relevance') {
    return copy;
  }
  if (sort === 'newest') {
    return copy.sort((a, b) => releaseMs(b) - releaseMs(a));
  }
  if (sort === 'oldest') {
    return copy.sort((a, b) => releaseMs(a) - releaseMs(b));
  }
  if (sort === 'az') {
    return copy.sort((a, b) =>
      (a.collectionName || '').localeCompare(b.collectionName || '', undefined, { sensitivity: 'base' })
    );
  }
  if (sort === 'za') {
    return copy.sort((a, b) =>
      (b.collectionName || '').localeCompare(a.collectionName || '', undefined, { sensitivity: 'base' })
    );
  }
  return copy;
}

export default function AlbumList({
  albums,
  isWaiting,
  hasSearched,
  lastQuery,
  favoriteAlbums,
  favoriteIds,
  onToggleFavorite,
  isFavoritesView,
}) {
  const [sortKey, setSortKey] = useState('relevance');
  const [sortOpen, setSortOpen] = useState(false);
  const sortWrapRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!sortWrapRef.current?.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const sortedAlbums = useMemo(
    () => sortAlbums(albums, sortKey),
    [albums, sortKey]
  );

  const sortedFavorites = useMemo(
    () => sortAlbums(favoriteAlbums, sortKey),
    [favoriteAlbums, sortKey]
  );

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? 'Relevance';

  const renderAlbumCard = (album, index) => {
    const artworkLarge = (album.artworkUrl100 || '').replace('100x100bb', '300x300bb');
    const isFavorite = favoriteIds.has(album.collectionId);
    const genre = album.primaryGenreName || 'Music';
    const year = album.releaseDate
      ? new Date(album.releaseDate).getFullYear()
      : '—';
    const delay = `${0.05 + index * 0.045}s`;

    return (
      <div className="ex-album-wrap" key={album.collectionId}>
        <Link
          to={`/album/${album.collectionId}`}
          className="ex-album-card"
          style={{ animationDelay: delay }}
        >
          <div className="ex-album-art-wrap">
            <button
              type="button"
              className={`ex-fave-btn${isFavorite ? ' active' : ''}`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(album);
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <AlbumCoverImg
              src={artworkLarge || album.artworkUrl100}
              alt={album.collectionName || 'Album cover'}
            />
            <div className="ex-play-overlay" aria-hidden>
              <div className="ex-play-circle">
                <svg viewBox="0 0 24 24">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="ex-album-info">
            <div className="ex-album-name">{album.collectionName}</div>
            <div className="ex-album-meta-row">
              <span>{genre}</span>
              <span className="ex-dot">·</span>
              <span>{year}</span>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  if (isWaiting) {
    return (
      <div className="ex-results-section">
        <p className="ex-results-loading">Searching for albums…</p>
      </div>
    );
  }

  if (isFavoritesView && albums.length === 0) {
    return (
      <div className="ex-empty">
        <h3>No favorite albums yet</h3>
        <p>Tap the heart on any album card to save it here for quick access.</p>
      </div>
    );
  }

  if (!isFavoritesView && !hasSearched) {
    return (
      <>
        {favoriteAlbums.length > 0 && (
          <div className="ex-results-section">
            <div className="ex-favorites-strip">
              <div className="ex-row-label">Favorites</div>
              <div className="ex-album-grid">
                {sortedFavorites.map((a, i) => renderAlbumCard(a, i))}
              </div>
            </div>
          </div>
        )}
        <div className="ex-empty">
          <h3>Start your first discovery</h3>
          <p>Search for an artist or album, or tap a suggestion to see results from the iTunes catalog.</p>
        </div>
      </>
    );
  }

  if (!isFavoritesView && hasSearched && albums.length === 0) {
    return (
      <div className="ex-empty">
        <h3>No albums found</h3>
        <p>Try a different keyword or one of the suggestions above.</p>
      </div>
    );
  }

  const showSort = albums.length > 0;

  return (
    <div className="ex-results-section">
      {isFavoritesView ? (
        <div className="ex-results-header">
          <div className="ex-results-count">
            {albums.length} favorite album{albums.length === 1 ? '' : 's'}
          </div>
          {showSort && (
            <div className="ex-sort-wrap" ref={sortWrapRef}>
              <button
                type="button"
                className={`ex-results-sort${sortOpen ? ' open' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSortOpen((o) => !o);
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="14" y2="12" />
                  <line x1="4" y1="18" x2="9" y2="18" />
                </svg>
                <span>{currentSortLabel}</span>
                <span className="ex-sort-arrow">▾</span>
              </button>
              <div className={`ex-sort-dropdown${sortOpen ? ' open' : ''}`}>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`ex-sort-option${sortKey === opt.key ? ' active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSortKey(opt.key);
                      setSortOpen(false);
                    }}
                  >
                    <span>{opt.label}</span>
                    <span className="ex-sort-desc">{opt.desc}</span>
                    <span className="ex-sort-check">✓</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {!isFavoritesView && favoriteAlbums.length > 0 && (
            <div className="ex-favorites-strip">
              <div className="ex-row-label">Favorites</div>
              <div className="ex-album-grid">
                {sortedFavorites.map((a, i) => renderAlbumCard(a, i))}
              </div>
            </div>
          )}

          <div className="ex-results-header">
            <div className="ex-results-count">
              {albums.length} results for <span>&quot;{lastQuery}&quot;</span>
            </div>
            {showSort && (
              <div className="ex-sort-wrap" ref={sortWrapRef}>
                <button
                  type="button"
                  className={`ex-results-sort${sortOpen ? ' open' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSortOpen((o) => !o);
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="14" y2="12" />
                    <line x1="4" y1="18" x2="9" y2="18" />
                  </svg>
                  <span>{currentSortLabel}</span>
                  <span className="ex-sort-arrow">▾</span>
                </button>
                <div className={`ex-sort-dropdown${sortOpen ? ' open' : ''}`}>
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className={`ex-sort-option${sortKey === opt.key ? ' active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSortKey(opt.key);
                        setSortOpen(false);
                      }}
                    >
                      <span>{opt.label}</span>
                      <span className="ex-sort-desc">{opt.desc}</span>
                      <span className="ex-sort-check">✓</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="ex-album-grid">
        {sortedAlbums.map((a, i) => renderAlbumCard(a, i))}
      </div>
    </div>
  );
}
