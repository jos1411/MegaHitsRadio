"use client";

export function LiveIndicator({ isLive }: { isLive: boolean }) {
  if (!isLive) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
      <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
      EN VIVO
    </span>
  );
}
