"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { site } from "@/content/site";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/programacion", label: "Programación" },
  { href: "/galeria", label: "Galería" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="glass sticky top-0 z-40 border-b border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {site.name}
        </Link>
        <nav
          aria-label="Principal"
          className="flex items-center gap-1 overflow-x-auto whitespace-nowrap text-sm"
        >
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 transition duration-150 active:scale-[0.97] ${
                  active
                    ? "bg-accent/20 font-semibold text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
