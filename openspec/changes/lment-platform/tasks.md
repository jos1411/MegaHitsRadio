# Tasks: LMENT Radio Platform

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,800 (28 new files, greenfield) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | 5 stacked PRs (by phase) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | PR | Focused test | Runtime harness | Rollback boundary |
|------|------|----|--------------|-----------------|-------------------|
| 1 | Scaffold, types, config, Vitest | PR 1 | `vitest run` | `npm run dev` boots | Delete scaffold files |
| 2 | BFF proxies, SSE, SWR hook | PR 2 | `vitest run` routes+hook | `curl /api/now-playing` (mock AzuraCast) | Revert `src/lib`, `src/app/api` |
| 3 | Player, now-playing, schedule UI | PR 3 | `vitest run` components | `npm run dev` + MP3 mount | Revert `src/features` |
| 4 | Manifest, SW, offline, Media Session | PR 4 | Playwright offline test | Lighthouse PWA audit | Revert `public/`, `sw.ts`, `offline.tsx` |
| 5 | Page wiring, responsive, listener count | PR 5 | `playwright test` | Mobile viewport pass | Revert `page.tsx`, CSS |

## Phase 1: Foundation

- [x] 1.1 Create `package.json` (next 14, react, swr, serwist, tailwindcss, vitest, playwright)
- [x] 1.2 Create `tsconfig.json` (strict), `next.config.ts` (Serwist, `AZURACAST_*` env), `tailwind.config.ts`, ESLint flat config
- [x] 1.3 Create `src/lib/types.ts`: NowPlayingData, ScheduleEntry, SSEPayload
- [x] 1.4 Create `src/lib/azuracast.ts`: server-only client (key from env, error handling)
- [x] 1.5 Create `vitest.config.ts`, `playwright.config.ts`, `src/app/layout.tsx`

## Phase 2: BFF & Data Layer

- [x] 2.1 Create `src/app/api/stream/route.ts`: MP3 mount proxy with key injection
- [x] 2.2 Create `src/app/api/now-playing/route.ts`: SSE proxy, key stays server-side
- [x] 2.3 Create `src/app/api/schedule/route.ts`: queue proxy
- [x] 2.4 Create `src/features/now-playing/useNowPlaying.ts`: EventSource + SWR fallback + exponential-backoff reconnect
- [x] 2.5 Tests: route key-injection/hiding; "SSE connection drops" reconnect scenario

## Phase 3: Core UI

- [x] 3.1 Create `src/features/player/PlayerContext.tsx`: play/pause/volume/live reducer
- [x] 3.2 Create `AudioPlayer.tsx`, `VolumeSlider.tsx` (localStorage), `LiveIndicator.tsx` ("EN VIVO")
- [x] 3.3 Create `src/features/now-playing/NowPlaying.tsx`: title, artist, artwork, elapsed
- [x] 3.4 Create `Schedule.tsx` + `Timeline.tsx`: next 3 tracks, AutoDJ/live segments
- [x] 3.5 Tests: `AudioPlayer.test.tsx` — play/pause toggle, volume persist, "Stream unavailable"

## Phase 4: PWA Shell

- [x] 4.1 Create `public/manifest.json` + `public/icons/` (192, 512, maskable)
- [x] 4.2 Create `src/app/sw.ts`: cache shell only, bypass stream URLs
- [x] 4.3 Create `src/app/offline.tsx`; Media Session controls in AudioPlayer
- [x] 4.4 Tests: SW never caches stream; "App shell loads offline" scenario

## Phase 5: Integration & Polish

- [x] 5.1 Create `src/app/page.tsx`: wire player, now-playing, schedule, listener count
- [x] 5.2 Mobile-first responsive layout; listener count display
- [x] 5.3 Create `e2e/player.spec.ts`: load → play → now-playing updates → offline
- [x] 5.4 Verify scenarios: DJ live/offline indicator ≤10s, listener count ≤30s, no API key in bundle (CI grep)
