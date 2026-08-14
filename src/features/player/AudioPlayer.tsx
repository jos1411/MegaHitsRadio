"use client";

import { useEffect, useRef } from "react";

import { usePlayer } from "./PlayerContext";
import { VolumeSlider } from "./VolumeSlider";

export function AudioPlayer() {
  const { state, audioRef, playStream, dispatch } = usePlayer();
  const startedRef = useRef(false);

  const { status } = state;
  const isPlaying = status === "playing";
  const unavailable = status === "unavailable";

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      playStream("/api/stream");
    }
  }, [playStream]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || unavailable) return;

    if (isPlaying) {
      audio.pause();
      dispatch({ type: "PAUSE" });
    } else {
      audio
        .play()
        .then(() => dispatch({ type: "PLAY" }))
        .catch(() => dispatch({ type: "SET_STATUS", status: "unavailable" }));
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-xl bg-surface p-3">
      <button
        type="button"
        onClick={toggle}
        disabled={unavailable}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPlaying ? (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {unavailable && (
        <p className="text-sm text-accent" role="alert">
          Stream unavailable
        </p>
      )}

      <div className="ml-auto">
        <VolumeSlider />
      </div>
    </div>
  );
}
