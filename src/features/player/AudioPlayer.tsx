"use client";

import { useEffect } from "react";

import type { NowPlayingData } from "@/lib/types";

import { usePlayer } from "./PlayerContext";
import { VolumeSlider } from "./VolumeSlider";

interface AudioPlayerProps {
  nowPlaying?: NowPlayingData | null;
}

export function AudioPlayer({ nowPlaying = null }: AudioPlayerProps) {
  const { state, playStream, pauseStream } = usePlayer();

  const { status } = state;
  const isPlaying = status === "playing";
  const isLoading = status === "loading";
  const isReconnecting = status === "reconnecting";
  const unavailable = status === "unavailable";
  const isActive = isPlaying || isLoading || isReconnecting;

  // Media Session: OS-level metadata + play/pause controls.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }
    const mediaSession = navigator.mediaSession;

    if (nowPlaying) {
      mediaSession.metadata = new MediaMetadata({
        title: nowPlaying.track.title,
        artist: nowPlaying.track.artist,
        artwork: nowPlaying.track.artwork
          ? [
              {
                src: nowPlaying.track.artwork,
                sizes: "512x512",
                type: "image/jpeg",
              },
            ]
          : [],
      });
    }

    mediaSession.setActionHandler("play", () => playStream());
    mediaSession.setActionHandler("pause", () => pauseStream());
    // Radio is live — seeking is not supported.
    mediaSession.setActionHandler("seekbackward", null);
    mediaSession.setActionHandler("seekforward", null);

    return () => {
      mediaSession.setActionHandler("play", null);
      mediaSession.setActionHandler("pause", null);
    };
  }, [nowPlaying, playStream, pauseStream]);

  const toggle = () => {
    if (isActive) {
      pauseStream();
    } else {
      playStream();
    }
  };

  const statusLabel = isReconnecting
    ? "Reconnecting"
    : isLoading
      ? "Connecting"
      : unavailable
        ? "Stream unavailable"
        : null;

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={toggle}
        aria-label={isActive ? "Pause" : "Play"}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-foreground transition-colors hover:bg-accent-hover"
      >
        {isActive ? (
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

      {statusLabel && (
        <p
          className="text-sm text-muted"
          role={unavailable ? "alert" : "status"}
        >
          {statusLabel}
        </p>
      )}

      <div className="ml-auto">
        <VolumeSlider />
      </div>
    </div>
  );
}
