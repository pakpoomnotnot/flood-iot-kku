import { NextResponse } from "next/server";
import { fetchTelemetryStations } from "../../lib/fetchTelemetryReading";
import { PIPE_TELEMETRY_STATIONS } from "@/lib/telemetry-stations";

export async function GET() {
  const stations = await fetchTelemetryStations("pipe", PIPE_TELEMETRY_STATIONS);

  return NextResponse.json(
    {
      fetched_at: new Date().toISOString(),
      status: "success",
      type: "pipe",
      count: stations.length,
      stations,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
