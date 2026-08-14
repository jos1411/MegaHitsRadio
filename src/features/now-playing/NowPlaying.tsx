"use client";

import { LiveIndicator } from "@/features/player/LiveIndicator";
import type { NowPlayingData } from "@/lib/types";

import type { NowPlayingStatus } from "./useNowPlaying";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

interface NowPlayingProps {
  data: NowPlayingData | null;
  status: NowPlayingStatus;
}

export function NowPlaying({ data, status }: NowPlayingProps) {
  if (!data) {
    return (
      <section className="rounded-xl bg-surface p-4">
        <p className="text-sm text-muted">Cargando ahora sonando…</p>
      </section>
    );
  }

  const offline = status === "offline" || status === "reconnecting";

  return (
    <section className="flex items-center gap-4 rounded-xl bg-surface p-4">
      {data.track.artwork ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.track.artwork}
          alt=""
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-background text-muted">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8"
            aria-hidden="true"
          >
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
          </svg>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-semibold">{data.track.title}</p>
        <p className="truncate text-sm text-muted">{data.track.artist}</p>
        <p className="mt-1 text-xs tabular-nums text-muted">
          {formatTime(data.elapsed)} / {formatTime(data.duration)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <LiveIndicator isLive={data.isLive} />
        {offline && (
          <span className="text-xs text-muted" role="status">
            Conexión perdida
          </span>
        )}
      </div>
    </section>
  );
}
