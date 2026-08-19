import { getBaseUrl } from "@/lib/azuracast";

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

  let baseOrigin: string;
  let target: URL;
  try {
    baseOrigin = new URL(getBaseUrl()).origin;
    target = new URL(raw);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  if (target.origin !== baseOrigin) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: { Accept: "image/*" },
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("Artwork unavailable", { status: 502 });
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      upstream.headers.get("content-type") ?? "image/jpeg",
    );
    headers.set(
      "Cache-Control",
      "public, max-age=3600, stale-while-revalidate=86400",
    );

    return new Response(upstream.body, { status: 200, headers });
  } catch {
    return new Response("Artwork unavailable", { status: 502 });
  }
}
