import Link from "next/link";

import { Hero } from "@/features/site/Hero";
import { ServicesGrid } from "@/features/site/ServicesGrid";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="py-8">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold">Servicios</h2>
          <Link
            href="/servicios"
            className="text-sm text-accent hover:underline"
          >
            Ver todos
          </Link>
        </div>
        <ServicesGrid limit={3} />
      </section>
    </>
  );
}
