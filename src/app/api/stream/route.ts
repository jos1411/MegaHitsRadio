import { getNowPlayingStatic, getStationId } from "@/lib/azuracast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveStreamUrl(): Promise<string> {
  const np = await getNowPlayingStatic(getStationId());
  return np.station.listen_url;
}

export async function GET(): Promise<Response> {
  let streamUrl: string;
  try {
    streamUrl = await resolveStreamUrl();
  } catch {
    return new Response("Stream unavailable", { status: 502 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(streamUrl, {
      headers: { "User-Agent": "LMENT/1.0", "Icy-MetaData": "0" },
    });
  } catch {
    return new Response("Stream unavailable", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("Stream unavailable", { status: 502 });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstream.headers.get("content-type") ?? "audio/mpeg",
  );
  headers.set("Cache-Control", "no-cache, no-store, no-transform");
  headers.set("Connection", "keep-alive");

  return new Response(upstream.body, { status: 200, headers });
}
