import Link from "next/link";

import { site } from "@/content/site";

import { ListenButton } from "./ListenButton";

export function Hero() {
  return (
    <section className="flex flex-col items-start gap-6 py-16 sm:py-24">
      <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
        Radio en vivo 24/7
      </span>
      <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
        {site.tagline}
      </h1>
      <p className="max-w-xl text-base text-muted sm:text-lg">
        {site.description}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <ListenButton />
        <Link
          href="/programacion"
          className="rounded-full border border-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
        >
          Ver programación
        </Link>
      </div>
    </section>
  );
}
