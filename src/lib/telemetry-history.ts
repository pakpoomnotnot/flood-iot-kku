import type { TelemetryReading } from "@/app/api/lib/fetchTelemetryReading";
import {
  PIPE_TELEMETRY_STATIONS,
  ROAD_TELEMETRY_STATIONS,
} from "@/lib/telemetry-stations";

export interface TelemetryChartPoint {
  label: string;
  value: number | null;
  date_time: string;
}

/**
 * ถ้าไม่มีข้อมูลใหม่นานเกินนี้ ให้ถือว่าเป็นช่วง "ไม่มีข้อมูล" (เซนเซอร์/สถานีขาดการเชื่อมต่อ)
 * แทนที่จะลากเส้นค่าล่าสุดต่อไปเรื่อยๆ ซึ่งทำให้กราฟดูเหมือนระดับน้ำคงที่ทั้งที่จริงๆ ไม่มีข้อมูลส่งเข้ามาเลย
 */
const MAX_GAP_MS = 2 * 3_600_000;

export function resolveTelemetryStationId(
  category: "pipe" | "road" | "lake",
  code: string,
): string {
  // สถานีบึง (Lake_01..Lake_06) ใช้รหัสเดียวกับชื่อไฟล์ CSV อยู่แล้ว ไม่มี mapId แยกแบบ WP/WR
  if (category === "lake") return code;
  if (code.startsWith("Pipe_") || code.startsWith("Road_")) return code;
  const stations =
    category === "pipe" ? PIPE_TELEMETRY_STATIONS : ROAD_TELEMETRY_STATIONS;
  return stations.find((s) => s.mapId === code)?.id ?? code;
}

function parseDateTime(dt: string): Date {
  return new Date(dt.replace(" ", "T"));
}

export function formatHourLabel(d: Date): string {
  return `${d.getDate()}-${d.toLocaleString("en", { month: "short" })} ${d
    .getHours()
    .toString()
    .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

/** ความละเอียดของกราฟย้อนหลัง — 15 นาที ให้ตรงกับรอบอัปเดตข้อมูลจริงบนแผนที่ (MQTT ส่งทุก 15 นาที) */
const BUCKET_MS = 15 * 60_000;
const BUCKETS_PER_HOUR = 3_600_000 / BUCKET_MS;

/** รวมข้อมูล telemetry เป็นจุดย้อนหลังทุก 15 นาที (ค่าล่าสุดในแต่ละช่วง) */
export function readingsToHourlyChart(
  readings: TelemetryReading[],
  hours = 24,
): TelemetryChartPoint[] {
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(Math.floor(now.getMinutes() / 15) * 15);

  const sorted = [...readings].sort(
    (a, b) =>
      parseDateTime(a.date_time).getTime() -
      parseDateTime(b.date_time).getTime(),
  );

  const points: TelemetryChartPoint[] = [];
  let lastKnown: number | null = null;
  let lastKnownTime: number | null = null;

  const totalBuckets = hours * BUCKETS_PER_HOUR;
  for (let i = totalBuckets - 1; i >= 0; i--) {
    const bucketStart = new Date(now.getTime() - i * BUCKET_MS);
    const bucketEnd = new Date(bucketStart.getTime() + BUCKET_MS);

    const inBucket = sorted.filter((r) => {
      const t = parseDateTime(r.date_time).getTime();
      return t >= bucketStart.getTime() && t < bucketEnd.getTime();
    });

    const latest = inBucket.length > 0 ? inBucket[inBucket.length - 1] : null;
    if (latest) {
      lastKnown = parseFloat(latest.water_level_m.toFixed(3));
      lastKnownTime = parseDateTime(latest.date_time).getTime();
    }

    const isGap =
      lastKnownTime === null || bucketStart.getTime() - lastKnownTime > MAX_GAP_MS;

    points.push({
      label: formatHourLabel(bucketStart),
      value: isGap ? null : lastKnown,
      date_time: latest?.date_time ?? bucketStart.toISOString(),
    });
  }

  return points;
}
