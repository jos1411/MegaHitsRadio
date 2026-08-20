import { site } from "@/content/site";

export function WhatsAppButton() {
  if (!site.whatsappNumber) return null;

  const text = encodeURIComponent("Hola, me interesa más información.");
  const href = `https://wa.me/${site.whatsappNumber}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-24 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition duration-150 hover:scale-105 active:scale-95"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1-4.1 15.3l-.4-.2-3 .8.8-2.9-.3-.5A8.2 8.2 0 0 1 12 3.8Zm-3.1 4c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.9 4.4 3.9 2.2.9 2.6.7 3.1.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3l-2-.9c-.3-.1-.5-.2-.7.1l-.9 1.1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.7-.8c.2-.2.2-.4.1-.6l-.9-2.2c-.1-.3-.3-.4-.5-.4Z" />
      </svg>
    </a>
  );
}
