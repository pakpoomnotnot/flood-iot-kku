// app/api/rain/telemetry-history/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://10.101.111.123:8080/transfer_data/telemetry_mqtt_data/rain";

interface TelemetryRow {
  date_time: string;
  rain_value: number;
  rain_total: number;
  rain_daily: number;
  water_level: number;
}

// Parser CSV ธรรมดาที่รองรับ field ที่ห่อด้วย "..." และมี "" escape ข้างใน
// (จำเป็นเพราะคอลัมน์ raw_json มี comma/quote ซ้อนอยู่)
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") {
        result.push(cur);
        cur = "";
      } else cur += ch;
    }
  }
  result.push(cur);
  return result;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stationCode = searchParams.get("station_code");
  const hours = Number(searchParams.get("hours") ?? "24");

  if (!stationCode) {
    return NextResponse.json(
      { error: "station_code is required" },
      { status: 400 },
    );
  }

  // กันชื่อไฟล์หลุด path เช่น "../../etc/passwd"
  if (!/^[A-Za-z0-9_]+$/.test(stationCode)) {
    return NextResponse.json({ error: "invalid station_code" }, { status: 400 });
  }

  const fileUrl = `${BASE_URL}/telemetry_${stationCode}.csv`;

  try {
    const res = await fetch(fileUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) {
      return NextResponse.json({ station_code: stationCode, count: 0, data: [] });
    }

    const header = parseCsvLine(lines[0].replace(/^\uFEFF/, ""));
    const idx = {
      date_time: header.indexOf("date_time"),
      rain_value: header.indexOf("rain_value"),
      rain_total: header.indexOf("rain_total"),
      rain_daily: header.indexOf("rain_daily"),
      water_level: header.indexOf("water_level"),
    };

    // ไฟล์เรียงจากเก่า→ใหม่ ทุก 15 นาที เอาแค่ท้ายไฟล์พอ ไม่ต้อง parse ทั้งไฟล์ (บางไฟล์ 8MB)
    const rowsNeeded = Math.ceil((hours * 60) / 15) + 10;
    const tail = lines.slice(-rowsNeeded);

    const cutoff = Date.now() - hours * 3600_000;

    const data: TelemetryRow[] = tail
      .map((line) => {
        const cols = parseCsvLine(line);
        return {
          date_time: cols[idx.date_time],
          rain_value: Number(cols[idx.rain_value]) || 0,
          rain_total: Number(cols[idx.rain_total]) || 0,
          rain_daily: Number(cols[idx.rain_daily]) || 0,
          water_level: Number(cols[idx.water_level]) || 0,
        };
      })
      .filter((row) => {
        const t = new Date(row.date_time).getTime();
        return !isNaN(t) && t >= cutoff; // ตัดแถว header/บรรทัดเสียทิ้งไปในตัว
      });

    return NextResponse.json({
      station_code: stationCode,
      count: data.length,
      data,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "โหลดข้อมูล MQTT ไม่สำเร็จ" },
      { status: 502 },
    );
  }
}