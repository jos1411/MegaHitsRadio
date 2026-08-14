"use client";

import { useEffect, useRef } from "react";

import type { NowPlayingData } from "@/lib/types";

import { usePlayer } from "./PlayerContext";
import { VolumeSlider } from "./VolumeSlider";

interface AudioPlayerProps {
  nowPlaying?: NowPlayingData | null;
}

export function AudioPlayer({ nowPlaying = null }: AudioPlayerProps) {
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

  // Media Session: OS-level metadata + play/pause controls.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;

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

    mediaSession.setActionHandler("play", () => {
      audio
        .play()
        .then(() => dispatch({ type: "PLAY" }))
        .catch(() => dispatch({ type: "SET_STATUS", status: "unavailable" }));
    });
    mediaSession.setActionHandler("pause", () => {
      audio.pause();
      dispatch({ type: "PAUSE" });
    });
    // Radio is live — seeking is not supported.
    mediaSession.setActionHandler("seekbackward", null);
    mediaSession.setActionHandler("seekforward", null);

    return () => {
      mediaSession.setActionHandler("play", null);
      mediaSession.setActionHandler("pause", null);
    };
  }, [nowPlaying, audioRef, dispatch]);

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
