// app/api/rain/forecast/route.ts
//
// ข้อมูลฝน "พยากรณ์" จากไฟล์รันล่าสุดของโมเดล 1hr_2km_f48hr
// (http://10.101.111.123:8080/transfer_data/rain/1hr_2km_f48hr/) แบ่งตามช่วงเวลา (window):
//   - 1h : ค่าพยากรณ์ของชั่วโมงถัดไป 1 ชม. จากปัจจุบัน
//   - 3h : sum ค่าพยากรณ์ 3 ชั่วโมงถัดไปจากปัจจุบัน
//
// แทนที่การเรียก backend ภายนอก http://10.198.110.39:9001
import { NextRequest, NextResponse } from "next/server";
import { RAIN_STATION_DISPLAY_ORDER } from "@/lib/rain-stations";
import {
  bangkokNowString,
  fetchLatestForecastCsv,
  hourLabel,
  parseForecastCsvAll,
  parseForecastCsvColumn,
  type ForecastRow,
} from "@/app/api/lib/rainForecastSource";

type RainWindow = "1h" | "3h";

interface SeriesPoint {
  label: string;
  time: string;
  value: number;
}

function computeForecast(
  rows: ForecastRow[],
  windowParam: RainWindow,
): { value: number; time: string | null; series: SeriesPoint[] } {
  const nowStr = bangkokNowString();
  const future = rows
    .filter((r) => r.time > nowStr)
    .sort((a, b) => a.time.localeCompare(b.time));
  if (future.length === 0) return { value: 0, time: null, series: [] };

  if (windowParam === "1h") {
    const series = future
      .slice(0, 24)
      .map((r) => ({ label: hourLabel(r.time), time: r.time, value: r.value }));
    return { value: future[0].value, time: future[0].time, series };
  }

  // 3h — sum ค่าพยากรณ์ทีละ 3 ชั่วโมงถัดไปเรื่อยๆ
  const buckets: SeriesPoint[] = [];
  for (let start = 0; start < future.length && buckets.length < 8; start += 3) {
    const chunk = future.slice(start, start + 3);
    if (chunk.length === 0) break;
    const sum = chunk.reduce((s, r) => s + r.value, 0);
    const last = chunk[chunk.length - 1];
    buckets.push({ label: hourLabel(last.time), time: last.time, value: parseFloat(sum.toFixed(3)) });
  }
  return { value: buckets[0]?.value ?? 0, time: buckets[0]?.time ?? null, series: buckets };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const windowParam = (searchParams.get("window") ?? "1h") as RainWindow;
  if (!["1h", "3h"].includes(windowParam)) {
    return NextResponse.json({ error: "invalid window, use 1h | 3h" }, { status: 400 });
  }
  const stationCode = searchParams.get("station_code");

  try {
    const { text, runSlot } = await fetchLatestForecastCsv();

    if (stationCode) {
      if (!/^[A-Za-z0-9_]+$/.test(stationCode)) {
        return NextResponse.json({ error: "invalid station_code" }, { status: 400 });
      }
      const rows = parseForecastCsvColumn(text, stationCode);
      const result = computeForecast(rows, windowParam);
      return NextResponse.json({
        station_code: stationCode,
        window: windowParam,
        run_slot: runSlot,
        ...result,
      });
    }

    const allRows = parseForecastCsvAll(text, RAIN_STATION_DISPLAY_ORDER);
    const stations = RAIN_STATION_DISPLAY_ORDER.map((code) => {
      const rowsForCode = allRows.map((r) => ({ time: r.time, value: r.values[code] }));
      const { value, time } = computeForecast(rowsForCode, windowParam);
      return { station_code: code, value, time };
    });

    return NextResponse.json({ window: windowParam, run_slot: runSlot, stations });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "โหลดข้อมูลพยากรณ์ฝนไม่สำเร็จ" },
      { status: 502 },
    );
  }
}
