"use client";

import { AudioPlayer } from "@/features/player/AudioPlayer";
import { useNowPlaying } from "@/features/now-playing/useNowPlaying";

import { site } from "@/content/site";

export function DockedPlayer() {
  const { data, status } = useNowPlaying();

  const subtitle = data
    ? data.isLive && data.liveDJName
      ? `${data.liveDJName} en vivo`
      : data.track.artist || "AutoDJ"
    : status === "offline"
      ? "Sin conexión"
      : "Conectando…";

  return (
    <div className="glass fixed inset-x-0 bottom-0 z-50 border-t border-white/10 pb-[env(safe-area-inset-bottom)] shadow-material">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {data ? data.track.title : site.name}
          </p>
          <p className="truncate text-xs text-muted">{subtitle}</p>
        </div>
        <span className="hidden shrink-0 text-xs tabular-nums text-muted sm:block">
          {data ? `${data.listeners} oyentes` : ""}
        </span>
        <AudioPlayer nowPlaying={data} />
      </div>
    </div>
  );
}
