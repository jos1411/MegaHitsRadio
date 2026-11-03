# LMENT — Radio Online

A compact radio player: listen live, see what's playing, and check the schedule.
Built with maintained Next.js (App Router) as a BFF proxy in front of a self-hosted
[AzuraCast](https://www.azuracast.com) backend.

## Stack

- **Frontend**: Next.js 16 App Router + React 19 + TypeScript (strict) + TailwindCSS
- **Backend**: AzuraCast (self-hosted radio automation)
- **Real-time**: Server-Sent Events (SSE) proxied through the BFF
- **Audio**: HTML5 `<audio>` streaming the Icecast MP3 mount
- **Service worker**: Serwist integration retained; installability/offline support is not claimed
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

- Node.js 22.12+ for the current Wrangler/Vite tooling
- npm
- An AzuraCast install with a station and an MP3 mount; public reading/listening does not require an API key

## Local development

```bash
npm ci
AZURACAST_BASE_URL=https://your-verified-origin.example npm run dev
```

Set `AZURACAST_STATION_ID` if the station is not `1`. Public reading and
listening do not require an API key. Any future private API key belongs only in
server-side runtime secrets, never in a browser bundle or checked-in file.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AZURACAST_BASE_URL` | yes | Base URL of your AzuraCast install (no trailing slash). |
| `AZURACAST_API_KEY` | no | Optional server-only credential if a future private API operation needs it. |
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
| `npm run cf:build` | Build the Cloudflare Worker bundle with OpenNext. |
| `npm run cf:preview` | Preview the built Worker locally with Wrangler. |

## PWA icons

Icons live in `public/icons/`. To regenerate the PNGs:

```bash
node scripts/generate-icons.mjs
```

## Deployment

The supported hosting target is Cloudflare Workers via OpenNext. See
[`docs/cloudflare-deployment.md`](docs/cloudflare-deployment.md) for the
owner-managed configuration, local Worker preview, dependency-advisory
exposure classification, and deployment checklist. The retained dependency
audit still has transitive findings; do not treat this tree as audit-clean.
A Worker asset URL served over HTTPS does not prove TLS from the Worker to the
AzuraCast origin. Origin TLS must be independently verified. Deployment,
account changes, and VPS changes are not performed here.

## AzuraCast setup checklist

1. Create a station and enable a **MP3** mount (iOS Safari needs MP3).
2. Public reading/listening does not require an API key. Only create one if a future private server-side operation needs it; store it as a runtime secret, never in source or client configuration.
3. For live DJs: create a streamer/DJ account in AzuraCast — DJs connect with
   their stream key via BUTT/Mixxx/OBS. The app detects `is_live` automatically.

## Notes

- The service worker never caches the audio stream or the real-time API routes
  (`/api/stream`, `/api/now-playing`, `/api/schedule` are `NetworkOnly`). PWA
  installability/offline support is not claimed as part of the hosting work.
- Full e2e and the "no API key in bundle" CI grep are set up to run against a
  real or mocked AzuraCast; see `e2e/`.
