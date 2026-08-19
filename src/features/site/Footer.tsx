import { site } from "@/content/site";

import { SocialLinks } from "./SocialLinks";

export function Footer() {
  return (
    <footer className="border-t border-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">{site.name}</p>
          <p className="text-sm text-muted">{site.tagline}</p>
        </div>
        <SocialLinks />
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} {site.name}. {site.location}.
        </p>
      </div>
    </footer>
  );
}
