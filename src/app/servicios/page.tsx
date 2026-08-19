import type { Metadata } from "next";

import { ServicesGrid } from "@/features/site/ServicesGrid";

export const metadata: Metadata = { title: "Servicios" };

export default function ServiciosPage() {
  return (
    <section className="py-10">
      <h1 className="text-3xl font-bold">Servicios</h1>
      <p className="mt-2 max-w-xl text-muted">
        Líneas de negocio y producciones que ofrecemos.
      </p>
      <div className="mt-8">
        <ServicesGrid />
      </div>
    </section>
  );
}
