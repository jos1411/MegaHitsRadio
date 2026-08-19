import type { Metadata } from "next";

import { Gallery } from "@/features/site/Gallery";

export const metadata: Metadata = { title: "Galería" };

export default function GaleriaPage() {
  return (
    <section className="py-10">
      <h1 className="text-3xl font-bold">Galería</h1>
      <p className="mt-2 max-w-xl text-muted">
        Eventos, trayectoria y trabajos realizados.
      </p>
      <div className="mt-8">
        <Gallery />
      </div>
    </section>
  );
}
