# Exploration: LMENT Radio Online Platform

## Exploration: LMENT Radio Online Platform

### Current State

Greenfield project. No code exists yet. The repository at `C:\Users\jose\Documents\LMENT` contains only a README.md. This is a domain exploration to inform the architecture and design of a radio online platform built with Next.js + TailwindCSS PWA frontend and AzuraCast backend.

---

## 1. AzuraCast API Surface

### Authentication Model

- **API Keys**: Created per-user in AzuraCast web UI (Settings > My API Keys). Keys inherit the user's role permissions.
- **Header methods**: `Authorization: Bearer <api_key>` (preferred) or `X-API-Key: <api_key>`
- **No OAuth/refresh tokens**: Simple bearer key model — suitable for server-side use. Client-side use requires a proxy to avoid key exposure.

### Key REST Endpoints

| Category | Endpoint | Method | Description |
|----------|----------|--------|-------------|
| **Now Playing** | `/api/nowplaying` | GET | All stations' now-playing data |
| **Now Playing** | `/api/nowplaying/{station_id}` | GET | Single station now-playing |
| **Static NP** | `/api/nowplaying_static/{station_id}.json` | GET | Cached/performance-optimized NP |
| **Static NP** | `/api/nowplaying_static/{station_id}.txt` | GET | Plain "Artist - Title" text |
| **Time** | `/api/time` | GET | Server UNIX timestamp (for elapsed calc) |
| **Stations** | `/api/stations` | GET | List all stations |
| **Stations** | `/api/admin/stations` | GET | Admin: list stations |
| **Stations** | `/api/admin/stations` | POST | Admin: create station |
| **Station** | `/api/admin/station/{id}` | PUT | Admin: update station |
| **Mounts** | `/api/station/{id}/mounts` | GET | List mount points for station |
| **Playlists** | `/api/stations/{id}/playlists` | GET | List playlists |
| **Playlists** | `/api/stations/{id}/playlists` | POST | Create playlist |
| **Schedule** | Schedule entries embedded in station/playlist objects | — | `type: "playlist" | "streamer"` |

### Now Playing Data Shape

The Now Playing API returns a rich object per station:

```typescript
interface NowPlayingResponse {
  station: {
    id: number;
    name: string;
    shortcode: string;
    description: string;
    listen_url: string;
    url: string;
    mounts: Array<{ id: number; name: string; url: string; bitrate: number; format: string }>;
    // ...
  };
  now_playing: {
    duration: number;        // track length in seconds
    elapsed: number;         // seconds since track started
    remaining: number;       // seconds until track ends
    played_at: number;       // UNIX timestamp when track started
    playlist: string;        // playlist name (if from playlist)
    is_request: boolean;     // true if listener-requested
    song: {
      id: number;
      title: string;
      artist: string;
      album: string;
      art: string;           // album art URL
    };
  };
  listeners: {
    total: number;
    unique: number;
    current: number;
  };
  live: {
    is_live: boolean;
    streamer_name: string;
    // ...
  };
  song_history: Array<{ /* same shape as now_playing.song + timestamps */ }>;
}
```

### Real-Time Capabilities

AzuraCast supports **two** high-performance real-time update mechanisms via Centrifugo:

1. **WebSocket** (`wss://{domain}/api/live/nowplaying/websocket`)
   - Client sends: `{ "subs": { "station:{shortcode}": { "recover": true } } }`
   - Receives now-playing updates as `pub.data.np`
   - Lowest latency, best for desktop

2. **Server-Sent Events (SSE)** (`https://{domain}/api/live/nowplaying/sse?cf_connect=TOKEN`)
   - Same subscription model via URL param
   - Better mobile reliability (auto-reconnect built-in)
   - Unidirectional (server → client), which is perfect for now-playing

**Recommendation**: SSE for mobile PWA (better iOS background behavior), WebSocket as fallback for desktop.

### Rate Limits & Pagination

- No documented hard rate limits, but AzuraCast caches NP responses for a few seconds after first request.
- The static NP endpoint (`/api/nowplaying_static/`) is nginx-served and very performant for high-traffic.
- Elapsed/remaining times must be calculated client-side using `/api/time` + `played_at`.

---

## 2. PWA Architecture for Radio Streaming

### Audio Streaming in a PWA

**Critical insight**: Radio streaming is fundamentally different from on-demand audio. You're not seeking, pausing, or buffering discrete files — you're maintaining a continuous connection to a live audio stream.

#### Audio Element Approach (RECOMMENDED)

```html
<audio id="radio" src="https://station.example.com/listen/station/mp3" preload="auto"></audio>
```

- The `<audio>` element handles Icecast/Shoutcast streams natively
- Browser handles buffering, reconnection, codec detection
- No MSE needed — Icecast streams are progressive HTTP
- Works on iOS Safari, Chrome, Firefox, Edge
- **This is the right approach for radio**

