import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sin conexión — MegaHitsRadio",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center text-foreground">
      <h1 className="text-2xl font-bold">Sin conexión</h1>
      <p className="max-w-sm text-sm text-muted">
        No tenés conexión a internet. Volvé a intentar cuando estés en línea.
      </p>
      <a
        href="/"
        className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent-hover"
      >
        Reintentar
      </a>
    </main>
  );
}
