import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Header } from "@/features/site/Header";
import { Hero } from "@/features/site/Hero";
import { site } from "@/content/site";

const playerActions = vi.hoisted(() => ({ playStream: vi.fn(), pauseStream: vi.fn() }));

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("@/features/now-playing/useNowPlaying", () => ({
  useNowPlaying: () => ({
    data: { track: { title: "Canción actual", artist: "Artista" }, isLive: true, liveDJName: null, listeners: 4, elapsed: 0, duration: 0, artwork: null },
    status: "online",
  }),
}));
vi.mock("@/features/player/PlayerContext", () => ({
  usePlayer: () => ({ state: { status: "paused" }, ...playerActions }),
}));

describe("listener-first presentation", () => {
  it("uses listener-only navigation and branded identity", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: site.name })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Escuchar" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Programación" })).toHaveAttribute("href", "/programacion");
    expect(screen.queryByRole("link", { name: /servicios|galería|contacto/i })).not.toBeInTheDocument();
  });

  it("keeps now-playing and programming cards below the compact player with working controls", () => {
    render(<Hero />);
    const player = screen.getByRole("region", { name: "Reproductor de radio" });
    expect(player).toHaveClass("listener-compact-player");
    expect(player.querySelector(".listener-art")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Ahora en MegaHitsRadio" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Programación" })).toBeInTheDocument();
    const listenButton = screen.getByRole("button", { name: /escuchar/i });
    expect(listenButton).toHaveAttribute("aria-pressed", "false");
    listenButton.click();
    expect(playerActions.playStream).toHaveBeenCalledOnce();
  });

  it("shows artwork identity, actual now-playing metadata and Spanish playback controls", () => {
    render(<Hero />);
    expect(screen.getByRole("img", { name: /megahitsradio/i })).toBeInTheDocument();
    expect(screen.getByText("Canción actual")).toBeInTheDocument();
    expect(screen.getByText("Artista")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /escuchar/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /programación/i })).toHaveAttribute("href", "/programacion");
  });
});
