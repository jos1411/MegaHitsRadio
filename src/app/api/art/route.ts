import { trustedTarget, UPSTREAM_SETUP_TIMEOUT_MS } from "@/lib/upstream-policy";
import { readSafeArtwork } from "@/lib/proxy-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Proxies AzuraCast album art server-side so the browser never loads an
 * http:// image from an https:// page (mixed content). Restricted to the
 * configured AzuraCast origin to avoid acting as an open proxy.
 */
export async function GET(request: Request): Promise<Response> {
  const raw = new URL(request.url).searchParams.get("url");
  if (!raw) {
    return new Response("Missing url parameter", { status: 400 });
  }

  const target = trustedTarget(raw, "art");
  if (!target) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_SETUP_TIMEOUT_MS);
    const upstream = await fetch(target.toString(), {
      headers: { Accept: "image/jpeg,image/png,image/webp,image/gif" },
      cache: "no-store", redirect: "manual", signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!upstream.ok || !upstream.body) {
      return new Response("Artwork unavailable", { status: 502 });
    }

    const safe = await readSafeArtwork(upstream);
    if (!safe) return new Response("Artwork unavailable", { status: 502 });

    const headers = new Headers();
    headers.set("Content-Type", safe.type);
    headers.set(
      "Cache-Control",
      "public, max-age=3600, stale-while-revalidate=86400",
    );

    const body = new Uint8Array(safe.body.byteLength);
    body.set(safe.body);
    return new Response(body, { status: 200, headers });
  } catch {
    return new Response("Artwork unavailable", { status: 502 });
  }
}
