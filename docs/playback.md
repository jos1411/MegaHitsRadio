# Playback behavior

The player creates its persistent `HTMLAudioElement` only after an explicit play action; mounting never starts playback. Volume is restored from `lment:volume` when it is a finite value from 0 through 1. Missing, invalid, or inaccessible storage falls back to 0.8, and storage failures do not prevent playback.

While the listener has not deliberately paused, `waiting`, `stalled`, and media `error` events share one bounded exponential reconnect schedule (up to eight retries). A successful `playing` event resets the retry count and cancels a pending retry. Deliberate pause cancels recovery; unmount clears pending timers and pauses the persistent element. Automatic retry attempts preserve the existing `/api/stream` endpoint and cache-busting behavior.

Recovery is event-driven: there is no independent watchdog for a stream that emits no media events. Browser/network behavior beyond the player event contract has not been independently validated.
