import type { TelemetryStationMeta } from "@/lib/telemetry-stations";

export const TELEMETRY_BASE_URL =
  process.env.TELEMETRY_CSV_BASE_URL ||
  "http://10.101.111.123:8080/transfer_data/telemetry_mqtt_data";

export type TelemetryCategory = "lake" | "pipe" | "road";

export interface TelemetryReading {
  date_time: string;
  receive_time: string;
  topic: string;
  water_level_cm: number;
  water_level_m: number;
  water_flow: number;
  water_total: number;
  rain_value: number;
  rain_daily: number;
  wind_direction_name: string;
  air_temp: number;
  air_humid: number;
  temp: number;
  humid: number;
}

// schema คงที่ของไฟล์ telemetry CSV (lake/pipe/road) — ดู docs/mqtt-data-source.md หัวข้อ 5
// คอลัมน์ 0-25 ไม่มี comma ฝังอยู่ในค่า (มีแต่คอลัมน์ raw_json ท้ายสุดที่ห่อด้วย "..." และมี comma ข้างใน)
// ใช้ index ตายตัว + split ธรรมดาได้อย่างปลอดภัย ไม่ต้อง parse CSV แบบรองรับ quote
const COL = {
  date_time: 0,
  receive_time: 1,
  topic: 2,
  rain_value: 3,
  rain_daily: 5,
  water_level: 6,
  water_flow: 7,
  water_total: 8,
  wind_direction_name: 11,
  air_temp: 12,
  air_humid: 13,
  temp: 22,
  humid: 23,
};

function rowToReadingFromCols(cols: string[], category: TelemetryCategory): TelemetryReading {
  const num = (i: number) => parseFloat(cols[i] ?? "0") || 0;
  const rawLevel = num(COL.water_level);
  // pipe/road เก็บ water_level เป็นเซนติเมตร ส่วน lake เก็บเป็นเมตร (ม.รทก./MSL) อยู่แล้ว
  const waterLevelM = category === "lake" ? rawLevel : rawLevel / 100;

  return {
    date_time: cols[COL.date_time] ?? "",
    receive_time: cols[COL.receive_time] ?? "",
    topic: cols[COL.topic] ?? "",
    water_level_cm: category === "lake" ? rawLevel * 100 : rawLevel,
    water_level_m: waterLevelM,
    water_flow: num(COL.water_flow),
    water_total: num(COL.water_total),
    rain_value: num(COL.rain_value),
    rain_daily: num(COL.rain_daily),
    wind_direction_name: cols[COL.wind_direction_name] ?? "",
    air_temp: num(COL.air_temp),
    air_humid: num(COL.air_humid),
    temp: num(COL.temp),
    humid: num(COL.humid),
  };
}

/**
 * สถานีควรส่งข้อมูลทุก ~15 นาที — ถ้า reading ล่าสุดเก่ากว่า threshold นี้มาก
 * แปลว่า MQTT ไม่มีการอัปเดตเข้ามาแล้ว (สถานีอาจเสีย/ขาดการเชื่อมต่อ) ต้องแจ้งเตือนแยก
 * จากกรณี "ไม่มีข้อมูลเลย" (no_data)
 */
const STALE_THRESHOLD_MS = 90 * 60 * 1000; // 90 นาที (เผื่อ margin จาก interval 15 นาที)

export function isStaleReading(dateTime: string | undefined): boolean {
  if (!dateTime) return false;
  const t = new Date(dateTime.replace(" ", "T")).getTime();
  if (isNaN(t)) return false;
  return Date.now() - t > STALE_THRESHOLD_MS;
}

// ไฟล์ CSV ของ MQTT บางไฟล์ใหญ่หลาย MB แต่ส่วนใหญ่ต้องการแค่ไม่กี่วันล่าสุด — ขอด้วย
// HTTP Range ท้ายไฟล์ก่อน (เบากว่าโหลดทั้งไฟล์มาก) ถ้าเซิร์ฟเวอร์ไม่รองรับ Range (คืน 200
// แทน 206) ค่อย fallback ใช้ทั้งไฟล์ที่ได้มา
async function fetchCsvTail(url: string, tailBytes: number, timeoutMs: number): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Range: `bytes=-${tailBytes}` },
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok && res.status !== 206) {
        throw new Error(`HTTP ${res.status}`);
      }
      const text = await res.text();
      // ถ้าได้ 206 (partial) แถวแรกอาจถูกตัดกลางบรรทัด ตัดทิ้งไปเพื่อความปลอดภัย
      return res.status === 206 ? text.slice(text.indexOf("\n") + 1) : text;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function splitDataLines(text: string): string[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  return lines[0]?.startsWith("date_time") ? lines.slice(1) : lines;
}

