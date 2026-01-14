import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "http://10.198.110.39:9000";

/* ---------- station whitelist ---------- */
const STATIONS = {
  SNK_HOSP: { name: "โรงพยาบาลศรีนครินทร์", lat: 16.466, lon: 102.831 },
  KKC_MUN: { name: "เทศบาลนครขอนแก่น", lat: 16.429, lon: 102.829 },
  BKN: { name: "บึงแก่นนคร", lat: 16.419, lon: 102.836 },
  BTS: { name: "บึงทุ่งสร้าง", lat: 16.452, lon: 102.855 },
  NLP: { name: "หนองเลิงเปือย", lat: 16.43, lon: 102.877 },
  BNK: { name: "บึงหนองโคตร", lat: 16.429, lon: 102.805 },
  SIL_MUN: { name: "เทศบาลเมืองศิลา", lat: 16.473, lon: 102.849 },
  UNE_MC: { name: "ศูนย์อุตุนิยมวิทยาภาคตะวันออกเฉียงเหนือตอนบน", lat: 16.463, lon: 102.786 },
  MKO_MUN: { name: "เทศบาลเมืองเก่า", lat: 16.402, lon: 102.788 },
  NEU: { name: "มหาวิทยาลัยภาคตะวันออกเฉียงเหนือ", lat: 16.422, lon: 102.814 },
  UNE_SH: { name: "บ้านพักพนักงานอุตุฯ", lat: 16.446, lon: 102.832 },
  KKC_SP: { name: "อุทยานวิทยาศาสตร์ มหาวิทยาลัยขอนแก่น", lat: 16.456, lon: 102.819 },
  BSV: { name: "หมู่บ้านสีวลี", lat: 16.436, lon: 102.785 },
  RMUTI: { name: "มหาวิทยาลัยราชมงคลอีสาน วิทยาเขตขอนแก่น", lat: 16.434, lon: 102.861 },
  KKC_BL: { name: "โรงเรียนสอนคนตาบอด", lat: 16.442, lon: 102.808 },
} as const;

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
