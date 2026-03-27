# Waveform

Waveform is a React + Vite web app for searching albums, previewing tracks, and saving favorites, powered by the [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/Searching.html).

Visit Site: https://musicsearch-1305b.web.app
## Features

- **Landing** — Animated gradient background, Google / email paths, and explore-as-guest.
- **Explore & search** — Query the catalog, recent searches, and home recommendations (charts RSS).
- **Album detail** — Track list with preview playback and a vinyl-style disc carousel.
- **Favorites** — Signed-in or local favorites with a dedicated view.
- **Auth** — Firebase (Google + email/password) when `VITE_FIREBASE_*` is configured.
- **Theming** — Light / dark mode with responsive layout and safe-area support on phones.

## Project structure

- `frontend/` — Application source, Vite config, and npm scripts
- `__mocks__/` — Stubs for Jest-style imports if you add a test runner later
- Root `package.json` — Workspace scripts and shared tooling

## Quick start

```bash
# Optional: root install (e.g. `npm run deploy` from root)
npm install

# Install frontend dependencies
npm install --prefix frontend

# Optional: configure Firebase (copy example and fill keys)
cp frontend/.env.example frontend/.env.local

# Dev server
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Without Firebase, Google/email sign-in shows a configuration message; you can still use **Explore without signing in**.

## Scripts (from repo root)

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start Vite dev server                |
| `npm run build`    | Production build in `frontend/dist` |
| `npm run preview`  | Preview the production build         |
| `npm run lint`     | ESLint on the frontend               |
| `npm run deploy`   | Build frontend + Firebase hosting (if configured) |

## Environment

See `frontend/.env.example` for `VITE_FIREBASE_*` and any API/proxy variables your deployment needs.

## License / API

Album and track metadata and previews come from Apple’s iTunes Search API; use complies with their terms for non-commercial or permitted use.
