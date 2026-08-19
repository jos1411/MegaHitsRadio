"use client";

import { useState, type FormEvent } from "react";

import { site } from "@/content/site";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const hasWhatsApp = Boolean(site.whatsappNumber);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasWhatsApp || !name.trim() || !message.trim()) return;

    const text = `Hola, soy ${name.trim()}${
      email.trim() ? ` (${email.trim()})` : ""
    }. ${message.trim()}`;
    const url = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
      text,
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Nombre</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Tu nombre"
            className="rounded-lg bg-background px-3 py-2 text-foreground outline-none ring-1 ring-surface focus:ring-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Correo (opcional)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            className="rounded-lg bg-background px-3 py-2 text-foreground outline-none ring-1 ring-surface focus:ring-accent"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Mensaje</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          placeholder="Contanos en qué podemos ayudarte…"
          className="resize-y rounded-lg bg-background px-3 py-2 text-foreground outline-none ring-1 ring-surface focus:ring-accent"
        />
      </label>

      {hasWhatsApp ? (
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          Enviar por WhatsApp
        </button>
      ) : (
        <p className="text-sm text-muted">
          WhatsApp no configurado. Escribinos a{" "}
          <a href={`mailto:${site.email}`} className="text-accent">
            {site.email}
          </a>
          .
        </p>
      )}
    </form>
  );
}
