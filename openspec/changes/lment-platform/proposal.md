# Proposal: LMENT Radio Online Platform

## Intent

Greenfield radio platform: listeners stream via a PWA web player; AutoDJ runs by default, DJs connect live anytime; a non-technical client manages playlists unaided. Validated approach: AzuraCast + Next.js BFF + SSE.

## Scope

### In Scope
- PWA player page with HTML5 audio (MP3 for iOS)
- Real-time now-playing (SSE, art, elapsed time, live flag)
- Schedule/programming view
- Simple admin (playlist management, station config)
- DJ live take-over via AzuraCast stream keys
- Installable shell (offline, Media Session)

### Out of Scope
- Listener accounts/auth; billing
- Third-party music (Spotify/YouTube — legal)
- Native apps (Capacitor/Tauri deferred)
- Analytics/monetization

## Capabilities

### New
- `radio-player`: playback, mount selection, controls
- `now-playing`: real-time song metadata via SSE proxy
- `schedule`: programming grid (AutoDJ + live slots)
- `admin-panel`: playlist/config UX for non-technical users
- `dj-live`: stream-key connection, take-over, back to AutoDJ
- `pwa-shell`: manifest, SW (shell only), offline, Media Session

### Modified
None — greenfield.

## Approach

Next.js App Router BFF: API routes proxy AzuraCast (key stays server-side); SSE for now-playing; static NP endpoint for fast load. HTML5 `<audio>` plays Icecast MP3. SW caches shell only, never audio. Admin wraps AzuraCast playlist endpoints.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/` player + admin | New | PWA UI |
| `src/app/api/` proxy + SSE | New | AzuraCast integration |
| `public/manifest.json`, `sw.js` | New | PWA shell |
| `openspec/specs/radio-platform/*` | New | 6 capability specs |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| iOS background audio (~30s) | High | Media Session, MP3 mount, device tests |
| API key exposure | High | Server-only proxy; CI grep |
| SW caches live audio | High | Never cache stream URLs |
| Client struggles with admin | Med | Playlist-only scope; usability test |
| 500 concurrent listeners | Med | VPS sizing; static NP + caching |

## Rollback Plan

Greenfield: revert previous deploy (`git revert`). AzuraCast is independent; disable PWA by removing SW registration; player falls back to direct mount URL. No migration risk.

## Dependencies

- AzuraCast on VPS (~$24/mo) with MP3 mount
- API key (read + playlist perms)
- Next.js co-located on VPS (Docker)

## Success Criteria

- [ ] Lighthouse PWA installable >= 90
- [ ] Now-playing reaches client <= 5s
- [ ] Audio on iOS Safari, Android Chrome, desktop
- [ ] Client playlist add/reorder < 5 min unaided
- [ ] DJ take-over / return cutover < 30s
- [ ] 500 concurrent listeners without dropouts
- [ ] No API key in client bundle (CI grep)
