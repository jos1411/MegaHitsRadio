# T3 browser verification

Run against the parent-managed production server at `http://127.0.0.1:3000`; no server/build lifecycle actions were taken. Browser: isolated Chromium via `/home/jose/.local/bin/agent-playwright python -`, desktop 1440×1000 and mobile 390×844. Screenshots: `browser-artifacts/desktop.png`, `browser-artifacts/mobile.png`.

## Results by spec

- **S1 — partial.** Rendered home/header/footer contained no promotion or advertising copy (visible body text also had no `promoc` match). `/servicios`, `/contacto`, and `/galeria` each returned HTTP 307 on direct request. The live now-playing endpoint returned HTTP 502 `{"error":"unavailable"}`. No admin/VPS actions performed.
- **S2 — partial.** Desktop and 390px mobile rendered without horizontal overflow (document scroll width equaled viewport width). Keyboard Tab focus produced a visible 3px solid outline on the header link. Reduced-motion media query matched in the reduced-motion context; rendered duration/animation behavior was not established. Initial page had no audio element and did not autoplay. Clicking “Escuchar en vivo” displayed “Pausar”/“Conectando…” and made repeated `/api/stream` requests, but no media element reached playing state within the single 12-second observation window.
- **S3 — pass for observed public branding.** Document title was `MegaHitsRadio — Radio en vivo`; rendered header/home/footer used `MegaHitsRadio`; `/manifest.json` returned HTTP 200 with `name` and `short_name` set to `MegaHitsRadio`.
- **S4 — partial/unverified due upstream availability.** `/api/now-playing` returned 502, so current metadata and real artwork/error fallback could not be verified. `/api/art` without parameters returned 400, not a valid artwork probe. Stream requests were observed but there were no stream bytes/media playback to establish audio readiness. Since playback never started, pause and persistence of a playing singleton/source through client navigation could not be tested; the navigation probe found no audio element before or after navigating to `/programacion`.

## Console, errors, and context probe

The primary and second-context pages each reported a service-worker registration error (`/sw.js`: script evaluation failed) and console resource failures corresponding to upstream 502 responses. No uncaught application page errors were observed. A separate context seeded `localStorage['lment:volume']='0.35'` before page hydration; its rendered volume range value was `0.35`, and no audio element was present. These checks do not prove native phone/lock-screen behavior or installed-PWA behavior; those were not tested.

## Failed, skipped, pending

- Failed/unavailable: now-playing HTTP 502; stream did not become playable within the bounded 12-second wait; service-worker script evaluation failed.
- Skipped: metadata-dependent artwork fallback (no now-playing data); pause/singleton/source retention during active playback (no active source); reduced-motion animation effect (only media-query matching was observed); native phone, lock-screen, and installed-PWA checks.
- Pending: upstream AzuraCast-backed now-playing and actual stream availability, then repeat the dependent checks when the parent authorizes another verification.

## Key Learnings

1. At verification time the app served the page and manifest locally, but `/api/now-playing` returned HTTP 502.
2. The 390px mobile document and 1440px desktop document had no horizontal overflow.
3. A visible 3px keyboard focus outline and the seeded `0.35` volume value were observed in rendered browser state.
4. The play control initiated `/api/stream` requests but no playable audio state was reached during the one bounded wait.
5. Chromium reported `/sw.js` evaluation failure in both browser contexts; browser testing does not establish native-device or installed-PWA behavior.
