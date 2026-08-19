"use client";

import type { ReactNode } from "react";

import { PlayerProvider } from "@/features/player/PlayerContext";

import { DockedPlayer } from "./DockedPlayer";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { WhatsAppButton } from "./WhatsAppButton";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <PlayerProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-32">
          {children}
        </main>
        <Footer />
        <DockedPlayer />
        <WhatsAppButton />
      </div>
    </PlayerProvider>
  );
}
