# Listener web presentation

The public home is listener-first: MegaHitsRadio identity, a fallback artwork tile, live now-playing data, and the shared play/pause control. The Compact home pairs 180px artwork with the primary listen introduction in a centered 760px composition; now-playing and the existing schedule component sit together in a two-column card region that stacks below 700px. The existing PlayerProvider and docked AudioPlayer remain mounted by the site shell so playback persists during client navigation; the shared AudioPlayer retains its Media Session integration. Programación remains the only secondary top-level destination.

The legacy `/servicios`, `/galeria`, and `/contacto` URLs redirect to `/` so direct visitors do not see commercial promotions. Commercial services/contact/gallery components remain in the codebase but are no longer linked or rendered publicly. The schedule remains driven by its existing data source; this presentation does not invent programming.

Brand metadata, manifest naming, and the SVG icon use MegaHitsRadio. No installability or offline-playback guarantee is made; the manifest is presentation metadata, not proof of a fully installable or offline-capable experience. No browser/device verification was run as part of this UI unit.

## Key Learnings

1. `SiteShell` owns the persistent `PlayerProvider` and docked player, so listener presentation can change without relocating the audio engine.
2. `useNowPlaying` supplies the track metadata and optional artwork used by both the home presentation and shared player.
3. Legacy commercial URLs now redirect to `/` rather than displaying promotional pages.