#### Media Source Extensions (MSE)

- Overkill for radio. MSE is for DASH/HLS adaptive bitrate streaming
- Adds complexity with no benefit for live radio streams
- Use only if you need custom buffer management or DRM

#### Web Audio API

- For audio visualization (analyser nodes, frequency data)
- NOT for stream playback — use `<audio>` element + `createMediaElementSource()` for analysis
- Good for equalizer, visualizer, or audio processing features

### Background Audio / PWA Behavior

| Platform | Background Audio | Behavior |
|----------|-----------------|----------|
| iOS Safari | **Limited** | Audio continues if screen locked, but may stop after ~30s if no user interaction. MediaSession helps. |
| Android Chrome | **Good** | Audio continues in background. MediaSession shows notification. |
| Desktop Chrome | **Excellent** | Always works. Media hub integration. |
| Desktop Firefox | **Good** | Works with MediaSession. |
| Desktop Safari | **Good** | Works with MediaSession. |

**Key strategies for background audio**:
1. **Media Session API**: Set metadata (title, artist, artwork) so OS shows proper notification
2. **Wake Lock API**: Prevent screen sleep on mobile (experimental, Chrome only)
3. **No Service Worker audio caching**: Audio is live — caching makes no sense. SW caches the shell/assets only.

### Service Worker Strategy for Radio PWA

```
Service Worker Responsibilities:
├── Cache app shell (HTML, CSS, JS, fonts, icons)
├── Cache album art images (with stale-while-revalidate)
├── Offline fallback page (show "stream offline" message)
├── Background sync for analytics events
└── DO NOT cache audio streams (they're live)
```

**Workbox strategies**:
- `CacheFirst` for static assets (app shell)
- `StaleWhileRevalidate` for album art / now-playing images
- `NetworkOnly` for audio streams and API calls
- `NetworkFirst` for now-playing API data (with offline fallback)

### PWA Manifest Structure

```json
{
  "name": "LMENT Radio",
  "short_name": "LMENT",
  "description": "Listen to LMENT radio online",
  "start_url": "/",
  "display": "standalone",
  "orientation": "any",
  "theme_color": "#1a1a2e",
  "background_color": "#0f0f23",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "screenshots": [...],
  "categories": ["music", "entertainment"]
}
```

### Push Notifications for "Now Playing"

- **NOT recommended for track changes**: Too noisy, users will disable
- **Consider for**: "DJ just went live" events, station schedule reminders
- **Implementation**: Web Push API + Service Worker push handler
- **Alternative**: Use the in-app now-playing display with SSE for real-time updates — this is better UX than push notifications

### Next.js PWA Patterns

- `next-pwa` package wraps Workbox for Next.js
- Alternative: `@serwist/next` (maintained successor, better Next.js 14+ support)
- Generate `manifest.json` via `next-metadata` or manual
- Service worker in `public/sw.js` or generated by plugin

---

## 3. Domain Concepts

### AutoDJ vs Live DJ

| Aspect | AutoDJ | Live DJ |
|--------|--------|---------|
| Source | Liquidsoap plays from playlists | Streamer connects via Icecast/Shoutcast protocol |
| Transition | Automatic playlist rotation | Liquidsoap auto-switches when DJ connects/disconnects |
| Authentication | None (built-in) | Streamer account with stream key |
| Tracking | Playlist history | Broadcast history per DJ |
| Recording | N/A | Can be recorded (configurable format/bitrate) |

**AzuraCast's model**: Liquidsoap sits between the DJ and the listener. DJs connect to Liquidsoap (not directly to Icecast). When a DJ disconnects, Liquidsoap seamlessly falls back to AutoDJ. The frontend sees this via `live.is_live` and `live.streamer_name` in the Now Playing data.

### Mount Points

- Each station has one broadcast but multiple mount points
- Mount points = different formats/bitrates of the same stream
- Common pattern: `/listen/station/mp3` (128kbps MP3) + `/listen/station/ogg` (OGG Vorbis)
- **iOS caveat**: OGG not supported on Safari — always provide MP3 mount
- Mount point URLs are configurable per-point
- `listen_url` in API response gives the direct stream URL

### Playlist Scheduling

AzuraCast playlists have:
- **Type**: `playlist` or `streamer` (schedule entry types)
- **Source**: Where media comes from
- **Order**: Sequential, random, or shuffled
- **Weight**: Priority relative to other playlists
- **Schedule**: Time-based scheduling with start/end times, rotation intervals
- **Features**: Include in requests, include in on-demand, enabled/disabled

### DJ Authentication & Stream Keys

- Streamers have a `stream_key` (like a password) for connecting
- Connection uses standard Icecast/Shoutcast protocol
- Software like OBS, Mixxx, Butt can connect
- AzuraCast tracks each DJ's broadcast history

