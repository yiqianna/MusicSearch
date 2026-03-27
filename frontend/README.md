# Waveform Frontend

This directory contains the frontend application for Waveform, built with React and Vite.

The app lets users:

- search for albums by artist or keyword
- browse album art results
- open an album detail route
- preview tracks directly in the browser

## Development

```bash
npm install
npm run dev
```

The dev server will print a local URL (usually `http://localhost:5173`) for previewing the app.

## Build and Preview

```bash
npm run build
npm run preview
```

## Tech Stack

- React
- React Router
- Bootstrap + React Bootstrap
- Font Awesome
- iTunes Search API (`fetch`)

## Notes

- Album and track data comes from the public iTunes Search API.
- API responses can occasionally be inconsistent; user-facing loading and error states are handled in the app.
