"use client";

import { useNowPlaying } from "@/features/now-playing/useNowPlaying";

import { Schedule } from "./Schedule";
import { Timeline } from "./Timeline";

export function ProgramacionView() {
  const { data } = useNowPlaying();

  return (
    <>
      <Timeline
        isLive={data?.isLive ?? false}
        djName={data?.liveDJName ?? null}
      />
      <Schedule />
    </>
  );
}