### Listener Tracking

- `listeners.total` — total listeners
- `listeners.unique` — unique listeners (IP-based)
- `listeners.current` — current connected listeners
- History available via AzuraCast admin panel

---

## 4. Frontend Architecture Patterns

### Component Tree

```
App
├── Layout
│   ├── Header (logo, navigation)
│   ├── MobileNav (bottom tab bar)
│   └── PersistentAudioPlayer (always visible)
│       ├── PlayerBar (mini player, collapsed)
│       │   ├── PlayPauseButton
│       │   ├── NowPlayingMini (artist - title)
│       │   └── VolumeControl
│       └── PlayerDrawer (expanded, full controls)
│           ├── AlbumArt
│           ├── NowPlayingFull (title, artist, album, source info)
│           ├── ProgressBar (elapsed/remaining with server time sync)
│           ├── Controls (play, pause, volume, mute)
│           ├── StreamSelector (mount point picker)
│           └── LiveIndicator (shows if DJ is live + DJ name)
│   └── <Outlet /> (page content)
├── Pages
│   ├── HomePage
│   │   ├── HeroSection (current track, CTA to play)
│   │   ├── NowPlayingCard
│   │   ├── ScheduleWidget
│   │   └── RecentTracks
│   ├── SchedulePage
│   │   ├── ScheduleTimeline
│   │   └── DJProfiles
│   ├── TrackHistoryPage
│   │   └── TrackList (with album art, timestamps)
│   ├── AboutPage
│   └── SettingsPage
│       ├── StreamQuality
│       ├── NotificationPrefs
│       └── ThemeToggle
└── Providers
    ├── AudioProvider (audio element context)
    ├── NowPlayingProvider (SSE/WebSocket context)
    └── ThemeProvider
```

### State Management

| State | Location | Strategy |
|-------|----------|----------|
| Audio element reference | React Context (`AudioProvider`) | Single `<audio>` element, refs |
| Playback state (playing, volume, muted) | AudioProvider + local state | Derived from audio element events |
| Now Playing data | NowPlayingProvider | SSE connection, SWR for initial fetch |
| Schedule data | SWR/React Query | Polling or cached fetch |
| Track history | SWR/React Query | Paginated fetch |
| User preferences | localStorage / zustand persist | Theme, default mount, volume |
| Mount points | SWR/React Query | Fetched once, cached |

### Data Fetching Strategy

```
Initial Load:
  1. SWR: GET /api/nowplaying/{station} → populate now-playing
  2. SWR: GET /api/station/{id}/mounts → populate stream selector
  3. SWR: GET /api/stations/{id}/playlists → schedule data

Real-Time Updates:
  4. SSE or WebSocket → live now-playing updates
  5. Fallback: Poll /api/nowplaying_static/{station}.json every 15s

Time Sync:
  6. GET /api/time → calibrate client clock
  7. Client-side elapsed/remaining calculation
```

### Responsive Design Considerations

- **Mobile-first**: Player bar at bottom, expandable drawer
- **Touch targets**: Minimum 44px for play/pause, volume
- **Gestures**: Swipe up on player bar to expand drawer
- **Safe areas**: Account for notch/Dynamic Island on iOS
- **Dark mode**: Radio apps are almost always dark-themed
- **Performance**: Lazy load schedule/history pages, prioritize player

---

## 5. Architectural Approaches

### Approach A: Direct API + SSE (Minimal)

**Description**: Next.js frontend talks directly to AzuraCast API. SSE for real-time. Simple architecture.

```
Browser ←→ Next.js (SSR/CSR) ←→ AzuraCast API
                  ↕
              SSE (Centrifugo)
```

| Aspect | Detail |
|--------|--------|
| Pros | Simplest to build, minimal infra, AzuraCast handles all radio logic |
| Cons | API key exposed in client (or needs proxy), no custom auth, limited to AzuraCast's data model |
| Complexity | Low |
| Effort | 2-3 weeks MVP |

**Mitigation for API key**: Use Next.js API routes as a thin proxy (`/api/nowproxy/*`). Never expose the AzuraCast API key to the client.

### Approach B: BFF (Backend-for-Frontend) + SSE

**Description**: Next.js API routes serve as a BFF. Custom auth layer. Enriched data model. Proxy all AzuraCast calls.

```
Browser ←→ Next.js (BFF + SSR) ←→ AzuraCast API
    ↕            ↕
  SSE       Custom DB (optional)
              ↕
          Auth Provider
```

| Aspect | Detail |
|--------|--------|
| Pros | Secure API key, custom auth (email/password or OAuth), enriched responses, rate limiting, analytics |
| Cons | More infra, must maintain proxy layer, auth system to build |
| Complexity | Medium |
| Effort | 4-6 weeks MVP |