export async function fetchTelemetryHistory(
  category: TelemetryCategory,
  stationId: string,
  hours = 24,
): Promise<TelemetryReading[]> {
  const url = `${TELEMETRY_BASE_URL}/${category}/${stationId}.csv`;

  // ~700 ไบต์/แถว ทุก 15 นาที เผื่อ margin ให้พอสำหรับช่วงเวลาที่ขอ (สูงสุด 7 วัน)
  const tailBytes = Math.min(3_000_000, Math.max(300_000, hours * 4 * 700 * 1.3));
  const text = await fetchCsvTail(url, Math.round(tailBytes), 30_000);
  const lines = splitDataLines(text);
  if (lines.length === 0) return [];

  const cutoff = Date.now() - hours * 3_600_000;

  return lines
    .map((line) => rowToReadingFromCols(line.split(","), category))
    .filter((reading) => {
      const t = new Date(reading.date_time.replace(" ", "T")).getTime();
      return !isNaN(t) && t >= cutoff;
    })
    .sort((a, b) => a.date_time.localeCompare(b.date_time));
}

export async function fetchLatestTelemetryReading(
  category: TelemetryCategory,
  stationId: string,
): Promise<TelemetryReading | null> {
  const url = `${TELEMETRY_BASE_URL}/${category}/${stationId}.csv`;
  const text = await fetchCsvTail(url, 20_000, 15_000);
  const lines = splitDataLines(text);
  if (lines.length === 0) return null;

  lines.sort((a, b) => b.localeCompare(a)); // date_time เป็นคอลัมน์แรก เรียง string ได้ตรงกับเวลา
  return rowToReadingFromCols(lines[0].split(","), category);
}

export interface TelemetryStationResult {
  station_id: string;
  map_id: string | null;
  name_th: string;
  location: { lat: number; lng: number; area: string };
  status: "ok" | "no_data" | "error";
  /** true เมื่อมี reading แต่ date_time เก่ากว่า ~90 นาที — MQTT หยุดอัปเดต ไม่ใช่แค่ไม่มีข้อมูลตั้งแต่แรก */
  stale?: boolean;
  error?: string;
  date_time?: string;
  receive_time?: string;
  water_level_cm?: number;
  water_level_m?: number;
  water_flow?: number;
  water_total?: number;
  temp?: number;
  humid?: number;
}

export async function fetchTelemetryStations(
  category: "pipe" | "road",
  stations: TelemetryStationMeta[],
): Promise<TelemetryStationResult[]> {
  const results = await Promise.allSettled(
    stations.map(async (station) => {
      const reading = await fetchLatestTelemetryReading(category, station.id);
      return { station, reading };
    }),
  );

  return results.map((result, index) => {
    const station = stations[index];

    if (result.status === "rejected") {
      return {
        station_id: station.id,
        map_id: station.mapId,
        name_th: station.name,
        location: {
          lat: station.lat,
          lng: station.lon,
          area: station.location,
        },
        status: "error" as const,
        error:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      };
    }

    const { reading } = result.value;
    if (!reading) {
      return {
        station_id: station.id,
        map_id: station.mapId,
        name_th: station.name,
        location: {
          lat: station.lat,
          lng: station.lon,
          area: station.location,
        },
        status: "no_data" as const,
      };
    }

    return {
      station_id: station.id,
      map_id: station.mapId,
      name_th: station.name,
      location: {
        lat: station.lat,
        lng: station.lon,
        area: station.location,
      },
      status: "ok" as const,
      stale: isStaleReading(reading.date_time),
      date_time: reading.date_time,
      receive_time: reading.receive_time,
      water_level_cm: reading.water_level_cm,
      water_level_m: reading.water_level_m,
      water_flow: reading.water_flow,
      water_total: reading.water_total,
      temp: reading.temp,
      humid: reading.humid,
    };
  });
}
