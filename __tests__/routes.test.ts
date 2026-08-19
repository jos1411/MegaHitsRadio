import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getNowPlayingStatic: vi.fn(),
  getSchedule: vi.fn(),
  getStationId: vi.fn(() => "1"),
  getBaseUrl: vi.fn(() => "https://radio.example.com"),
}));

vi.mock("@/lib/azuracast", () => mocks);

import { GET as getNowPlayingRoute } from "@/app/api/now-playing/route";
import { GET as getScheduleRoute } from "@/app/api/schedule/route";
import { GET as getStreamRoute } from "@/app/api/stream/route";
import { GET as getArtRoute } from "@/app/api/art/route";

const sampleNP = {
  station: { listen_url: "https://radio.example.com/listen/station/mp3" },
  now_playing: {
    song: {
      title: "Song",
      artist: "Artist",
      art: "https://radio.example.com/art.jpg",
    },
    elapsed: 10,
    duration: 200,
    played_at: 1700000000,
  },
  listeners: { total: 5 },
  live: { is_live: false, streamer_name: "" },
};

describe("BFF routes: key secrecy and mapping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AZURACAST_API_KEY = "SECRET_KEY_123";
    process.env.AZURACAST_BASE_URL = "https://radio.example.com";
    mocks.getStationId.mockReturnValue("1");
    mocks.getNowPlayingStatic.mockResolvedValue(sampleNP);
    mocks.getSchedule.mockResolvedValue([
      { title: "Track", artist: "Artist", startTime: "x", source: "autodj" },
    ]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.AZURACAST_API_KEY;
    delete process.env.AZURACAST_BASE_URL;
  });

  it("schedule route returns entries without leaking the API key", async () => {
    const res = await getScheduleRoute();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(JSON.stringify(body)).not.toContain("SECRET_KEY_123");
  });

  it("now-playing snapshot returns mapped data without the API key", async () => {
    const req = new Request("http://localhost/api/now-playing", {
      headers: { accept: "application/json" },
    });
    const res = await getNowPlayingRoute(req);
    const body = await res.json();

    expect(res.headers.get("content-type")).toContain("application/json");
    expect(body.track.title).toBe("Song");
    expect(body.track.artist).toBe("Artist");
    expect(body.track.artwork).toContain("/api/art?url=");
    expect(body.listeners).toBe(5);
    expect(body.isLive).toBe(false);
    expect(JSON.stringify(body)).not.toContain("SECRET_KEY_123");
  });

  it("now-playing SSE route sets the event-stream content type", async () => {
    const controller = new AbortController();
    const req = new Request("http://localhost/api/now-playing", {
      headers: { accept: "text/event-stream" },
      signal: controller.signal,
    });
    const res = await getNowPlayingRoute(req);

    expect(res.headers.get("content-type")).toContain("text/event-stream");
    expect(res.headers.get("cache-control")).toContain("no-cache");

    controller.abort();
  });

  it("stream route proxies with the upstream audio content type", async () => {
    const upstreamBody = new ReadableStream<Uint8Array>();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(upstreamBody, {
          status: 200,
          headers: { "content-type": "audio/mpeg" },
        }),
      ),
    );

    const res = await getStreamRoute();

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("audio/mpeg");
    expect(res.headers.get("cache-control")).toContain("no-cache");
  });

  it("stream route returns 502 when the upstream is unavailable", async () => {
    mocks.getNowPlayingStatic.mockRejectedValue(new Error("down"));

    const res = await getStreamRoute();

    expect(res.status).toBe(502);
    expect(await res.text()).toBe("Stream unavailable");
  });

  it("art route proxies an AzuraCast-origin image", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("img", {
          status: 200,
          headers: { "content-type": "image/jpeg" },
        }),
      ),
    );

    const req = new Request(
      "http://localhost/api/art?url=https%3A%2F%2Fradio.example.com%2Fart.jpg",
    );
    const res = await getArtRoute(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/jpeg");

    vi.unstubAllGlobals();
  });

  it("art route rejects non-Azuracast origins", async () => {
    const req = new Request(
      "http://localhost/api/art?url=https%3A%2F%2Fevil.com%2Fx.jpg",
    );
    const res = await getArtRoute(req);

    expect(res.status).toBe(403);
  });
});