### Approach C: Decoupled Frontend + API Gateway

**Description**: Separate frontend (Next.js static export) and API gateway (Node.js/Go service). Microservice-ready.

```
Browser ←→ Next.js (Static) ←→ API Gateway ←→ AzuraCast API
                                    ↕
                              Auth + DB + Cache
```

| Aspect | Detail |
|--------|--------|
| Pros | Full control, independent scaling, custom data model, multi-station ready |
| Cons | Most complex, two deployable units, overkill for single station |
| Complexity | High |
| Effort | 8-12 weeks MVP |

---

## 6. Recommendation

**Approach B: BFF (Backend-for-Frontend) + SSE**

### Why

1. **Security**: API key stays server-side. AzuraCast API keys have full user permissions — exposing them client-side is a real risk.
2. **Auth**: You'll want custom authentication eventually (listener accounts, preferences, favorites). BFF makes this natural.
3. **Flexibility**: Can enrich now-playing data (add custom fields, aggregate across stations, cache aggressively).
4. **Performance**: BFF can cache AzuraCast responses, reducing load on AzuraCast server.
5. **Not overkill**: Still a single deployable Next.js app (API routes are the BFF). No separate service needed.
6. **Progressive**: Start with Approach A patterns (direct API calls from API routes), evolve to full BFF as features grow.

### Implementation Strategy

- **Phase 1 (MVP)**: Next.js App Router with API routes as thin proxy. SSE for real-time. Basic player UI.
- **Phase 2**: Add custom auth (NextAuth.js), listener accounts, favorites.
- **Phase 3**: Analytics dashboard, scheduling UI, DJ management features.
- **Phase 4**: Multi-station support, advanced features.

---

## 7. Risks

### Technical Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **iOS background audio limitations** | HIGH | MediaSession API + user education. May need "keep screen on" option. Test on real iOS devices early. |
| **SSE/WebSocket on iOS Safari** | MEDIUM | SSE has auto-reconnect. Test background behavior. Fallback to polling. |
| **AzuraCast API stability** | LOW | API is well-documented and stable. Pin version. Use static NP endpoint for high-traffic. |
| **Audio format compatibility** | MEDIUM | Always provide MP3 mount. OGG is optional. Test on target browsers. |
| **Service Worker caching audio** | HIGH | DO NOT cache audio streams. Use `NetworkOnly` for streams. Common mistake. |
| **API key security** | HIGH | Always proxy through Next.js API routes. Never expose AzuraCast keys client-side. |
| **AzuraCast server downtime** | MEDIUM | Offline fallback page. Show "stream offline" gracefully. Cache last known now-playing. |
| **Centrifugo connection limits** | LOW | SSE is lightweight. Monitor connection count. AzuraCast handles this. |

### Product Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Feature scope creep** | MEDIUM | Phase the build. MVP = player + now-playing. Everything else is Phase 2+. |
| **UX expectations** | MEDIUM | Radio PWA is not Spotify. Set expectations: no on-demand, no seeking, live experience. |
| **Mobile install friction** | LOW | PWA install prompts are mature. Provide clear install instructions. |

---

## 8. Similar Open Source Projects

No direct "AzuraCast + Next.js PWA" open-source projects were found. However, these are relevant references:

- **AzuraCast's own public API demo**: `https://demo.azuracast.com/api/nowplaying` — live example of the data shape
- **AzuraCast PHP API Client**: `github.com/AzuraCast/php-api-client` — reference for API interaction patterns
- **Radio Browser API** (`radio-browser.info`): Open API for internet radio stations — useful for station discovery features
- **RadioDroid** (Android): Open-source radio player — UI/UX reference for radio apps
- **PWA examples**: `github.com/nichenqin/next-pwa-example` patterns for service worker integration

### Key Patterns from the Ecosystem

1. **All radio players use `<audio>` element** — no one uses MSE for live radio
2. **MediaSession API is standard** — every radio PWA sets metadata for notifications
3. **SSE > WebSocket for mobile** — better reconnection, simpler implementation
4. **No one caches audio streams** — always `NetworkOnly` for live content
5. **Album art is king** — good album art display differentiates radio apps

---

## Key Learnings

1. AzuraCast provides SSE and WebSocket via Centrifugo for real-time now-playing updates with unidirectional server-to-client delivery.
2. The `<audio>` HTML element handles Icecast/Shoutcast streams natively without needing Media Source Extensions.
3. The Media Session API enables OS-level media notifications and hardware media key support for PWA radio players.
4. iOS Safari has background audio limitations that require MediaSession metadata and may need user interaction to maintain playback.
5. AzuraCast API keys inherit full user permissions and must never be exposed to client-side code — a BFF proxy pattern is mandatory.
