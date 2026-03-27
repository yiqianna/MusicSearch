# MusicSearch

MusicSearch is a React + Vite web app for exploring albums and previewing tracks through the iTunes Search API.

The current codebase includes a working MVP search flow and album detail route. This repository is being extended from a classroom prototype into a complete web experience.

## Project Structure

- `frontend/`: main frontend app (source code, Vite config, local app scripts)
- `__mocks__/`: test mocks used by legacy Jest tests
- root `package.json`: workspace-level scripts and test config

## Quick Start

```bash
# install root dependencies (for tests/tooling)
npm install

# install frontend dependencies
npm install --prefix frontend

# start frontend dev server
npm run dev
```

## Available Scripts

From the repository root:

- `npm run dev` - run frontend in development mode
- `npm run build` - build production bundle
- `npm run preview` - preview production build locally
- `npm run lint` - lint frontend source
- `npm run test` - run legacy Jest test suite

## Roadmap

- Refine UI/UX and interaction design
- Improve metadata display and browsing experience
- Add richer filtering and discovery features
- Introduce deployment pipeline and production readiness checks
