// app/api/rain/route.ts — สรุปฝนสูงสุด (max_1h / max_3h / max_24h) ของทุกสถานี
// อ่านจาก MQTT โดยตรง (10.101.111.123) แทนการเรียก backend ภายนอก
// http://10.198.110.39:9001/rain/max-summary
import { NextResponse } from "next/server";
import { RAIN_STATION_DISPLAY_ORDER } from "@/lib/rain-stations";
import {
  computeActual,
  fetchStationRows,
  type RainWindow,
} from "@/app/api/lib/rainActualSource";

interface MaxEntry {
  station_name: string; // หมายเหตุ: จริงๆ คือ "รหัสสถานี" (เช่น "BTS") — ฝั่ง client จะ map เป็นชื่อไทยเองอีกที
  value: number;
}

async function buildMaxList(windowParam: RainWindow): Promise<MaxEntry[]> {
  const results = await Promise.allSettled(
    RAIN_STATION_DISPLAY_ORDER.map(async (code) => {
      const rows = await fetchStationRows(code);
      const { value } = computeActual(rows, windowParam);
      return { station_name: code, value };
    }),
  );
  return results
    .map((r, i) =>
      r.status === "fulfilled" ? r.value : { station_name: RAIN_STATION_DISPLAY_ORDER[i], value: 0 },
    )
    .sort((a, b) => b.value - a.value);
}

export async function GET() {
  try {
    const [max_1h, max_3h, max_24h] = await Promise.all([
      buildMaxList("1h"),
      buildMaxList("3h"),
      buildMaxList("24h"),
    ]);
    return NextResponse.json({ max_1h, max_3h, max_24h });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "โหลดข้อมูลฝนไม่สำเร็จ" },
      { status: 500 },
    );
  }
}
