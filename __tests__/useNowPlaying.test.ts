import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNowPlaying } from "@/features/now-playing/useNowPlaying";

type Handler = (event: unknown) => void;

class MockEventSource {
  static instances: MockEventSource[] = [];

  url: string;
  onopen: Handler | null = null;
  onmessage: Handler | null = null;
  onerror: Handler | null = null;
  closed = false;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
  }

  emitOpen() {
    this.onopen?.({} as Event);
  }

  emitMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent);
  }

  emitError() {
    this.onerror?.({} as Event);
  }
}

function snapshotBody() {
  return {
    track: { title: "Initial", artist: "A", artwork: "" },
    elapsed: 0,
    duration: 0,
    isLive: false,
    liveDJName: null,
    listeners: 0,
  };
}

describe("useNowPlaying", () => {
  beforeEach(() => {
    MockEventSource.instances = [];
    vi.stubGlobal("EventSource", MockEventSource);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(snapshotBody()), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("opens an EventSource on mount", () => {
    renderHook(() => useNowPlaying());

    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toBe("/api/now-playing");
  });

  it("loads the initial snapshot via fetch", async () => {
    const { result } = renderHook(() => useNowPlaying());

    await waitFor(() =>
      expect(result.current.data?.track.title).toBe("Initial"),
    );
  });

  it("applies now_playing events and reports live", () => {
    const { result } = renderHook(() => useNowPlaying());
    const source = MockEventSource.instances[0];

    act(() => source.emitOpen());
    expect(result.current.status).toBe("live");

    act(() =>
      source.emitMessage({
        type: "now_playing",
        data: {
          track: { title: "Song 2", artist: "B", artwork: "art" },
          elapsed: 5,
          duration: 200,
          isLive: true,
          liveDJName: "Carlos",
          listeners: 9,
        },
      }),
    );

    expect(result.current.data?.track.title).toBe("Song 2");
    expect(result.current.data?.isLive).toBe(true);
    expect(result.current.status).toBe("live");
  });

  it("retains last data and reconnects with backoff on error", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useNowPlaying());
    const first = MockEventSource.instances[0];

    act(() =>
      first.emitMessage({
        type: "now_playing",
        data: {
          track: { title: "Keep", artist: "A", artwork: "" },
          elapsed: 0,
          duration: 0,
          isLive: false,
          liveDJName: null,
          listeners: 1,
        },
      }),
    );

    act(() => first.emitError());

    expect(result.current.status).toBe("reconnecting");
    expect(result.current.data?.track.title).toBe("Keep");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(MockEventSource.instances).toHaveLength(2);
  });
});
