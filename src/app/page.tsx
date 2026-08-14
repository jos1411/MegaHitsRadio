"use client";

import { AudioPlayer } from "@/features/player/AudioPlayer";
import { PlayerProvider } from "@/features/player/PlayerContext";
import { NowPlaying } from "@/features/now-playing/NowPlaying";
import { useNowPlaying } from "@/features/now-playing/useNowPlaying";
import { Schedule } from "@/features/schedule/Schedule";
import { Timeline } from "@/features/schedule/Timeline";

function Home() {
  const { data, status } = useNowPlaying();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 p-4">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight">LMENT Radio</h1>
        {data ? (
          <span
            className="text-sm text-muted"
            data-testid="listeners"
            aria-label="Oyentes"
          >
            {data.listeners} oyentes
          </span>
        ) : null}
      </header>

      <NowPlaying data={data} status={status} />
      <AudioPlayer nowPlaying={data} />
      <Timeline
        isLive={data?.isLive ?? false}
        djName={data?.liveDJName ?? null}
      />
      <Schedule />

      <footer className="mt-auto pt-4 text-center text-xs text-muted">
        LMENT — Radio Online
      </footer>
    </main>
  );
}

export default function HomePage() {
  return (
    <PlayerProvider>
      <Home />
    </PlayerProvider>
  );
}
