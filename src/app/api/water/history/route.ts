import { NextRequest, NextResponse } from "next/server";
import { fetchTelemetryHistory } from "@/app/api/lib/fetchTelemetryReading";
import {
  readingsToHourlyChart,
  resolveTelemetryStationId,
} from "@/lib/telemetry-history";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const stationId = req.nextUrl.searchParams.get("station_id");
  const hours = Math.min(
    24 * 7,
    Math.max(1, parseInt(req.nextUrl.searchParams.get("hours") ?? "24", 10)),
  );

  if (category !== "pipe" && category !== "road" && category !== "lake") {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (!stationId) {
    return NextResponse.json({ error: "station_id required" }, { status: 400 });
  }

  const telemetryId = resolveTelemetryStationId(category, stationId);

  try {
    const readings = await fetchTelemetryHistory(category, telemetryId, hours);
    const data = readingsToHourlyChart(readings, hours);

    return NextResponse.json({
      station_id: telemetryId,
      category,
      hours,
      reading_count: readings.length,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch history";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
