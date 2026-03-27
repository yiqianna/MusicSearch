import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { parseItunesAlbumsRss, splitTrendingAndFresh } from '../utils/itunesRss';

const RSS_TOP =
  'https://itunes.apple.com/us/rss/topalbums/limit=100/json';

function yearFromRelease(releaseDate) {
  if (!releaseDate) {
    return '—';
  }
  const y = new Date(releaseDate).getFullYear();
  return Number.isFinite(y) ? y : '—';
}

function RecCard({ album, favoriteIds, onToggleFavorite, style }) {
  const artworkLarge = (album.artworkUrl100 || '').replace(
    '100x100bb',
    '300x300bb'
  );
  const isFavorite = favoriteIds.has(album.collectionId);
  const genre = album.primaryGenreName || 'Music';
  const year = yearFromRelease(album.releaseDate);

  return (
    <div className="ex-album-wrap ex-rec-card-wrap" style={style}>
      <Link
        to={`/album/${album.collectionId}`}
        className="ex-album-card ex-rec-card"
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
          {artworkLarge || album.artworkUrl100 ? (
            <img
              className="ex-album-art-img"
              src={artworkLarge || album.artworkUrl100}
              alt={album.collectionName || 'Album'}
            />
          ) : (
            <div className="ex-art-placeholder">
              {(album.collectionName || 'Album').slice(0, 36)}
            </div>
          )}
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
}

function RecRow({ title, hint, albums, favoriteIds, onToggleFavorite }) {
  if (!albums.length) {
    return null;
  }

  return (
    <div className="ex-rec-row">
      <div className="ex-rec-row-head">
        <h2 className="ex-rec-row-title">{title}</h2>
        {hint ? <p className="ex-rec-row-hint">{hint}</p> : null}
      </div>
      <div className="ex-rec-scroller" tabIndex={0} role="region" aria-label={title}>
        <div className="ex-rec-track">
          {albums.map((album, i) => (
            <RecCard
              key={album.collectionId}
              album={album}
              favoriteIds={favoriteIds}
              onToggleFavorite={onToggleFavorite}
              style={{ animationDelay: `${0.04 * i}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomeRecommendations({ favoriteIds, onToggleFavorite }) {
  const [trending, setTrending] = useState([]);
  const [fresh, setFresh] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(RSS_TOP);
        if (!res.ok) {
          throw new Error('Could not load recommendations');
        }
        const json = await res.json();
        const parsed = parseItunesAlbumsRss(json);
        const { trending: tr, fresh: fr } = splitTrendingAndFresh(parsed, {
          freshCount: 12,
        });
        if (!cancelled) {
          setTrending(tr);
          setFresh(fr);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Failed to load');
          setTrending([]);
          setFresh([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="ex-rec-section" aria-busy="true" aria-label="Recommendations loading">
        <div className="ex-rec-skeleton-head" />
        <div className="ex-rec-skeleton-row">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ex-rec-skeleton-card" />
          ))}
        </div>
        <div className="ex-rec-skeleton-head ex-rec-skeleton-head--2" />
        <div className="ex-rec-skeleton-row">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ex-rec-skeleton-card" />
          ))}
        </div>
      </section>
    );
  }

  if (error || (!trending.length && !fresh.length)) {
    return null;
  }

  return (
    <section className="ex-rec-section" aria-label="Recommended albums">
      <div className="ex-rec-intro">
        <h2 className="ex-rec-main-title">Pick up something new</h2>
        <p className="ex-rec-main-sub">
          Chart highlights and recent drops — tap an album to preview tracks.
        </p>
      </div>
      <RecRow
        title="Trending on charts"
        hint="What listeners are playing right now"
        albums={trending}
        favoriteIds={favoriteIds}
        onToggleFavorite={onToggleFavorite}
      />
      <RecRow
        title="Fresh releases"
        hint="Newest albums in the chart feed"
        albums={fresh}
        favoriteIds={favoriteIds}
        onToggleFavorite={onToggleFavorite}
      />
    </section>
  );
}
