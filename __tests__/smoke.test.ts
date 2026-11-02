import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type {
  NowPlayingData,
  ScheduleEntry,
  SSEPayload,
  AzuraCastNowPlaying,
} from "@/lib/types";

describe("src/lib/types", () => {
  it("exports NowPlayingData", () => {
    const data: NowPlayingData = {
      track: { title: "Song", artist: "Artist", artwork: "/artwork.jpg" },
      elapsed: 12,
      duration: 240,
      isLive: false,
      liveDJName: null,
      listeners: 3,
    };

    expect(data.track.title).toBe("Song");
    expect(data.liveDJName).toBeNull();
    expect(data.listeners).toBe(3);
  });

  it("exports ScheduleEntry with the autodj/live source union", () => {
    const autodj: ScheduleEntry = {
      title: "Song",
      artist: "Artist",
      startTime: "2026-08-14T12:00:00Z",
      source: "autodj",
    };
    const live: ScheduleEntry = {
      title: "Live Show",
      artist: "DJ",
      startTime: "2026-08-14T13:00:00Z",
      source: "live",
      djName: "DJ Example",
    };

    expect(autodj.source).toBe("autodj");
    expect(live.djName).toBe("DJ Example");
  });

  it("exports the SSEPayload discriminated union", () => {
    const nowPlaying: SSEPayload = {
      type: "now_playing",
      data: {
        track: { title: "T", artist: "A", artwork: "art" },
        elapsed: 0,
        duration: 0,
        isLive: false,
        liveDJName: null,
        listeners: 0,
      },
    };
    const schedule: SSEPayload = {
      type: "schedule_update",
      data: [],
    };

    expect(nowPlaying.type).toBe("now_playing");
    expect(schedule.type).toBe("schedule_update");
  });

  it("exports the AzuraCastNowPlaying shape", () => {
    const np: AzuraCastNowPlaying = {
      station: { listen_url: "https://example.com/radio.mp3" },
      now_playing: {
        song: {
          title: "Song",
          artist: "Artist",
          art: "https://example.com/art.jpg",
        },
        elapsed: 5,
        duration: 200,
        played_at: 1700000000,
      },
      listeners: { total: 7 },
      live: { is_live: false, streamer_name: "" },
    };

    expect(np.now_playing.song.title).toBe("Song");
    expect(np.listeners.total).toBe(7);
    expect(np.live.is_live).toBe(false);
  });
});

describe("src/lib/azuracast", () => {
  it("rejects getNowPlaying with a clear error when env vars are missing", async () => {
    delete process.env.AZURACAST_BASE_URL;
    delete process.env.AZURACAST_API_KEY;

    const { getNowPlaying } = await import("@/lib/azuracast");

    await expect(getNowPlaying(1)).rejects.toThrow(/AZURACAST_BASE_URL/);
  });

  it("works without an API key (public read endpoints are unauthenticated)", async () => {
    process.env.AZURACAST_BASE_URL = "http://localhost:8080";
    delete process.env.AZURACAST_API_KEY;

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ station: { listen_url: "x" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { getNowPlayingStatic } = await import("@/lib/azuracast");
    const result = await getNowPlayingStatic(1);

    expect(result.station.listen_url).toBe("x");
    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://localhost:8080/api/nowplaying/1",
    );

    const init = fetchMock.mock.calls[0][1] as { headers: Record<string, string> };
    expect(init.headers).not.toHaveProperty("X-API-Key");
    expect(init.headers).not.toHaveProperty("Authorization");

    vi.unstubAllGlobals();
  });
});
