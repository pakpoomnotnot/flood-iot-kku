// app/api/rain/actual/route.ts
//
// ข้อมูลฝน "จริง" จาก MQTT (telemetry_<CODE>.csv) แบ่งตามช่วงเวลา (window)
// ดูกฎการคำนวณใน src/app/api/lib/rainActualSource.ts
import { NextRequest, NextResponse } from "next/server";
import { RAIN_STATION_DISPLAY_ORDER } from "@/lib/rain-stations";
import {
  computeActual,
  fetchStationRows,
  type RainWindow,
} from "@/app/api/lib/rainActualSource";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const windowParam = (searchParams.get("window") ?? "1h") as RainWindow;
  if (!["1h", "3h", "24h", "15m"].includes(windowParam)) {
    return NextResponse.json(
      { error: "invalid window, use 1h | 3h | 24h | 15m" },
      { status: 400 },
    );
  }
  const stationCode = searchParams.get("station_code");

  if (stationCode) {
    if (!/^[A-Za-z0-9_]+$/.test(stationCode)) {
      return NextResponse.json({ error: "invalid station_code" }, { status: 400 });
    }
    try {
      const rows = await fetchStationRows(stationCode);
      const result = computeActual(rows, windowParam);
      return NextResponse.json({ station_code: stationCode, window: windowParam, ...result });
    } catch (e: any) {
      return NextResponse.json(
        {
          station_code: stationCode,
          window: windowParam,
          value: 0,
          time: null,
          series: [],
          error: e.message ?? "โหลดข้อมูล MQTT ไม่สำเร็จ",
        },
        { status: 200 },
      );
    }
  }

  // bulk: ทุกสถานี (ใช้เติมตารางรวม)
  const results = await Promise.allSettled(
    RAIN_STATION_DISPLAY_ORDER.map(async (code) => {
      const rows = await fetchStationRows(code);
      const { value, time } = computeActual(rows, windowParam);
      return { station_code: code, value, time };
    }),
  );

  const stations = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { station_code: RAIN_STATION_DISPLAY_ORDER[i], value: 0, time: null },
  );

  return NextResponse.json({ window: windowParam, stations });
}
