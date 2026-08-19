import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { site } from "@/content/site";
import { ContactForm } from "@/features/site/ContactForm";
import { Gallery } from "@/features/site/Gallery";
import { ServicesGrid } from "@/features/site/ServicesGrid";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("content/site", () => {
  it("defines services, gallery, and socials with the expected shape", () => {
    expect(site.services.length).toBeGreaterThan(0);
    expect(site.gallery.length).toBeGreaterThan(0);
    expect(site.socials.length).toBeGreaterThan(0);

    for (const service of site.services) {
      expect(service.title).toBeTruthy();
      expect(service.description).toBeTruthy();
    }
    for (const item of site.gallery) {
      expect(item.src).toMatch(/^\/gallery\//);
      expect(item.alt).toBeTruthy();
    }
  });
});

describe("ServicesGrid", () => {
  it("renders the configured services", () => {
    render(<ServicesGrid />);
    expect(screen.getAllByRole("listitem").length).toBe(site.services.length);
  });
});

describe("Gallery", () => {
  it("renders lazy-loaded images", () => {
    render(<Gallery />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBe(site.gallery.length);
    for (const img of images) {
      expect(img).toHaveAttribute("loading", "lazy");
    }
  });
});

describe("ContactForm", () => {
  it("opens WhatsApp with the composed message", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);

    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Juan" },
    });
    fireEvent.change(screen.getByLabelText("Mensaje"), {
      target: { value: "Quiero cotizar un evento" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar por WhatsApp" }));

    expect(open).toHaveBeenCalledTimes(1);
    const url = open.mock.calls[0][0] as string;
    expect(url).toContain(`https://wa.me/${site.whatsappNumber}`);
    expect(url).toContain(
      encodeURIComponent("Hola, soy Juan. Quiero cotizar un evento"),
    );
  });
});
