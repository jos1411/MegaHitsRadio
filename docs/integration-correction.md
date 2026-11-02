# T3 integration correction evidence

Original browser evidence is retained in [`browser-verification.md`](./browser-verification.md). This document records the bounded correction and its recheck; no VPS/admin changes were made.

## Findings and correction

- Direct public GETs showed `/api/nowplaying_static/1.json` and `/api/nowplaying_static/1` returning 404, while `/api/nowplaying/1` returned 200 JSON. The 502 was an endpoint-path mismatch, not proof the upstream was offline.
- Changed `getNowPlayingStatic` in `src/lib/azuracast.ts` to request `/api/nowplaying/{stationId}`. This helper feeds both the now-playing route and stream route. Its existing `server-only` boundary, optional API-key handling, route response mappings, and art-origin guard were not changed.
- Direct upstream GET to `/listen/lment_radio/radio.mp3` returned 206 with `audio/mpeg` when ranged. The station API's listen URL also produced live MP3 bytes through the app stream proxy.
- Mocked sibling route checks remained green: `__tests__/routes.test.ts` covers now-playing JSON/SSE mapping, stream success/unavailable behavior, schedule output, and art origin allow/reject behavior. Route implementations and response shapes were not modified.

## Bounded browser recheck

Production app started only through the approved `with_server.py` helper at loopback port 3001 with the two authorized environment variables. `/api/now-playing` returned HTTP 200 `application/json` with a populated track object. `/api/stream` returned HTTP 200 `audio/mpeg`; a 1024-byte read began `fffb...`, consistent with MPEG audio data. In isolated Chromium, clicking “Escuchar en vivo” emitted a `playing` event; after 12 seconds the audio object had `paused: false`, `readyState: 3`, and `currentTime: 11.04`. Pause set `paused: true`; resuming and navigating to `/programacion` retained the same audio object, still playing with `readyState: 4` and an advanced current time.

## Service worker remains unresolved

Chromium still reports: `Failed to register a ServiceWorker for scope ('http://127.0.0.1:3001/') with script ('http://127.0.0.1:3001/sw.js'): ServiceWorker script evaluation failed`. The script GET returned 200; generated `public/sw.js` is 42,477 bytes and `node --check public/sw.js` exits 0. Playwright's service-worker event, page error, request-failure, and CDP Log probes provided no more specific exception/line detail; the browser exposes only the generic evaluation-failed diagnostic in this runtime. No speculative worker/config change was made. Registration and `navigator.serviceWorker.ready` therefore remain unverified/failed; a concrete runtime exception detail is still missing before a minimally scoped SW fix can be justified.

## Results by spec

- **S1:** Integration correction adds no promotions and makes no admin/VPS changes; prior public-scope evidence remains in the original report.
- **S2:** Live playback, pause, and singleton continuity during client navigation were observed. Service-worker registration still fails as above.
- **S3:** No naming/branding code changed; prior branding/manifest pass remains in the original report.
- **S4:** Now-playing data and live stream are now available through the app routes; API error mapping and playback continuity were observed. Native-device/installed-PWA behavior was not tested.

## Risk

**Risk: SW registration remains failed** because the configured Chromium runtime did not expose the underlying service-worker exception beyond “script evaluation failed”; no code change is justified without that specific runtime proof. Native/installed-PWA behavior remains untested.

## Key Learnings

1. AzuraCast served this station at `/api/nowplaying/1`, not the `.json` static endpoint the app used.
2. The station listen URL returned MPEG bytes during the correction check.
3. The app's `/api/now-playing` route returned mapped track metadata after correcting the upstream path.
4. Browser playback advanced, paused, resumed, and retained one audio object across client navigation.
5. Generated worker syntax checks, but Chromium's observed registration diagnostic did not expose the underlying exception.
