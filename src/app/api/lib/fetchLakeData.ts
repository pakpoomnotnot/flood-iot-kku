const BASE_URL =
  process.env.LAKE_CSV_BASE_URL ||
  "http://10.101.111.123:8080/transfer_data/telemetry_mqtt_data/lake";

export interface LakeReading {
  date_time: string;
  receive_time: string;
  topic: string;
  rain_value: number;
  rain_total: number;
  rain_daily: number;
  water_level: number;
  water_flow: number;
  water_total: number;
  wind_speed: number;
  wind_direction: number;
  wind_direction_name: string;
  air_temp: number;
  air_humid: number;
  light: number;
  v_battery: number;
  i_battery: number;
  temp: number;
  humid: number;
}

/** แปลง CSV text เป็น array ของ object */
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  return lines.slice(1).map((line) => {
    // handle quoted fields that may contain commas
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

/** ดึง CSV และคืนแถวล่าสุด (sort by date_time) */
export async function fetchLatestReading(
  lakeId: string
): Promise<LakeReading | null> {
  const url = `${BASE_URL}/${lakeId}.csv`;

  const res = await fetch(url, {
    next: { revalidate: 60 }, // cache 60 วินาที — ข้อมูลมาทุก 15 นาที
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`CSV fetch failed: ${res.status} ${res.statusText} — ${url}`);
  }

  const text = await res.text();
  const rows = parseCsv(text);
  if (rows.length === 0) return null;

  // เรียง date_time descending → เอาแถวแรก
  rows.sort((a, b) =>
    (b.date_time ?? "").localeCompare(a.date_time ?? "")
  );

  const r = rows[0];

  const num = (k: string) => parseFloat(r[k] ?? "0") || 0;

  return {
    date_time: r.date_time ?? "",
    receive_time: r.receive_time ?? "",
    topic: r.topic ?? "",
    rain_value: num("rain_value"),
    rain_total: num("rain_total"),
    rain_daily: num("rain_daily"),
    water_level: num("water_level"),
    water_flow: num("water_flow"),
    water_total: num("water_total"),
    wind_speed: num("wind_speed"),
    wind_direction: num("wind_direction"),
    wind_direction_name: r.wind_direction_name ?? "",
    air_temp: num("air_temp"),
    air_humid: num("air_humid"),
    light: num("light"),
    v_battery: num("v_battery"),
    i_battery: num("i_battery"),
    temp: num("temp"),
    humid: num("humid"),
  };
}