import { site } from "@/content/site";

export function Gallery() {
  if (site.gallery.length === 0) {
    return (
      <p className="text-sm text-muted">Galería en preparación. Volvé pronto.</p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {site.gallery.map((item) => (
        <li key={item.src} className="overflow-hidden rounded-xl bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={item.alt}
            loading="lazy"
            width={800}
            height={600}
            className="aspect-[4/3] w-full object-cover"
          />
        </li>
      ))}
    </ul>
  );
}
