import type { Metadata } from "next";

import { site } from "@/content/site";
import { ContactForm } from "@/features/site/ContactForm";
import { SocialLinks } from "@/features/site/SocialLinks";

export const metadata: Metadata = { title: "Contacto" };

export default function ContactoPage() {
  return (
    <section className="py-10">
      <h1 className="text-3xl font-bold">Contacto</h1>
      <p className="mt-2 max-w-xl text-muted">
        Escribinos para cotizaciones, saludos o contrataciones.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <ContactForm />
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <h2 className="font-semibold">Datos de contacto</h2>
            <p className="mt-1 text-muted">
              <a href={`mailto:${site.email}`} className="text-accent">
                {site.email}
              </a>
            </p>
            <p className="text-muted">{site.location}</p>
          </div>
          <div>
            <h2 className="font-semibold">Redes sociales</h2>
            <div className="mt-2">
              <SocialLinks />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
