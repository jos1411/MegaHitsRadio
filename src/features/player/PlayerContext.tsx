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
  playStream: (url: string) => void;
  dispatch: Dispatch<PlayerAction>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(initialState.volume);
  const mutedRef = useRef(initialState.muted);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const playStream = useCallback((url: string) => {
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio();
      audio.preload = "none";
      audio.volume = volumeRef.current;
      audio.muted = mutedRef.current;
      audioRef.current = audio;
    }
    audio.src = url;
    audio
      .play()
      .then(() => dispatch({ type: "PLAY" }))
      .catch(() => dispatch({ type: "SET_STATUS", status: "unavailable" }));
  }, []);

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
    () => ({ state, audioRef, playStream, dispatch }),
    [state, playStream],
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
