import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      // Live audio streams are NEVER cached.
      urlPattern: /\/api\/stream/,
      handler: new NetworkOnly(),
    },
    {
      // Real-time API data (now-playing, schedule) is never cached.
      urlPattern: /\/api\//,
      handler: new NetworkOnly(),
    },
    {
      // Album art and images: stale-while-revalidate.
      urlPattern: /\.(?:png|jpe?g|webp|svg|gif|avif)$/,
      handler: new StaleWhileRevalidate({ cacheName: "images" }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
