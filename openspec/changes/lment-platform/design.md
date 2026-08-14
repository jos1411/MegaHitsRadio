# Design: LMENT Radio Platform

## Technical Approach

Next.js 14 App Router as BFF proxy between the PWA client and AzuraCast. The client is a single-page radio player with real-time now-playing via SSE, a persistent HTML5 audio element, and PWA installability. Feature-based component organization. No auth in MVP — all listeners are anonymous.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Routing | App Router | Pages Router | Server Components by default, streaming, API routes co-located. Pages Router is legacy. |
| BFF Proxy | Next.js Route Handlers (`app/api/`) | Direct client → AzuraCast | Keeps API key server-side. Single origin avoids CORS. |
| Real-time | SSE via `EventSource` | WebSocket, polling | SSE is simpler, works with HTTP/1.1, auto-reconnects. WebSocket adds complexity for one-directional data. Mobile Safari has better SSE support than WS. |
| State (player) | React Context + `useReducer` | Zustand, Redux | Single audio player + now-playing state. Context is sufficient for this scope; no need for external lib. |
| State (API data) | SWR | React Query, manual fetch | Lightweight, built-in caching, revalidation. Matches the read-heavy pattern (now-playing, schedule). |
| Audio | HTML5 `<audio>` + Media Session API | Howler.js, Video.js | Native element is lightweight, supports MP3, works with Media Session for OS-level controls. No library needed for single-stream playback. |
| PWA tooling | @serwist/next | next-pwa | Serwist is actively maintained, supports Next.js 14 App Router, and provides fine-grained SW control. next-pwa has stale maintenance. |
| Testing | Vitest + RTL + Playwright | Jest + Cypress | Vitest is faster, native ESM, works with Next.js. Playwright for E2E with multi-browser. RTL for component testing. |
| CSS | TailwindCSS | CSS Modules, styled-components | Already decided. Utility-first matches rapid PWA development. |
| Components | Feature-based (`features/player/`, `features/now-playing/`) | Atomic design | Atomic adds overhead for 5 features. Feature-based groups related components, hooks, and tests together. |

## Data Flow

```
Browser ──→ Next.js App Router ──→ AzuraCast API
  │               │                      │
  │  SSE /api/now-playing  ←── /api/now-playing (proxy)
  │  GET /api/stream       ←── /api/stream (proxy, key injected)
  │
  ├── AudioPlayer (Context) ←── /api/stream URL
  ├── NowPlaying (SWR+SSE)  ←── EventSource /api/now-playing
  └── Schedule (SWR)        ←── /api/schedule (proxy)
```

The BFF injects the AzuraCast API key server-side. The client never sees it.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Create | Dependencies: next, react, react-dom, swr, serwist, tailwindcss |
| `tsconfig.json` | Create | Strict TypeScript config |
| `next.config.ts` | Create | Serwist plugin, env vars for AzuraCast URL |
| `tailwind.config.ts` | Create | Content paths, theme extensions |
| `src/app/layout.tsx` | Create | Root layout: HTML shell, font, manifest link |
| `src/app/page.tsx` | Create | Player page (Server Component wrapper) |
| `src/app/offline.tsx` | Create | Offline fallback page |
| `src/app/api/now-playing/route.ts` | Create | SSE proxy → AzuraCast now-playing endpoint |
| `src/app/api/schedule/route.ts` | Create | GET proxy → AzuraCast schedule/queue |
| `src/app/api/stream/route.ts` | Create | GET proxy → AzuraCast Icecast mount (key injection) |
| `src/features/player/AudioPlayer.tsx` | Create | Client Component: `<audio>` + controls + Media Session |
| `src/features/player/PlayerContext.tsx` | Create | Context + reducer for play/pause/volume/live state |
| `src/features/player/VolumeSlider.tsx` | Create | Volume control with localStorage persistence |
| `src/features/player/LiveIndicator.tsx` | Create | "EN VIVO" badge driven by `is_live` flag |
| `src/features/now-playing/NowPlaying.tsx` | Create | Client Component: track title, artist, artwork, elapsed |
| `src/features/now-playing/useNowPlaying.ts` | Create | Hook: SSE connection + SWR fallback + reconnect logic |
| `src/features/schedule/Schedule.tsx` | Create | Upcoming tracks list + AutoDJ/Live timeline |
| `src/features/schedule/Timeline.tsx` | Create | Horizontal timeline visualization |
| `src/lib/azuracast.ts` | Create | Server-side AzuraCast API client (key from env) |
| `src/lib/types.ts` | Create | Shared TypeScript interfaces (Track, NowPlaying, Schedule) |
| `public/manifest.json` | Create | PWA manifest: name, icons, theme, display standalone |
| `public/icons/` | Create | PWA icons (192x192, 512x512, maskable) |
| `src/app/sw.ts` | Create | Serwist service worker: cache shell, bypass stream URLs |
| `vitest.config.ts` | Create | Vitest config with RTL setup |
| `playwright.config.ts` | Create | Playwright config for E2E tests |
| `__tests__/features/player/AudioPlayer.test.tsx` | Create | Unit tests for player controls |
| `__tests__/features/now-playing/useNowPlaying.test.ts` | Create | Unit tests for SSE hook |
| `e2e/player.spec.ts` | Create | E2E: play, pause, now-playing updates |

## Interfaces / Contracts

```typescript
// src/lib/types.ts
interface NowPlayingData {
  track: { title: string; artist: string; artwork: string };
  elapsed: number;
  duration: number;
  isLive: boolean;
  liveDJName: string | null;
  listeners: number;
}

interface ScheduleEntry {
  title: string;
  artist: string;
  startTime: string;
  source: "autodj" | "live";
  djName?: string;
}

interface SSEPayload {
  type: "now_playing" | "schedule_update";
  data: NowPlayingData | ScheduleEntry[];
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Player controls, volume persistence, SSE reconnect logic | Vitest + RTL. Mock `Audio` and `EventSource`. |
| Integration | BFF proxy routes (key injection, error handling) | Vitest + Next.js test utils. Mock AzuraCast API. |
| E2E | Full player flow: load → play → now-playing updates → offline | Playwright. Mock AzuraCast at network level. |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required — greenfield project. Deployment: Docker Compose with Next.js + AzuraCast on VPS.

## Open Questions

- [ ] Confirm AzuraCast API endpoint paths for schedule/queue (varies by version)
- [ ] Icon assets: who provides the PWA icons (192, 512, maskable)?
- [ ] Confirm MP3 mount URL format from AzuraCast config
