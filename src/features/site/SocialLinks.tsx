import { site } from "@/content/site";

export function SocialLinks() {
  if (site.socials.length === 0) return null;

  return (
    <ul className="flex items-center gap-3">
      {site.socials.map((social) => (
        <li key={social.name}>
          <a
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            {social.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
