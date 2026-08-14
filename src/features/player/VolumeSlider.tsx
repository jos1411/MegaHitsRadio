"use client";

import { usePlayer } from "./PlayerContext";

export function VolumeSlider() {
  const { state, dispatch } = usePlayer();
  const { volume, muted } = state;
  const effectiveVolume = muted ? 0 : volume;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => dispatch({ type: "TOGGLE_MUTE" })}
        aria-label={muted ? "Unmute" : "Mute"}
        className="text-muted transition-colors hover:text-foreground"
      >
        {muted ? (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M3 9v6h4l5 5V4L7 9H3z" />
            <path
              d="M16 8l6 8M22 8l-6 8"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M3 9v6h4l5 5V4L7 9H3z" />
            <path d="M16.5 12a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 16.5 12z" />
          </svg>
        )}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={effectiveVolume}
        onChange={(event) =>
          dispatch({ type: "SET_VOLUME", volume: Number(event.target.value) })
        }
        aria-label="Volume"
        className="w-24 accent-accent"
      />
    </div>
  );
}
