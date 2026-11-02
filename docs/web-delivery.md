# Compact web delivery

## Scope
MegaHitsRadio is a listener website: prominent play/pause, current-track metadata, programming, persistent audio and no commercial navigation. AzuraCast remains the administration interface. No VPS configuration or remote deployment changed.

Chosen visual reference: parent workspace `design/listener-web/03-compact.html`, mapped to existing React components and project tokens rather than copied HTML. Canvas implementation preview: http://127.0.0.1:3000.

## Observed checks
- `NODE_OPTIONS=--no-experimental-webstorage npm test`: 33 tests passed. The flag avoids this machine's Node 26 experimental localStorage conflict; plain test execution failed before implementation.
- `npx tsc --noEmit`, `git diff --check`: passed.
- Production build with public `AZURACAST_BASE_URL` and station ID passed.
- Parent Chromium layout: desktop player 760px, artwork 180px, two information columns; 390px viewport stacks the information cards with no horizontal overflow.
- The fallback-logo screenshot exposed clipping. CSS was corrected to the artboard's 64px mark; desktop/mobile rechecks measured a 125.59px mark inside the 180px cover.
- Real `/api/now-playing`: HTTP 200 with track metadata. Integration worker observed MPEG stream bytes, active browser playback, pause/resume, and the same audio object through client navigation. See `integration-correction.md` for exact results.
- Commercial URLs redirect home. Manifest/document branding is MegaHitsRadio.
- Local screenshots are generated evidence in ignored `browser-artifacts/`; the fallback visual checks intentionally suppressed metadata and blocked service workers only inside isolated test contexts, not in application code.

## Explicit limitations
The user selected **“Finish the web; defer PWA repair (recommended)”**. Service-worker registration still fails with “script evaluation failed”; no speculative SW change was made. Installability, offline support, native app packaging, physical phones and lock-screen behavior are **not verified**. Earlier failed checks remain recorded in `browser-verification.md` and are not overwritten.

`npm run lint` exits 1 with the existing Next.js ESLint setup prompt, so lint is unavailable, not passed. Dependencies were not upgraded and the blocked optional installation script was not approved.

## Local run
After installing dependencies and building with the same public configuration:

```bash
env AZURACAST_BASE_URL=http://169.58.191.184 AZURACAST_STATION_ID=1 npm run build
env AZURACAST_BASE_URL=http://169.58.191.184 AZURACAST_STATION_ID=1 npm start -- --hostname 127.0.0.1 --port 3000
```

This binds only to this computer. It is not a public deployment and does not store a password or API key. The SSH administration tunnel on port 18080 is separate.

## Local review slices
- Tracker: `8b3c83a` on `feat/megahits-listener-web`.
- Compact UI: `5a2292f` on `feat/megahits-compact-ui` (389 authored changed lines).
- AzuraCast endpoint compatibility: `9703a07` on `feat/megahits-azuracast-compat` (73 authored changed lines).
- Audio recovery: `091e977` on `feat/megahits-audio-recovery` (216 authored changed lines).

UI/API native assessments were unavailable because native required an untracked declaration; no approval is claimed. Once the isolated audio candidate was committed and untracked source was gone, ASSESS returned native medium, escalated high for concurrency, `reviewDue: false` / `under_budget`. Independent audio verification had already run; no native review START or receipt was issued. All branches remain local.

Risk: item 4 (asynchronous audio retry/media-event ordering; independent verification and functional playback checks completed).
