export interface NowPlayingData {
  track: { title: string; artist: string; artwork: string };
  elapsed: number;
  duration: number;
  isLive: boolean;
  liveDJName: string | null;
  listeners: number;
}

export interface ScheduleEntry {
  title: string;
  artist: string;
  startTime: string;
  source: "autodj" | "live";
  djName?: string;
}

export type SSEPayload =
  | { type: "now_playing"; data: NowPlayingData }
  | { type: "schedule_update"; data: ScheduleEntry[] };

export interface AzuraCastNowPlaying {
  station: {
    listen_url: string;
  };
  now_playing: {
    song: {
      title: string;
      artist: string;
      art: string;
    };
    elapsed: number;
    duration: number;
    played_at: number;
  };
  listeners: {
    total: number;
  };
  live: {
    is_live: boolean;
    streamer_name: string;
  };
}
