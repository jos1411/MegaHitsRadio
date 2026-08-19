import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { SiteShell } from "@/features/site/SiteShell";

export const metadata: Metadata = {
  title: { default: "LMENT — Radio en vivo", template: "%s — LMENT" },
  description:
    "Productora y radio online. Eventos, sonido profesional y transmisión en vivo 24/7.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
