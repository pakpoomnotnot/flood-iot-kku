import { NextRequest, NextResponse } from "next/server";
import { RAIN_STATIONS } from "@/lib/rain-stations";

const BASE_URL = "http://10.198.110.39:9001";

const STATIONS = RAIN_STATIONS;

type StationCode = keyof typeof STATIONS;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const stationCode = searchParams.get("station_code") as StationCode | null;
    const limit = searchParams.get("limit") ?? "72";

    /* ---------- validate station ---------- */
    if (!stationCode || !STATIONS[stationCode]) {
      return NextResponse.json(
        {
          error: "Invalid station_code",
          available_stations: Object.keys(STATIONS),
        },
        { status: 400 }
      );
    }

    const station = STATIONS[stationCode];

    /* ---------- build backend url ---------- */
    const backendUrl =
      `${BASE_URL}/rain/forecast-timeseries` +
      `?station_code=${stationCode}&limit=${limit}`;

    const response = await fetch(backendUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch forecast data" },
        { status: response.status }
      );
    }

    const data = await response.json();

    /* ---------- enrich response ---------- */
    return NextResponse.json({
      station: {
        code: stationCode,
        name: station.name,
        latitude: station.lat,
        longitude: station.lon,
      },
      run: data.run,
      data: data.data,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
