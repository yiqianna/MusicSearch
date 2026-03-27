/**
 * Cloudflare Worker: forward GET to iTunes (API + RSS + optional mzstatic).
 *
 * Deploy: cd frontend && npx wrangler deploy
 * Build: VITE_ITUNES_API_BASE=https://<name>.<subdomain>.workers.dev
 *
 * If *.workers.dev is blocked on your network, add a Custom Domain in Cloudflare
 * (Workers → your worker → Triggers → Custom Domains) and use that URL in VITE_ITUNES_API_BASE.
 */
const APPLE = 'https://itunes.apple.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
  'Access-Control-Max-Age': '86400',
  'Cross-Origin-Resource-Policy': 'cross-origin',
};

function applyCors(h) {
  Object.entries(corsHeaders).forEach(([k, v]) => h.set(k, v));
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...corsHeaders } });
    }

    try {
      if (request.method !== 'GET') {
        return new Response('Method not allowed', { status: 405, headers: { ...corsHeaders } });
      }

      if (url.pathname === '/image' || url.pathname === '/image/') {
        const target = url.searchParams.get('url');
        if (!target || !/^https:\/\/[^/]+\.mzstatic\.com\//i.test(target)) {
          return new Response('Bad url', { status: 400, headers: { ...corsHeaders } });
        }
        const r = await fetch(target, { headers: { Referer: '' } });
        const headers = new Headers(r.headers);
        applyCors(headers);
        headers.set('Cache-Control', 'public, max-age=86400');
        return new Response(r.body, { status: r.status, headers });
      }

      const path = `${url.pathname}${url.search}`;
      const targetUrl = `${APPLE}${path.startsWith('/') ? path : `/${path}`}`;
      const r = await fetch(targetUrl, {
        headers: {
          'User-Agent': request.headers.get('User-Agent') || 'WaveformProxy/1.0',
          Accept: request.headers.get('Accept') || 'application/json, text/json, */*',
        },
      });

      const headers = new Headers(r.headers);
      applyCors(headers);
      headers.delete('set-cookie');

      return new Response(r.body, { status: r.status, headers });
    } catch (e) {
      console.error('itunes-proxy-worker', e);
      return new Response(
        JSON.stringify({
          resultCount: 0,
          results: [],
          errorMessage: `Proxy error: ${e?.message || String(e)}`,
        }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...corsHeaders,
          },
        }
      );
    }
  },
};
