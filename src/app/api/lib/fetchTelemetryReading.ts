import type { TelemetryStationMeta } from "@/lib/telemetry-stations";

export const TELEMETRY_BASE_URL =
  process.env.TELEMETRY_CSV_BASE_URL ||
  "http://10.101.111.123:8080/transfer_data/telemetry_mqtt_data";

export interface TelemetryReading {
  date_time: string;
  receive_time: string;
  topic: string;
  water_level_cm: number;
  water_level_m: number;
  water_flow: number;
  water_total: number;
  rain_daily: number;
  air_temp: number;
  air_humid: number;
  temp: number;
  humid: number;
}

export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const ch of line) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());

    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

function rowToReading(row: Record<string, string>): TelemetryReading {
  const num = (k: string) => parseFloat(row[k] ?? "0") || 0;
  const waterLevelCm = num("water_level");

  return {
    date_time: row.date_time ?? "",
    receive_time: row.receive_time ?? "",
    topic: row.topic ?? "",
    water_level_cm: waterLevelCm,
    water_level_m: waterLevelCm / 100,
    water_flow: num("water_flow"),
    water_total: num("water_total"),
    rain_daily: num("rain_daily"),
    air_temp: num("air_temp"),
    air_humid: num("air_humid"),
    temp: num("temp"),
    humid: num("humid"),
  };
}

export async function fetchLatestTelemetryReading(
  category: "lake" | "pipe" | "road",
  stationId: string,
): Promise<TelemetryReading | null> {
  const url = `${TELEMETRY_BASE_URL}/${category}/${stationId}.csv`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`CSV fetch failed: ${res.status} ${res.statusText} — ${url}`);
  }

  const rows = parseCsv(await res.text());
  if (rows.length === 0) return null;

  rows.sort((a, b) => (b.date_time ?? "").localeCompare(a.date_time ?? ""));
  return rowToReading(rows[0]);
}

export interface TelemetryStationResult {
  station_id: string;
  map_id: string | null;
  name_th: string;
  location: { lat: number; lng: number; area: string };
  status: "ok" | "no_data" | "error";
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
