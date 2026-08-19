import { getNowPlayingStatic, getStationId } from "@/lib/azuracast";
import type {
  AzuraCastNowPlaying,
  NowPlayingData,
  SSEPayload,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POLL_MS = 5000;
const HEARTBEAT_MS = 15000;

function proxyArt(art: string): string {
  if (!art) return "";
  try {
    const url = new URL(art);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return `/api/art?url=${encodeURIComponent(art)}`;
    }
  } catch {
    // Keep the raw value if it's not an absolute URL.
  }
  return art;
}

function mapNowPlaying(np: AzuraCastNowPlaying): NowPlayingData {
  return {
    track: {
      title: np.now_playing.song.title,
      artist: np.now_playing.song.artist,
      artwork: proxyArt(np.now_playing.song.art),
    },
    elapsed: np.now_playing.elapsed,
    duration: np.now_playing.duration,
    isLive: np.live.is_live,
    liveDJName: np.live.is_live ? np.live.streamer_name : null,
    listeners: np.listeners.total,
  };
}

export async function GET(request: Request): Promise<Response> {
  const accept = request.headers.get("accept") ?? "";
  const wantsStream = accept.includes("text/event-stream");

  if (!wantsStream) {
    try {
      const np = await getNowPlayingStatic(getStationId());
      return Response.json(mapNowPlaying(np));
    } catch {
      return Response.json({ error: "unavailable" }, { status: 502 });
    }
  }

  const encoder = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      let interval: ReturnType<typeof setInterval> | undefined;
      let lastSignature = "";
      let lastHeartbeat = Date.now();

      const send = (payload: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          closed = true;
        }
      };

      const tick = async () => {
        if (closed) return;
        try {
          const np = await getNowPlayingStatic(getStationId());
          const mapped = mapNowPlaying(np);
          const signature = [
            mapped.track.title,
            mapped.track.artist,
            mapped.isLive,
            mapped.liveDJName ?? "",
            mapped.listeners,
          ].join("|");

          if (signature !== lastSignature) {
            lastSignature = signature;
            const event: SSEPayload = { type: "now_playing", data: mapped };
            send(`data: ${JSON.stringify(event)}\n\n`);
          }
        } catch {
          // Transient upstream failure — keep heartbeating.
        }

        const now = Date.now();
        if (now - lastHeartbeat >= HEARTBEAT_MS) {
          lastHeartbeat = now;
          send(`: keepalive ${now}\n\n`);
        }
      };

      const cleanup = () => {
        if (closed) return;
        closed = true;
        if (interval) clearInterval(interval);
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      };

      request.signal.addEventListener("abort", cleanup);

      await tick();

      if (request.signal.aborted) {
        cleanup();
        return;
      }

      interval = setInterval(tick, POLL_MS);
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
