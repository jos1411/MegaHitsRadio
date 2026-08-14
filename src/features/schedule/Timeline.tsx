"use client";

interface TimelineProps {
  isLive: boolean;
  djName: string | null;
}

export function Timeline({ isLive, djName }: TimelineProps) {
  return (
    <div className="rounded-xl bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        Ahora en el aire
      </h2>
      <div className="relative flex h-2 overflow-hidden rounded-full bg-background">
        {isLive ? (
          <div
            className="h-full w-full bg-accent"
            role="img"
            aria-label="DJ en vivo"
          />
        ) : (
          <div
            className="h-full w-full bg-accent/40"
            role="img"
            aria-label="AutoDJ"
          />
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className={isLive ? "text-muted" : "font-semibold"}>AutoDJ</span>
        <span className={isLive ? "font-semibold text-accent" : "text-muted"}>
          {isLive && djName ? `${djName} en vivo` : "DJ en vivo"}
        </span>
      </div>
    </div>
  );
}
