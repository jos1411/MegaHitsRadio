import type { Metadata } from "next";

import { ProgramacionView } from "@/features/schedule/ProgramacionView";

export const metadata: Metadata = { title: "Programación" };

export default function ProgramacionPage() {
  return (
    <section className="py-10">
      <h1 className="text-3xl font-bold">Programación</h1>
      <p className="mt-2 max-w-xl text-muted">
        Nuestra parrilla y quién está al aire ahora mismo.
      </p>
      <div className="mt-8 flex flex-col gap-4">
        <ProgramacionView />
      </div>
    </section>
  );
}
