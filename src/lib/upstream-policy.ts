import { getBaseUrl } from "@/lib/azuracast";

export function trustedTarget(raw: string, kind: "stream" | "art"): URL | null {
  try {
    const target = new URL(raw);
    const base = new URL(getBaseUrl());
    if ((target.protocol !== "https:" && target.protocol !== "http:") || target.origin !== base.origin || target.username || target.password || target.hash) return null;
    const path = decodeURIComponent(target.pathname);
    const valid = kind === "stream"
      ? /^\/(?:listen\/[^/]+\/[^/]+|radio\/[^/]+|stream\/[^/]+)\/?$/i.test(path)
      : /^\/(?:media|uploads|art)\/(?:[a-z0-9._~-]+\/)*[a-z0-9._~-]+\.(?:jpe?g|png|webp|gif)$/i.test(path)
        || /^\/api\/station\/[a-z0-9_-]+\/art\/(?:[a-f0-9]{22}|[a-f0-9]{24,64})$/i.test(path)
        || /^\/static\/vite_dist\/assets\/generic_song-[a-z0-9_-]+\.(?:jpe?g|png|webp|gif)$/i.test(path)
        || /^\/art\.[a-z0-9]+$/i.test(path);
    return valid ? target : null;
  } catch { return null; }
}

export const ART_MAX_BYTES = 1024 * 1024;
export const UPSTREAM_SETUP_TIMEOUT_MS = 10_000;
export const ART_READ_TIMEOUT_MS = 5_000;
export const SAFE_ART_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
