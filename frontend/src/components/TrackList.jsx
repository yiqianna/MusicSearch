import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useParams } from 'react-router';

import AuthCorner from './AuthCorner';
import AlbumCoverImg from './AlbumCoverImg';
import {
  artworkFetchUrl,
  friendlyItunesNetworkError,
  lookupAlbumUrl,
  parseItunesJsonBody,
} from '../utils/itunesApi';
import { makeVinylSvgString, paletteForIndex } from '../utils/vinylSvg';
import '../album-detail.css';

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const m = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function trackKeyFor(track) {
  return track.trackId || `${track.trackName}-${track.trackNumber}`;
}

export default function TrackList({
  setAlertMessage,
  theme = 'light',
  onToggleTheme = () => {},
  user = null,
  onSignOut = () => {},
}) {
  const [trackData, setTrackData] = useState([]);
  const [albumInfo, setAlbumInfo] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [playerThumbFailed, setPlayerThumbFailed] = useState(false);

  const audioRef = useRef(null);
  const audioListenersCleanupRef = useRef(null);
  const carouselRef = useRef(null);
  const cardRefs = useRef([]);
  const dragRef = useRef({ down: false, startX: 0, scrollLeft: 0 });

  const urlParams = useParams();

  const sortedTrackData = useMemo(
    () => [...trackData].sort((a, b) => a.trackNumber - b.trackNumber),
    [trackData]
  );

  useEffect(() => {
    setAlertMessage(null);
    setIsQuerying(true);
    setPlayerThumbFailed(false);

    const url = lookupAlbumUrl(urlParams.collectionId);

    fetch(url, { credentials: 'omit' })
      .then(async (res) => {
        const text = await res.text();
        const data = parseItunesJsonBody(text, res.ok);
        if (!res.ok) {
          const msg = data.errorMessage || data.error || `Request failed (${res.status}).`;
          throw new Error(typeof msg === 'string' ? msg : 'Could not load album.');
        }
        return data;
      })
      .then((data) => {
        const results = data.results || [];
        setAlbumInfo(results[0] || null);

        if (results.length <= 1) {
          setTrackData([]);
          setAlertMessage('No tracks were found for this album.');
          return;
        }
        setTrackData(results.slice(1));
      })
      .catch((err) => {
        setAlertMessage(friendlyItunesNetworkError(err));
        setAlbumInfo(null);
        setTrackData([]);
      })
      .finally(() => {
        setIsQuerying(false);
      });
  }, [urlParams.collectionId, setAlertMessage]);

  useEffect(() => {
    return () => {
      if (audioListenersCleanupRef.current) {
        audioListenersCleanupRef.current();
        audioListenersCleanupRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) {
      return undefined;
    }

    const onMove = (e) => {
      if (!dragRef.current.down) {
        return;
      }
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const x = e.pageX - rect.left;
      el.scrollLeft = dragRef.current.scrollLeft - (x - dragRef.current.startX);
    };
    const onUp = () => {
      dragRef.current.down = false;
    };
    const onDown = (e) => {
      dragRef.current.down = true;
      const rect = el.getBoundingClientRect();
      dragRef.current.startX = e.pageX - rect.left;
      dragRef.current.scrollLeft = el.scrollLeft;
    };

    el.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mousemove', onMove);
    return () => {
      el.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mousemove', onMove);
    };
  }, [sortedTrackData.length]);

  const stopAudio = useCallback(() => {
    if (audioListenersCleanupRef.current) {
      audioListenersCleanupRef.current();
      audioListenersCleanupRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setProgressPct(0);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const playTrackAtIndex = useCallback(
    (idx, { scroll } = { scroll: true }) => {
      const track = sortedTrackData[idx];
      if (!track) {
        return;
      }

      if (!track.previewUrl) {
        setAlertMessage('No preview available for this track.');
        return;
      }

      stopAudio();

      const audio = new Audio(track.previewUrl);
      audioRef.current = audio;

      const onTime = () => {
        if (audio.duration) {
          setProgressPct((audio.currentTime / audio.duration) * 100);
          setCurrentTime(audio.currentTime);
        }
      };
      const onMeta = () => {
        setDuration(audio.duration || 0);
      };
      const onEnded = () => {
        setIsPlaying(false);
        setProgressPct(0);
        setCurrentTime(0);
      };

      audio.addEventListener('timeupdate', onTime);
      audio.addEventListener('loadedmetadata', onMeta);
      audio.addEventListener('ended', onEnded);

      audioListenersCleanupRef.current = () => {
        audio.removeEventListener('timeupdate', onTime);
        audio.removeEventListener('loadedmetadata', onMeta);
        audio.removeEventListener('ended', onEnded);
      };

      const key = trackKeyFor(track);
      setCurrentTrackId(key);
      setActiveIdx(idx);
      setPlayerVisible(true);

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setAlertMessage('Could not play this preview.');
          setIsPlaying(false);
        });

      if (scroll && cardRefs.current[idx]) {
        cardRefs.current[idx].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    },
    [sortedTrackData, setAlertMessage, stopAudio]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrackId) {
      return;
    }
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [currentTrackId, isPlaying]);

  const goPrev = useCallback(() => {
    if (sortedTrackData.length === 0) {
      return;
    }
    const n = sortedTrackData.length;
    const start = activeIdx >= 0 ? activeIdx : 0;
    for (let step = 1; step <= n; step += 1) {
      const j = (start - step + n) % n;
      if (sortedTrackData[j].previewUrl) {
        playTrackAtIndex(j);
        return;
      }
    }
  }, [activeIdx, sortedTrackData, playTrackAtIndex]);

  const goNext = useCallback(() => {
    if (sortedTrackData.length === 0) {
      return;
    }
    const n = sortedTrackData.length;
    const start = activeIdx >= 0 ? activeIdx : -1;
    for (let step = 1; step <= n; step += 1) {
      const j = (start + step) % n;
      if (sortedTrackData[j].previewUrl) {
        playTrackAtIndex(j);
        return;
      }
    }
  }, [activeIdx, sortedTrackData, playTrackAtIndex]);

  const onSeek = useCallback(
    (e) => {
      const audio = audioRef.current;
      if (!audio || !duration) {
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      audio.currentTime = pct * duration;
    },
    [duration]
  );

  const artworkLarge = albumInfo?.artworkUrl100
    ? albumInfo.artworkUrl100.replace('100x100bb', '300x300bb')
    : '';

  const currentTrack = sortedTrackData.find((t) => trackKeyFor(t) === currentTrackId);

  return (
    <div className="album-detail-page">
      <AuthCorner user={user} onSignOut={onSignOut} />
      <div className="orb orb1" aria-hidden />
      <div className="orb orb2" aria-hidden />
      <div className="orb orb3" aria-hidden />

      <div className="page">
        <div className="album-detail-topbar">
          <Link className="back-btn" to="/explore">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M10 12L6 8l4-4" />
            </svg>
            Back to search
          </Link>
          <button
            type="button"
            className="album-detail-theme-btn"
            onClick={onToggleTheme}
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>

        {albumInfo && (
          <div className="album-card">
            <AlbumCoverImg
              variant="detail"
              className="album-art"
              src={artworkLarge}
              alt={albumInfo.collectionName || 'Album'}
              placeholderMaxLen={24}
            />
            <div className="album-meta">
              <div className="album-type-tag">Album</div>
              <div className="album-title">{albumInfo.collectionName}</div>
              <div className="album-artist">{albumInfo.artistName}</div>
              <div className="album-sub">
                <span>{albumInfo.primaryGenreName || 'Unknown genre'}</span>
                <span className="dot">·</span>
                {albumInfo.releaseDate && (
                  <>
                    <span>{new Date(albumInfo.releaseDate).getFullYear()}</span>
                    <span className="dot">·</span>
                  </>
                )}
                <span>
                  {albumInfo.trackCount
                    ? `${albumInfo.trackCount} track${albumInfo.trackCount === 1 ? '' : 's'}`
                    : `${sortedTrackData.length} track${sortedTrackData.length === 1 ? '' : 's'}`}
                </span>
              </div>
            </div>
          </div>
        )}

        {isQuerying && (
          <div className="album-detail-loading" role="status" aria-live="polite" aria-label="Loading...">
            <span className="album-detail-loading-spinner" aria-hidden />
            Loading album…
          </div>
        )}

        {!isQuerying && sortedTrackData.length > 0 && (
          <>
            <div className="section-head">
              <div className="section-title">Track Preview</div>
              <div className="section-hint">Tap any disc to play or pause · Drag to explore</div>
            </div>

            <div className="carousel-wrap">
              <div className="carousel" ref={carouselRef} id="album-detail-carousel">
                {sortedTrackData.map((track, i) => {
                  const key = trackKeyFor(track);
                  const isActive = currentTrackId === key;
                  const spinning = isActive && isPlaying;
                  const { color1, color2, accent } = paletteForIndex(i);
                  const svgId = `v-${key}`.replace(/[^a-zA-Z0-9_-]/g, '');
                  return (
                    <div
                      key={key}
                      role="button"
                      tabIndex={0}
                      className={`disc-card${isActive ? ' active' : ''}${spinning ? ' spinning' : ''}`}
                      ref={(el) => {
                        cardRefs.current[i] = el;
                      }}
                      aria-label={`${track.trackName || 'Track'} by ${track.artistName || ''}`}
                      onClick={() => {
                        if (isActive) {
                          togglePlayPause();
                        } else {
                          playTrackAtIndex(i);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (isActive) {
                            togglePlayPause();
                          } else {
                            playTrackAtIndex(i);
                          }
                        }
                      }}
                    >
                      <div className="vinyl-wrap">
                        <div className="vinyl">
                          <div
                            className={`vinyl-rotor${spinning ? ' vinyl-rotor--spinning' : ''}`}
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{
                              __html: makeVinylSvgString(svgId, color1, color2, accent),
                            }}
                          />
                        </div>
                        <div className="disc-overlay" aria-hidden>
                          <div className="play-icon">
                            <svg viewBox="0 0 24 24" aria-hidden>
                              <path
                                fill="currentColor"
                                d={
                                  spinning
                                    ? 'M6 19h4V5H6zm8-14v14h4V5z'
                                    : 'M8 5v14l11-7z'
                                }
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="disc-label">
                        {track.trackName || 'Track'}
                        <span className="track-num">Track {track.trackNumber}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="nav-dots">
                {sortedTrackData.map((track, i) => {
                  const key = trackKeyFor(track);
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`dot-item${currentTrackId && activeIdx === i ? ' active' : ''}`}
                      aria-label={`Go to track ${track.trackNumber}`}
                      onClick={() => {
                        const key = trackKeyFor(track);
                        if (activeIdx === i && currentTrackId === key) {
                          togglePlayPause();
                        } else {
                          playTrackAtIndex(i);
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}

        {!isQuerying && sortedTrackData.length === 0 && albumInfo && (
          <p className="album-detail-empty">No track previews are available.</p>
        )}

        <footer className="album-detail-footer">
          <small>
            Powered by the{' '}
            <a href="https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/Searching.html">
              iTunes Search API
            </a>
          </small>
        </footer>
      </div>

      <div className={`player-bar${playerVisible ? ' visible' : ''}`} id="album-detail-player-bar">
        <div className="player-thumb">
          {artworkLarge && !playerThumbFailed ? (
            <img
              src={artworkFetchUrl(artworkLarge)}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setPlayerThumbFailed(true)}
            />
          ) : (
            <svg className="player-thumb-disc" viewBox="0 0 40 40" aria-hidden>
              <circle cx="20" cy="20" r="20" fill="#1a2050" />
              <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="12" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="8" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="3" fill="rgba(255,255,255,0.5)" />
              <circle cx="20" cy="20" r="1.5" fill="#1a2050" />
            </svg>
          )}
        </div>
        <div className="player-info">
          <div className="player-name">{currentTrack?.trackName || '—'}</div>
          <div className="player-sub">
            {albumInfo?.artistName || ''}
            {albumInfo?.collectionName ? ` · ${albumInfo.collectionName}` : ''}
          </div>
        </div>
        <div className="progress-row">
          <span className="p-time">{formatTime(currentTime)}</span>
          <div
            className="p-track"
            role="slider"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPct)}
            onClick={onSeek}
            onKeyDown={(e) => {
              if (!duration || !audioRef.current) {
                return;
              }
              const step = 0.05;
              if (e.key === 'ArrowRight') {
                audioRef.current.currentTime = Math.min(
                  duration,
                  audioRef.current.currentTime + step * duration
                );
              }
              if (e.key === 'ArrowLeft') {
                audioRef.current.currentTime = Math.max(
                  0,
                  audioRef.current.currentTime - step * duration
                );
              }
            }}
          >
            <div className="p-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="p-time">{formatTime(duration)}</span>
        </div>
        <div className="player-controls">
          <button type="button" className="p-btn" title="Previous" onClick={goPrev}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>
          <button type="button" className="p-btn-main" title="Play/Pause" onClick={togglePlayPause}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden>
              <path
                d={
                  isPlaying
                    ? 'M6 19h4V5H6zm8-14v14h4V5z'
                    : 'M8 5v14l11-7z'
                }
              />
            </svg>
          </button>
          <button type="button" className="p-btn" title="Next" onClick={goNext}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6 18l8.5-6L6 6zm2.5-6 8.5-6v12zM16 6h2v12h-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
