import { getSchedule, getStationId } from "@/lib/azuracast";
import type { ScheduleEntry } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const schedule: ScheduleEntry[] = await getSchedule(getStationId());
    return Response.json(schedule);
  } catch {
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
}
