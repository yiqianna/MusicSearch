import React, { useEffect, useMemo, useState } from 'react';

import { Routes, Route, NavLink } from 'react-router';
import { Alert } from 'react-bootstrap';

import AlbumSearchForm from './AlbumSearchForm';
import AlbumList from './AlbumList';
import HomeRecommendations from './HomeRecommendations';
import TrackList from './TrackList';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';

import '../explore-page.css';

const ALBUM_QUERY_TEMPLATE = "https://itunes.apple.com/search?limit=25&term={searchTerm}&entity=album&attribute=allArtistTerm"
const RECENT_SEARCHES_STORAGE_KEY = 'musicsearch_recent_searches';
const FAVORITE_ALBUMS_STORAGE_KEY = 'musicsearch_favorite_albums';
const THEME_STORAGE_KEY = 'musicsearch_theme';

function App() {
  const [albumData, setAlbumData] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [favoriteAlbums, setFavoriteAlbums] = useState([]);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    try {
      const rawRecent = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (rawRecent) {
        const parsedRecent = JSON.parse(rawRecent);
        if (Array.isArray(parsedRecent)) {
          setRecentSearches(parsedRecent);
        }
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const rawFavorites = localStorage.getItem(FAVORITE_ALBUMS_STORAGE_KEY);
      if (rawFavorites) {
        const parsedFavorites = JSON.parse(rawFavorites);
        if (Array.isArray(parsedFavorites)) {
          setFavoriteAlbums(parsedFavorites);
        }
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem(FAVORITE_ALBUMS_STORAGE_KEY, JSON.stringify(favoriteAlbums));
  }, [favoriteAlbums]);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const favoriteIds = useMemo(() => (
    new Set(favoriteAlbums.map((album) => album.collectionId))
  ), [favoriteAlbums]);

  const addRecentSearch = (queryText) => {
    setRecentSearches((prev) => {
      const next = [queryText, ...prev.filter((item) => item.toLowerCase() !== queryText.toLowerCase())];
      return next.slice(0, 6);
    });
  };

  const removeRecentSearch = (term) => {
    setRecentSearches((prev) => prev.filter((t) => t.toLowerCase() !== term.toLowerCase()));
  };

  const fetchAlbumList = (searchTerm) => {
    const decodedQuery = decodeURIComponent(searchTerm).trim();
    if (!decodedQuery) {
      return;
    }

    setAlertMessage(null);
    setHasSearched(true);
    setLastQuery(decodedQuery);
    addRecentSearch(decodedQuery);
    setIsSearching(true);
    const url = ALBUM_QUERY_TEMPLATE.replace('{searchTerm}', searchTerm);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const results = data.results || [];
        const dedupedAlbums = results.filter((album, idx, arr) => (
          arr.findIndex((item) => item.collectionId === album.collectionId) === idx
        ));

        if (results.length === 0) {
          setAlertMessage("No albums found for this search.");
        }

        setAlbumData(dedupedAlbums);
      })
      .catch((err) => {
        setAlertMessage(err.message)
      })
      .then(() => {
        setIsSearching(false);
      });
  };

  const toggleFavoriteAlbum = (album) => {
    setFavoriteAlbums((prev) => {
      const exists = prev.some((item) => item.collectionId === album.collectionId);
      if (exists) {
        return prev.filter((item) => item.collectionId !== album.collectionId);
      }
      return [album, ...prev].slice(0, 30);
    });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<LandingPage theme={theme} onToggleTheme={toggleTheme} />}
      />
      <Route
        path="/login"
        element={<LoginPage theme={theme} onToggleTheme={toggleTheme} />}
      />
      <Route
        path="/explore"
        element={
          <>
            {alertMessage && (
              <Alert
                variant="danger"
                dismissible
                onClose={() => setAlertMessage(null)}
                className="app-alert explore-alert"
              >
                {alertMessage}
              </Alert>
            )}
            <div className="explore-page">
              <div className="ex-orb ex-orb1" aria-hidden />
              <div className="ex-orb ex-orb2" aria-hidden />
              <div className="ex-orb ex-orb3" aria-hidden />
              <div className="ex-page">
                <header className="ex-topbar">
                  <span className="ex-logo">MusicSearch</span>
                  <nav className="ex-nav" aria-label="Main">
                    <NavLink
                      to="/explore"
                      end
                      className={({ isActive }) => (isActive ? 'ex-nav-active' : undefined)}
                    >
                      Explore
                    </NavLink>
                    <NavLink
                      to="/favorites"
                      className={({ isActive }) => (isActive ? 'ex-nav-active' : undefined)}
                    >
                      Favorites ({favoriteAlbums.length})
                    </NavLink>
                    <NavLink
                      to="/"
                      end
                      className={({ isActive }) => (isActive ? 'ex-nav-active' : undefined)}
                    >
                      Home
                    </NavLink>
                    <NavLink
                      to="/login"
                      className={({ isActive }) => (isActive ? 'ex-nav-active' : undefined)}
                    >
                      Log in
                    </NavLink>
                  </nav>
                  <button type="button" className="ex-theme-btn" onClick={toggleTheme}>
                    {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                  </button>
                </header>
                <div className="ex-hero">
                  <h1 className="ex-hero-title">
                    Find your next <em>favourite</em> album
                  </h1>
                  <p className="ex-hero-sub">Search by artist, album name, or genre</p>
                </div>
                <HomeRecommendations
                  favoriteIds={favoriteIds}
                  onToggleFavorite={toggleFavoriteAlbum}
                />
                <AlbumSearchForm
                  searchCallback={fetchAlbumList}
                  isWaiting={isSearching}
                  recentSearches={recentSearches}
                  onRemoveRecent={removeRecentSearch}
                />
                <main>
                  <AlbumList
                    albums={albumData}
                    isWaiting={isSearching}
                    hasSearched={hasSearched}
                    lastQuery={lastQuery}
                    favoriteAlbums={favoriteAlbums}
                    favoriteIds={favoriteIds}
                    onToggleFavorite={toggleFavoriteAlbum}
                  />
                </main>
                <footer className="ex-footer">
                  <small>
                    Powered by the{' '}
                    <a href="https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/">
                      iTunes Search API
                    </a>
                    .
                  </small>
                </footer>
              </div>
            </div>
          </>
        }
      />
      <Route
        path="/favorites"
        element={
          <>
            {alertMessage && (
              <Alert
                variant="danger"
                dismissible
                onClose={() => setAlertMessage(null)}
                className="app-alert explore-alert"
              >
                {alertMessage}
              </Alert>
            )}
            <div className="explore-page">
              <div className="ex-orb ex-orb1" aria-hidden />
              <div className="ex-orb ex-orb2" aria-hidden />
              <div className="ex-orb ex-orb3" aria-hidden />
              <div className="ex-page">
                <header className="ex-topbar">
                  <span className="ex-logo">MusicSearch</span>
                  <nav className="ex-nav" aria-label="Main">
                    <NavLink
                      to="/explore"
                      end
                      className={({ isActive }) => (isActive ? 'ex-nav-active' : undefined)}
                    >
                      Explore
                    </NavLink>
                    <NavLink
                      to="/favorites"
                      className={({ isActive }) => (isActive ? 'ex-nav-active' : undefined)}
                    >
                      Favorites ({favoriteAlbums.length})
                    </NavLink>
                    <NavLink
                      to="/"
                      end
                      className={({ isActive }) => (isActive ? 'ex-nav-active' : undefined)}
                    >
                      Home
                    </NavLink>
                    <NavLink
                      to="/login"
                      className={({ isActive }) => (isActive ? 'ex-nav-active' : undefined)}
                    >
                      Log in
                    </NavLink>
                  </nav>
                  <button type="button" className="ex-theme-btn" onClick={toggleTheme}>
                    {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                  </button>
                </header>
                <div className="ex-hero">
                  <h1 className="ex-hero-title">
                    Your <em>saved</em> albums
                  </h1>
                  <p className="ex-hero-sub">Quick access to music you love</p>
                </div>
                <main>
                  <AlbumList
                    albums={favoriteAlbums}
                    isWaiting={false}
                    hasSearched={favoriteAlbums.length > 0}
                    lastQuery=""
                    favoriteAlbums={favoriteAlbums}
                    favoriteIds={favoriteIds}
                    onToggleFavorite={toggleFavoriteAlbum}
                    isFavoritesView
                  />
                </main>
                <footer className="ex-footer">
                  <small>
                    Powered by the{' '}
                    <a href="https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/">
                      iTunes Search API
                    </a>
                    .
                  </small>
                </footer>
              </div>
            </div>
          </>
        }
      />
      <Route
        path="/album/:collectionId"
        element={
          <>
            {alertMessage && (
              <Alert
                variant="danger"
                dismissible
                onClose={() => setAlertMessage(null)}
                className="app-alert album-detail-alert"
              >
                {alertMessage}
              </Alert>
            )}
            <TrackList
              setAlertMessage={setAlertMessage}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </>
        }
      />
    </Routes>
  );
}

export default App;
