# LMENT — Radio Online

A PWA radio player: listen live, see what's playing, and check the schedule.
Built with Next.js 14 (App Router) as a BFF proxy in front of a self-hosted
[AzuraCast](https://www.azuracast.com) backend.

## Stack

- **Frontend**: Next.js 14 App Router + TypeScript (strict) + TailwindCSS
- **Backend**: AzuraCast (self-hosted radio automation)
- **Real-time**: Server-Sent Events (SSE) proxied through the BFF
- **Audio**: HTML5 `<audio>` streaming the Icecast MP3 mount
- **PWA**: `@serwist/next` (installable, offline shell, Media Session)
- **Testing**: Vitest + Testing Library (unit), Playwright (e2e)

## Architecture

The Next.js API routes are a BFF: they proxy AzuraCast and keep the API key
server-side. The client never sees the AzuraCast API key or stream keys.

```
Browser ──► Next.js (BFF) ──► AzuraCast API
   │  SSE /api/now-playing
   │  GET /api/stream  (Icecast MP3, key injected)
   └─ GET /api/schedule
```

- `/api/now-playing` — SSE endpoint. Polls AzuraCast's static now-playing
  endpoint (~5s) and pushes events on track/live/listener change. A plain GET
  returns a JSON snapshot.
- `/api/stream` — proxies the Icecast mount so the client has a single origin.
- `/api/schedule` — upcoming tracks / queue.

## Requirements

- Node.js 20+ (tested on v24)
- npm
- An AzuraCast install with a station, a MP3 mount, and an API key

## Local development

```bash
npm install
cp .env.example .env.local   # fill in AZURACAST_* values
npm run dev                  # http://localhost:3000
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AZURACAST_BASE_URL` | yes | Base URL of your AzuraCast install (no trailing slash). |
| `AZURACAST_API_KEY` | yes | API key from AzuraCast (Settings → My API Keys). |
| `AZURACAST_STATION_ID` | no | Station ID. Defaults to `1`. |

These are read **server-side only** (`src/lib/azuracast.ts` uses
`server-only`). They are never exposed to the client bundle.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server. |
| `npm run build` | Production build (bundles the service worker). |
| `npm start` | Serve the production build. |
| `npm test` | Run unit tests (Vitest). |
| `npm run test:e2e` | Run Playwright e2e (requires `npx playwright install`). |

## PWA icons

Icons live in `public/icons/`. To regenerate the PNGs:

```bash
node scripts/generate-icons.mjs
```

## Deployment

The app runs as a standard Node service. Recommended: co-locate on the VPS
with AzuraCast via Docker Compose.

1. Build the image / checkout the repo on the VPS.
2. Set `AZURACAST_BASE_URL`, `AZURACAST_API_KEY`, `AZURACAST_STATION_ID`.
3. `npm install && npm run build && npm start` (or run behind a reverse proxy
   with TLS — the PWA requires HTTPS for installability).

## AzuraCast setup checklist

1. Create a station and enable a **MP3** mount (iOS Safari needs MP3).
2. Create an API key (Settings → My API Keys) and copy it into `AZURACAST_API_KEY`.
3. For live DJs: create a streamer/DJ account in AzuraCast — DJs connect with
   their stream key via BUTT/Mixxx/OBS. The app detects `is_live` automatically.

## Notes

- The service worker never caches the audio stream or the real-time API routes
  (`/api/stream`, `/api/now-playing`, `/api/schedule` are `NetworkOnly`).
- Full e2e and the "no API key in bundle" CI grep are set up to run against a
  real or mocked AzuraCast; see `e2e/`.
