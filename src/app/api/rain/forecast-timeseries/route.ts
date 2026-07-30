import { NextRequest, NextResponse } from "next/server";
import { RAIN_STATIONS, type RainStationCode } from "@/lib/rain-stations";
import {
  fetchLatestForecastCsv,
  parseForecastCsvColumn,
} from "@/app/api/lib/rainForecastSource";

// อ่านไฟล์พยากรณ์ฝน rain_interp_to_tele_1hr_2km_*.csv โดยตรงจาก
// http://10.101.111.123:8080/transfer_data/rain/1hr_2km_f48hr/ (ไฟล์เดียวมีทั้ง
// ข้อมูลย้อนหลัง + พยากรณ์ล่วงหน้าต่อเนื่องกัน) แทนการเรียก backend ภายนอก
// http://10.198.110.39:9001/rain/forecast-timeseries

const STATIONS = RAIN_STATIONS;
type StationCode = keyof typeof STATIONS;

function toRunTimeString(runSlot: string): string {
  // "YYYYMMDD_HHMM" -> "YYYY-MM-DD HH:MM:SS"
  const y = runSlot.slice(0, 4);
  const m = runSlot.slice(4, 6);
  const d = runSlot.slice(6, 8);
  const hh = runSlot.slice(9, 11);
  const mm = runSlot.slice(11, 13);
  return `${y}-${m}-${d} ${hh}:${mm}:00`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const stationCode = searchParams.get("station_code") as StationCode | null;
    const limit = Number(searchParams.get("limit") ?? "500");

    if (!stationCode || !STATIONS[stationCode]) {
      return NextResponse.json(
        { error: "Invalid station_code", available_stations: Object.keys(STATIONS) },
        { status: 400 },
      );
    }

    const station = STATIONS[stationCode];
    const { text, runSlot } = await fetchLatestForecastCsv();
    const runTimeStr = toRunTimeString(runSlot);
    const runTimeMs = new Date(runTimeStr.replace(" ", "T")).getTime();

    const rows = parseForecastCsvColumn(text, stationCode as RainStationCode);

    // เก็บเฉพาะช่วง ±48 ชม. รอบเวลารัน (ย้อนหลังพอสำหรับกราฟ + พยากรณ์ล่วงหน้าเต็มช่วงของโมเดล)
    const withLeadHour = rows
      .map((r) => {
        const t = new Date(r.time.replace(" ", "T")).getTime();
        const lead_hour = (t - runTimeMs) / 3_600_000;
        return { ...r, t, lead_hour };
      })
      .filter((r) => !isNaN(r.t) && r.lead_hour >= -48 && r.lead_hour <= 48)
      .sort((a, b) => a.t - b.t);

    const trimmed =
      withLeadHour.length > limit ? withLeadHour.slice(-limit) : withLeadHour;

    const data = trimmed.map((r) => ({
      station_code: stationCode,
      station_name: station.name,
      forecast_datetime: r.time,
      rainfall_mm: r.value,
      lead_hour: r.lead_hour,
      model_run_time: runTimeStr,
    }));

    return NextResponse.json({
      station: {
        code: stationCode,
        name: station.name,
        latitude: station.lat,
        longitude: station.lon,
      },
      run: { run_time: runTimeStr },
      count: data.length,
      station_code: stationCode,
      data,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
