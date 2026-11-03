import { getNowPlayingStatic, getStationId } from "@/lib/azuracast";
import { trustedTarget, UPSTREAM_SETUP_TIMEOUT_MS } from "@/lib/upstream-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveStreamUrl(): Promise<string> {
  const np = await getNowPlayingStatic(getStationId());
  return np.station.listen_url;
}

export async function GET(request: Request): Promise<Response> {
  let streamUrl: string;
  try {
    streamUrl = await resolveStreamUrl();
  } catch {
    return new Response("Stream unavailable", { status: 502 });
  }

  const target = trustedTarget(streamUrl, "stream");
  if (!target) return new Response("Stream unavailable", { status: 502 });

  const controller = new AbortController();
  const abort = () => controller.abort();
  request.signal.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, UPSTREAM_SETUP_TIMEOUT_MS);
  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      headers: { "User-Agent": "LMENT/1.0", "Icy-MetaData": "0" },
      redirect: "manual", signal: controller.signal,
    });
  } catch {
    request.signal.removeEventListener("abort", abort);
    clearTimeout(timeout);
    return new Response("Stream unavailable", { status: 502 });
  }
  clearTimeout(timeout);
  request.signal.removeEventListener("abort", abort);

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

  const reader = upstream.body.getReader();
  const body = new ReadableStream<Uint8Array>({
    async pull(streamController) {
      try {
        const { done, value } = await reader.read();
        if (done) { reader.releaseLock(); streamController.close(); }
        else streamController.enqueue(value);
      } catch (error) { streamController.error(error); }
    },
    async cancel(reason) { await reader.cancel(reason); },
  });
  return new Response(body, { status: 200, headers });
}
