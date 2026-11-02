"use client";

import Link from "next/link";

import { site } from "@/content/site";
import { NowPlaying } from "@/features/now-playing/NowPlaying";
import { useNowPlaying } from "@/features/now-playing/useNowPlaying";
import { Schedule } from "@/features/schedule/Schedule";

import { ListenButton } from "./ListenButton";

export function Hero() {
  const { data, status } = useNowPlaying();
  return (
    <section
      id="listen"
      aria-label="Reproductor de radio"
      className="listener-compact-player grid items-center gap-8 py-8 sm:py-10"
    >
      <div className="listener-art" role="img" aria-label="Identidad de MegaHitsRadio">
        {data?.track.artwork ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.track.artwork}
            alt=""
            className="h-full w-full rounded-3xl object-cover"
          />
        ) : (
          <div className="listener-art-fallback">
            <span aria-hidden="true">
              MH<span className="text-accent">.</span>
            </span>
            <span className="text-xs tracking-[.18em] text-muted">
              MEGAHITSRADIO
            </span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <span className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted">
          <span className="live-dot" aria-hidden="true" />Radio en directo
        </span>
        <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Tu música.<br />Tu momento.
        </h1>
        <p className="mt-3 text-muted">Dale play y seguí con lo tuyo.</p>
        <div className="mt-6">
          <ListenButton />
        </div>
        <Link
          href="/programacion"
          className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          Ver programación →
        </Link>
        <p className="mt-4 text-xs uppercase tracking-[.14em] text-muted">
          Una señal. Muchas canciones.
        </p>
        <p className="sr-only">{site.name}</p>
      </div>
      <div className="listener-compact-sections">
        <NowPlaying data={data} status={status} />
        <section aria-label="Programación">
          <Schedule />
        </section>
      </div>
    </section>
  );
}
