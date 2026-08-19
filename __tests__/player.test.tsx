import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AudioPlayer } from "@/features/player/AudioPlayer";
import {
  PlayerProvider,
  usePlayer,
} from "@/features/player/PlayerContext";

beforeEach(() => {
  Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
    configurable: true,
    writable: true,
    value: vi.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(window.HTMLMediaElement.prototype, "pause", {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AudioPlayer", () => {
  it("starts idle (no autoplay), plays on click, and toggles to paused", async () => {
    render(
      <PlayerProvider>
        <AudioPlayer />
      </PlayerProvider>,
    );

    // Autoplay is disabled: the player starts idle waiting for a user gesture.
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Play" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));

    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("shows 'Stream unavailable' but stays retry-able when playback fails", async () => {
    Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
      configurable: true,
      writable: true,
      value: vi.fn().mockRejectedValue(new Error("blocked")),
    });

    render(
      <PlayerProvider>
        <AudioPlayer />
      </PlayerProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Play" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Stream unavailable"),
    );
    // The Play button stays enabled so the user can retry manually.
    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
  });
});

function VolumeHarness() {
  const { state, dispatch } = usePlayer();
  return (
    <div>
      <button
        onClick={() => dispatch({ type: "SET_VOLUME", volume: 0.25 })}
      >
        set
      </button>
      <span data-testid="volume">{state.volume}</span>
    </div>
  );
}

describe("PlayerContext", () => {
  it("persists volume to localStorage", () => {
    render(
      <PlayerProvider>
        <VolumeHarness />
      </PlayerProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "set" }));

    expect(screen.getByTestId("volume")).toHaveTextContent("0.25");
    expect(window.localStorage.getItem("lment:volume")).toBe("0.25");
  });
});
