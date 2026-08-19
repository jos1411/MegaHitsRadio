"use client";

import { usePlayer } from "@/features/player/PlayerContext";

export function ListenButton() {
  const { state, playStream, pauseStream } = usePlayer();
  const isActive =
    state.status === "playing" ||
    state.status === "loading" ||
    state.status === "reconnecting";

  return (
    <button
      type="button"
      onClick={() => (isActive ? pauseStream() : playStream())}
      className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent-hover"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        {isActive ? (
          <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
        ) : (
          <path d="M8 5v14l11-7z" />
        )}
      </svg>
      {isActive ? "Pausar" : "Escuchar en vivo"}
    </button>
  );
}
