"use client";

import useSWR from "swr";

import type { ScheduleEntry } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function Schedule() {
  const { data, error, isLoading } = useSWR<ScheduleEntry[]>(
    "/api/schedule",
    fetcher,
  );

  if (isLoading) {
    return (
      <section className="rounded-xl bg-surface p-4">
        <p className="text-sm text-muted">Cargando programación…</p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="rounded-xl bg-surface p-4">
        <p className="text-sm text-muted">Programación no disponible.</p>
      </section>
    );
  }

  if (data.length === 0) {
    return (
      <section className="rounded-xl bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Próximamente
        </h2>
        <p className="text-sm text-muted">Cola vacía</p>
      </section>
    );
  }

  const upcoming = data.slice(0, 3);

  return (
    <section className="rounded-xl bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        Próximamente
      </h2>
      <ul className="space-y-2">
        {upcoming.map((entry, index) => (
          <li key={`${entry.title}-${index}`} className="flex items-center gap-3">
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-accent"
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {entry.title}
              </span>
              <span className="block truncate text-xs text-muted">
                {entry.artist}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
