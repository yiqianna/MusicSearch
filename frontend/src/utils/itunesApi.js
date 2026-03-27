/**
 * iTunes HTTP API + artwork URLs.
 *
 * - Dev: `/itunes-api` and `/mzstatic` are proxied by Vite (see vite.config.js).
 * - Production default: direct `https://itunes.apple.com` (free Firebase Hosting).
 * - Optional: `VITE_ITUNES_API_BASE` / `VITE_ARTWORK_PROXY` (e.g. Cloudflare Worker).
 * - Rare: `VITE_FIREBASE_ITUNES_PROXY` if you add your own same-origin rewrites.
 */

function sameOriginProxyEnabled() {
  if (import.meta.env.DEV) return true;
  return String(import.meta.env.VITE_FIREBASE_ITUNES_PROXY || '').toLowerCase() === 'true';
}

export function getItunesOrigin() {
  const custom = import.meta.env.VITE_ITUNES_API_BASE?.trim().replace(/\/$/, '');
  if (custom) return custom;
  if (sameOriginProxyEnabled()) return '/itunes-api';
  return 'https://itunes.apple.com';
}

function joinOrigin(path) {
  const origin = getItunesOrigin();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${p}`;
}

export function searchAlbumsUrl(encodedSearchTerm) {
  return joinOrigin(
    `/search?limit=25&term=${encodedSearchTerm}&entity=album&country=us`
  );
}

export function lookupAlbumUrl(collectionId) {
  const id = encodeURIComponent(String(collectionId));
  return joinOrigin(`/lookup?id=${id}&limit=50&entity=song`);
}

export function topAlbumsRssJsonUrl() {
  return joinOrigin('/us/rss/topalbums/limit=100/json');
}

const PROXY_HINT =
  'Free fix: run `cd frontend && npx wrangler deploy`, then create `frontend/.env.production.local` with ' +
  'VITE_ITUNES_API_BASE=https://<your-worker>.workers.dev (no trailing slash), VITE_ARTWORK_PROXY=https://<your-worker>.workers.dev/image, and `npm run deploy` again.';

/**
 * Parse iTunes API / RSS JSON. Apple often returns HTTP 200 + HTML (captcha, block page)
 * on some networks — JSON.parse then fails with a vague error.
 */
export function parseItunesJsonBody(text, httpOk) {
  const trimmed = (text || '').replace(/^\uFEFF/, '').trim();
  if (!trimmed) {
    throw new Error(
      httpOk
        ? `iTunes returned an empty body. ${PROXY_HINT}`
        : 'Empty response from server.'
    );
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    const looksHtml = /^[\s\r\n]*</.test(trimmed) || /<html[\s>]/i.test(trimmed.slice(0, 800));
    if (looksHtml) {
      throw new Error(
        `Your network returned a web page instead of iTunes data (common with regional filtering). ${PROXY_HINT}`
      );
    }
    throw new Error(
      `iTunes response was not valid JSON. ${PROXY_HINT}`
    );
  }
}

/** Non-empty at build time when .env.production.local sets the Worker URL. */
function workerBaseAtBuildTime() {
  return (import.meta.env.VITE_ITUNES_API_BASE || '').trim();
}

/** Map low-level fetch errors to a clearer UI message. */
export function friendlyItunesNetworkError(err) {
  const m = (err && err.message) ? String(err.message) : '';
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(m)) {
    const fb = String(import.meta.env.VITE_FIREBASE_ITUNES_PROXY || '').toLowerCase() === 'true';
    if (fb) {
      return (
        'Cannot reach the iTunes proxy. Check VITE_ITUNES_API_BASE or Hosting rewrites.'
      );
    }
    const worker = workerBaseAtBuildTime();
    if (worker) {
      return (
        `This build uses your Worker (${worker}) but the browser could not reach it (Failed to fetch). ` +
        '1) Open the test URL below in a new tab — if it never loads, your network or an ad-blocker may block *.workers.dev; try another network, disable extensions, or add a Worker Custom Domain in Cloudflare and put that URL in VITE_ITUNES_API_BASE. ' +
        '2) Redeploy: cd frontend && npx wrangler deploy. 3) Redeploy site from repo root: npm run deploy. ' +
        `Test: ${worker}/search?term=test&entity=album&limit=1`
      );
    }
    return (
      'Cannot reach Apple iTunes from this network. ' +
      'Free fix: deploy `frontend/itunes-proxy-worker.js` with Wrangler (`cd frontend && npx wrangler deploy`), ' +
      'then create `frontend/.env.production.local` with VITE_ITUNES_API_BASE (no trailing slash), ' +
      'then from repo root: npm run deploy (must rebuild so the URL is baked into the JS).'
    );
  }
  if (m.includes('workers.dev') || m.includes('wrangler') || m.includes('VITE_ITUNES')) {
    return m;
  }
  return m || 'Network error — try again.';
}

export function artworkFetchUrl(originalSrc) {
  if (!originalSrc) return originalSrc;
  const wrap = import.meta.env.VITE_ARTWORK_PROXY?.trim();
  if (wrap) {
    const base = wrap.replace(/\/$/, '');
    return `${base}?url=${encodeURIComponent(originalSrc)}`;
  }
  if (!sameOriginProxyEnabled()) return originalSrc;
  try {
    const u = new URL(originalSrc);
    if (!/mzstatic\.com$/i.test(u.hostname)) return originalSrc;
    return `/mzstatic${u.pathname}${u.search}`;
  } catch {
    return originalSrc;
  }
}
