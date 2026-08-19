// Contenido centralizado del sitio. Editá este archivo para actualizar textos,
// servicios, galería, redes y datos de contacto sin tocar los componentes.

export interface Service {
  title: string;
  description: string;
}

export interface GalleryItem {
  src: string;
  alt: string;
}

export interface SocialLink {
  name: string;
  url: string;
  /** Punto de código del ícono (se renderiza como texto). */
  label: string;
}

export interface SiteContent {
  name: string;
  tagline: string;
  description: string;
  /** Número de WhatsApp en formato internacional, solo dígitos (ej: 50600000000). */
  whatsappNumber: string;
  email: string;
  location: string;
  services: Service[];
  gallery: GalleryItem[];
  socials: SocialLink[];
}

export const site: SiteContent = {
  name: "LMENT",
  tagline: "Sonido, eventos y radio en vivo",
  description:
    "Productora y radio online. Cobertura de eventos, sonido profesional y transmisión en vivo 24/7.",
  // TODO: reemplazar por el número real de WhatsApp (sin el signo +).
  whatsappNumber: "50600000000",
  email: "contacto@lment.com",
  location: "Costa Rica",

  services: [
    {
      title: "Producción de eventos",
      description:
        "Planificación y ejecución integral de eventos corporativos y sociales.",
    },
    {
      title: "Sonido e iluminación",
      description:
        "Equipos de audio profesional y montaje de iluminación para escenarios.",
    },
    {
      title: "Animación y locución",
      description:
        "Conducción, locución comercial y animación para eventos y marcas.",
    },
    {
      title: "Radio en vivo",
      description:
        "Programación 24/7 con AutoDJ y DJs en vivo transmitiendo desde AzuraCast.",
    },
    {
      title: "Streaming",
      description:
        "Transmisión en vivo de eventos por redes sociales y plataformas propias.",
    },
    {
      title: "Alquiler de equipos",
      description:
        "Consolas, micrófonos, amplificación y accesorios para producciones.",
    },
  ],

  gallery: [
    { src: "/gallery/galeria-1.svg", alt: "Evento corporativo 1" },
    { src: "/gallery/galeria-2.svg", alt: "Cabina de radio" },
    { src: "/gallery/galeria-3.svg", alt: "Concierto en vivo" },
    { src: "/gallery/galeria-4.svg", alt: "Escenario e iluminación" },
    { src: "/gallery/galeria-5.svg", alt: "Sesión de locución" },
    { src: "/gallery/galeria-6.svg", alt: "Producción audiovisual" },
  ],

  socials: [
    { name: "Facebook", url: "https://facebook.com/lment", label: "Facebook" },
    {
      name: "Instagram",
      url: "https://instagram.com/lment",
      label: "Instagram",
    },
    { name: "TikTok", url: "https://tiktok.com/@lment", label: "TikTok" },
    { name: "YouTube", url: "https://youtube.com/@lment", label: "YouTube" },
  ],
};
