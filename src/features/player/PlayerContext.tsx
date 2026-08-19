"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";

export type PlayerStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "reconnecting"
  | "unavailable";

export interface PlayerState {
  status: PlayerStatus;
  volume: number;
  muted: boolean;
  isLive: boolean;
}

export type PlayerAction =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "TOGGLE" }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "TOGGLE_MUTE" }
  | { type: "SET_STATUS"; status: PlayerStatus }
  | { type: "SET_LIVE"; isLive: boolean };

const VOLUME_KEY = "lment:volume";
const STREAM_URL = "/api/stream";
const MAX_RECONNECTS = 8;
const INITIAL_RETRY_MS = 1000;
const MAX_RETRY_MS = 30000;

const initialState: PlayerState = {
  status: "idle",
  volume: 0.8,
  muted: false,
  isLive: false,
};

function reducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "PLAY":
      return { ...state, status: "playing" };
    case "PAUSE":
      return { ...state, status: "paused" };
    case "TOGGLE":
      return state.status === "playing"
        ? { ...state, status: "paused" }
        : { ...state, status: "playing" };
    case "SET_VOLUME":
      return { ...state, volume: action.volume };
    case "TOGGLE_MUTE":
      return { ...state, muted: !state.muted };
    case "SET_STATUS":
      return { ...state, status: action.status };
    case "SET_LIVE":
      return { ...state, isLive: action.isLive };
    default:
      return state;
  }
}

export interface PlayerContextValue {
  state: PlayerState;
  audioRef: { current: HTMLAudioElement | null };
  playStream: () => void;
  pauseStream: () => void;
  dispatch: Dispatch<PlayerAction>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(initialState.volume);
  const mutedRef = useRef(initialState.muted);
  const userPausedRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearReconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  // Lazily create the <audio> element and attach resilience listeners exactly once.
  const ensureAudio = useCallback((): HTMLAudioElement => {
    let audio = audioRef.current;
    if (audio) return audio;

    audio = new Audio();
    audio.preload = "none";
    audio.volume = volumeRef.current;
    audio.muted = mutedRef.current;

    audio.addEventListener("playing", () => {
      reconnectAttemptsRef.current = 0;
      dispatch({ type: "PLAY" });
    });

    audio.addEventListener("waiting", () => {
      if (!userPausedRef.current) {
        dispatch({ type: "SET_STATUS", status: "loading" });
      }
    });

    audio.addEventListener("stalled", () => {
      if (!userPausedRef.current) {
        dispatch({ type: "SET_STATUS", status: "reconnecting" });
      }
    });

    audio.addEventListener("error", () => {
      if (userPausedRef.current) return;

      if (reconnectAttemptsRef.current >= MAX_RECONNECTS) {
        dispatch({ type: "SET_STATUS", status: "unavailable" });
        return;
      }

      reconnectAttemptsRef.current += 1;
      const delay = Math.min(
        INITIAL_RETRY_MS * 2 ** (reconnectAttemptsRef.current - 1),
        MAX_RETRY_MS,
      );

      dispatch({ type: "SET_STATUS", status: "reconnecting" });
      clearReconnect();
      reconnectTimerRef.current = setTimeout(() => {
        if (userPausedRef.current) return;
        // Cache-buster forces a fresh upstream connection through /api/stream.
        audio.src = `${STREAM_URL}?t=${Date.now()}`;
        audio.play().catch(() => {
          // Another "error" event will trigger the next retry.
        });
      }, delay);
    });

    audioRef.current = audio;
    return audio;
  }, [clearReconnect]);

  const playStream = useCallback(() => {
    userPausedRef.current = false;
    const audio = ensureAudio();
    dispatch({ type: "SET_STATUS", status: "loading" });
    audio.src = `${STREAM_URL}?t=${Date.now()}`;
    audio
      .play()
      .then(() => dispatch({ type: "PLAY" }))
      .catch(() => dispatch({ type: "SET_STATUS", status: "unavailable" }));
  }, [ensureAudio]);

  const pauseStream = useCallback(() => {
    userPausedRef.current = true;
    clearReconnect();
    audioRef.current?.pause();
    dispatch({ type: "PAUSE" });
  }, [clearReconnect]);

  useEffect(() => {
    return () => {
      clearReconnect();
      userPausedRef.current = true;
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [clearReconnect]);

  useEffect(() => {
    volumeRef.current = state.volume;
    mutedRef.current = state.muted;
    const audio = audioRef.current;
    if (audio) {
      audio.volume = state.volume;
      audio.muted = state.muted;
    }
  }, [state.volume, state.muted]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VOLUME_KEY, String(state.volume));
    }
  }, [state.volume]);

  const value = useMemo<PlayerContextValue>(
    () => ({ state, audioRef, playStream, pauseStream, dispatch }),
    [state, playStream, pauseStream],
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return ctx;
}
