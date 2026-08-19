import { site } from "@/content/site";

export function ServicesGrid({ limit }: { limit?: number }) {
  const services = limit ? site.services.slice(0, limit) : site.services;

  if (services.length === 0) return null;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <li key={service.title} className="rounded-xl bg-surface p-5">
          <h3 className="text-base font-semibold">{service.title}</h3>
          <p className="mt-2 text-sm text-muted">{service.description}</p>
        </li>
      ))}
    </ul>
  );
}
