import "server-only";

import type { AzuraCastNowPlaying, ScheduleEntry } from "./types";

export interface AzuraCastMount {
  id: number;
  name: string;
  url: string;
  is_default: boolean;
  listeners: {
    total: number;
  };
}

interface AzuraCastScheduleItem {
  type: string;
  name: string;
  title?: string;
  artist?: string;
  start: string;
  end: string;
}

interface AzuraCastConfig {
  baseUrl: string;
  apiKey: string | undefined;
}

function getConfig(): AzuraCastConfig {
  const baseUrl = process.env.AZURACAST_BASE_URL;
  const apiKey = process.env.AZURACAST_API_KEY;

  if (!baseUrl) {
    throw new Error(
      "AZURACAST_BASE_URL is not set. Add it to your environment variables.",
    );
  }

  // The API key is optional: AzuraCast serves public read endpoints (now playing,
  // schedule, mounts) without auth. It's only required for admin operations.
  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    apiKey: apiKey || undefined,
  };
}

export function getStationId(): string {
  return process.env.AZURACAST_STATION_ID ?? "1";
}

export function getBaseUrl(): string {
  return getConfig().baseUrl;
}

async function azuracastFetch<T>(
  path: string,
  timeoutMs = 10000,
): Promise<T> {
  const { baseUrl, apiKey } = getConfig();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (apiKey) {
      headers["X-API-Key"] = apiKey;
    }

    const response = await fetch(`${baseUrl}${path}`, {
      headers,
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `AzuraCast request to ${path} failed with status ${response.status}`,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `AzuraCast request to ${path} timed out after ${timeoutMs}ms`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getNowPlaying(
  stationId: string | number,
): Promise<AzuraCastNowPlaying> {
  return azuracastFetch<AzuraCastNowPlaying>(
    `/api/nowplaying/${stationId}.json`,
  );
}

export async function getNowPlayingStatic(
  stationId: string | number,
): Promise<AzuraCastNowPlaying> {
  return azuracastFetch<AzuraCastNowPlaying>(
    `/api/nowplaying_static/${stationId}.json`,
  );
}

export async function getMounts(
  stationId: string | number,
): Promise<AzuraCastMount[]> {
  return azuracastFetch<AzuraCastMount[]>(`/api/station/${stationId}/mounts`);
}

export async function getSchedule(
  stationId: string | number,
): Promise<ScheduleEntry[]> {
  const items = await azuracastFetch<AzuraCastScheduleItem[]>(
    `/api/station/${stationId}/schedule`,
  );

  return items.map((item) => ({
    title: item.title ?? item.name,
    artist: item.artist ?? "",
    startTime: item.start,
    source: item.type === "streamer" ? "live" : "autodj",
    djName: item.type === "streamer" ? item.name : undefined,
  }));
}
