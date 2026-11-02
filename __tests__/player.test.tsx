import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AudioPlayer } from "@/features/player/AudioPlayer";
import { PlayerProvider, usePlayer } from "@/features/player/PlayerContext";

beforeEach(() => {
  Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
    configurable: true, writable: true, value: vi.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(window.HTMLMediaElement.prototype, "pause", {
    configurable: true, writable: true, value: vi.fn(),
  });
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("AudioPlayer", () => {
  it("starts idle (no autoplay), plays on click, and toggles to paused", async () => {
    render(<PlayerProvider><AudioPlayer /></PlayerProvider>);
    const control = () => screen.getAllByRole("button")[0];
    expect(control()).toBeInTheDocument();
    fireEvent.click(control());
    await waitFor(() => expect(control().getAttribute("aria-label")).not.toMatch(/Escuchar|Play/));
    fireEvent.click(control());
    expect(control().getAttribute("aria-label")).toMatch(/Escuchar|Play/);
  });

  it("shows 'Stream unavailable' but stays retry-able when playback fails", async () => {
    Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
      configurable: true, writable: true, value: vi.fn().mockRejectedValue(new Error("blocked")),
    });
    render(<PlayerProvider><AudioPlayer /></PlayerProvider>);
    fireEvent.click(screen.getAllByRole("button")[0]);
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getAllByRole("button")[0]).toBeEnabled();
  });
});

function VolumeHarness() {
  const { state, dispatch, audioRef, playStream, pauseStream } = usePlayer();
  return <div>
    <button onClick={() => dispatch({ type: "SET_VOLUME", volume: 0.25 })}>set</button>
    <button onClick={playStream}>play</button>
    <button onClick={pauseStream}>pause</button>
    <button onClick={() => audioRef.current?.dispatchEvent(new Event("stalled"))}>stalled</button>
    <button onClick={() => audioRef.current?.dispatchEvent(new Event("waiting"))}>waiting</button>
    <button onClick={() => audioRef.current?.dispatchEvent(new Event("playing"))}>playing</button>
    <span data-testid="volume">{state.volume}</span>
    <span data-testid="audio-volume">{audioRef.current?.volume ?? "none"}</span>
  </div>;
}

describe("PlayerContext", () => {
  it("persists volume to localStorage", () => {
    render(<PlayerProvider><VolumeHarness /></PlayerProvider>);
    fireEvent.click(screen.getByRole("button", { name: "set" }));
    expect(screen.getByTestId("volume")).toHaveTextContent("0.25");
    expect(window.localStorage.getItem("lment:volume")).toBe("0.25");
  });

  it("rehydrates saved volume and leaves the stream idle until user action", () => {
    window.localStorage.setItem("lment:volume", "0.35");
    const play = vi.spyOn(window.HTMLMediaElement.prototype, "play");
    render(<PlayerProvider><VolumeHarness /></PlayerProvider>);
    expect(screen.getByTestId("volume")).toHaveTextContent("0.35");
    expect(play).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "play" }));
    expect(screen.getByTestId("audio-volume")).toHaveTextContent("0.35");
  });

  it.each(["not-a-number", "2", "-0.1"]) ("ignores invalid persisted volume %s", (saved) => {
    window.localStorage.setItem("lment:volume", saved);
    render(<PlayerProvider><VolumeHarness /></PlayerProvider>);
    expect(screen.getByTestId("volume")).toHaveTextContent("0.8");
  });

  it("tolerates unavailable storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("unavailable"); });
    expect(() => render(<PlayerProvider><VolumeHarness /></PlayerProvider>)).not.toThrow();
    expect(screen.getByTestId("volume")).toHaveTextContent("0.8");
  });

  it("recovers a stalled or waiting stream once and cancels retries on pause and unmount", async () => {
    vi.useFakeTimers();
    const play = vi.spyOn(window.HTMLMediaElement.prototype, "play");
    const { unmount } = render(<PlayerProvider><VolumeHarness /></PlayerProvider>);
    fireEvent.click(screen.getByRole("button", { name: "play" }));
    play.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "stalled" }));
    await vi.advanceTimersByTimeAsync(1000);
    expect(play).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "waiting" }));
    fireEvent.click(screen.getByRole("button", { name: "stalled" }));
    fireEvent.click(screen.getByRole("button", { name: "playing" }));
    await vi.advanceTimersByTimeAsync(1000);
    expect(play).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "stalled" }));
    fireEvent.click(screen.getByRole("button", { name: "pause" }));
    play.mockClear();
    await vi.advanceTimersByTimeAsync(60000);
    expect(play).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "play" }));
    play.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "stalled" }));
    unmount();
    await vi.advanceTimersByTimeAsync(60000);
    expect(play).not.toHaveBeenCalled();
  });
});
