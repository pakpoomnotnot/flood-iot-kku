import type { TelemetryReading } from "@/app/api/lib/fetchTelemetryReading";
import {
  PIPE_TELEMETRY_STATIONS,
  ROAD_TELEMETRY_STATIONS,
} from "@/lib/telemetry-stations";

export interface TelemetryChartPoint {
  label: string;
  value: number;
  date_time: string;
}

export function resolveTelemetryStationId(
  category: "pipe" | "road",
  code: string,
): string {
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
    .padStart(2, "0")}:00`;
}

/** รวมข้อมูล telemetry เป็นจุดรายชั่วโมงย้อนหลัง (ค่าล่าสุดในแต่ละชั่วโมง) */
export function readingsToHourlyChart(
  readings: TelemetryReading[],
  hours = 24,
): TelemetryChartPoint[] {
  const now = new Date();
  now.setMinutes(0, 0, 0);

  const sorted = [...readings].sort(
    (a, b) =>
      parseDateTime(a.date_time).getTime() -
      parseDateTime(b.date_time).getTime(),
  );

  const points: TelemetryChartPoint[] = [];
  let lastKnown = 0;

  for (let i = hours - 1; i >= 0; i--) {
    const bucketStart = new Date(now.getTime() - i * 3_600_000);
    const bucketEnd = new Date(bucketStart.getTime() + 3_600_000);

    const inBucket = sorted.filter((r) => {
      const t = parseDateTime(r.date_time).getTime();
      return t >= bucketStart.getTime() && t < bucketEnd.getTime();
    });

    const latest = inBucket.length > 0 ? inBucket[inBucket.length - 1] : null;
    if (latest) {
      lastKnown = parseFloat(latest.water_level_m.toFixed(3));
    }

    points.push({
      label: formatHourLabel(bucketStart),
      value: lastKnown,
      date_time: latest?.date_time ?? bucketStart.toISOString(),
    });
  }

  return points;
}
