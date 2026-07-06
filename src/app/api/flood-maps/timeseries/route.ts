import { NextRequest, NextResponse } from "next/server";
import { fetchFloodMapTimeseries } from "@/lib/flood-map-catalog";

export async function GET(req: NextRequest) {
  const days = Math.min(
    30,
    Math.max(1, parseInt(req.nextUrl.searchParams.get("days") ?? "7", 10)),
  );

  try {
    const dayGroups = await fetchFloodMapTimeseries(days);
    const totalFrames = dayGroups.reduce((sum, g) => sum + g.frames.length, 0);

    return NextResponse.json({
      days,
      dayGroups,
      totalFrames,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch timeseries";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
