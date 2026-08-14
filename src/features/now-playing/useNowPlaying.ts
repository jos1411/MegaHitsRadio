"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { NowPlayingData, SSEPayload } from "@/lib/types";

export type NowPlayingStatus =
  | "connecting"
  | "live"
  | "reconnecting"
  | "offline";

const INITIAL_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 30000;
const MAX_RETRIES = 8;

export interface UseNowPlayingResult {
  data: NowPlayingData | null;
  status: NowPlayingStatus;
}

export function useNowPlaying(): UseNowPlayingResult {
  const [data, setData] = useState<NowPlayingData | null>(null);
  const [status, setStatus] = useState<NowPlayingStatus>("connecting");

  const sourceRef = useRef<EventSource | null>(null);
  const retriesRef = useRef(0);
  const backoffRef = useRef(INITIAL_BACKOFF_MS);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (typeof EventSource === "undefined") {
      setStatus("offline");
      return;
    }

    setStatus(retriesRef.current > 0 ? "reconnecting" : "connecting");

    const source = new EventSource("/api/now-playing");
    sourceRef.current = source;

    source.onopen = () => {
      retriesRef.current = 0;
      backoffRef.current = INITIAL_BACKOFF_MS;
      setStatus("live");
    };

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as SSEPayload;
        if (payload.type === "now_playing") {
          setData(payload.data);
          setStatus("live");
        }
      } catch {
        // Ignore malformed frames.
      }
    };

    source.onerror = () => {
      source.close();
      if (sourceRef.current === source) {
        sourceRef.current = null;
      }
      setStatus("reconnecting");

      if (retriesRef.current >= MAX_RETRIES) {
        setStatus("offline");
        return;
      }

      retriesRef.current += 1;
      const delay = backoffRef.current;
      backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
      timerRef.current = setTimeout(connect, delay);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/now-playing")
      .then((response) =>
        response.ok
          ? (response.json() as Promise<NowPlayingData>)
          : Promise.reject(new Error("snapshot failed")),
      )
      .then((snapshot) => {
        if (!cancelled) {
          setData(snapshot);
        }
      })
      .catch(() => {
        // SSE will populate the data, or the status reports offline.
      });

    connect();

    return () => {
      cancelled = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      sourceRef.current?.close();
      sourceRef.current = null;
    };
  }, [connect]);

  return { data, status };
}
