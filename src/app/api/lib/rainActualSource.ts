/**
 * ข้อมูลฝน "จริง" จาก MQTT (telemetry_<CODE>.csv) แบ่งตามช่วงเวลา (window):
 *   - 1h/3h: คำนวณจากผลต่างของ rain_total (สะสมไม่รีเซ็ตตามชั่วโมง) ระหว่างแถวติดกันทีละคู่
 *     ทุก 15 นาที แล้วรวมย้อนหลังตามหน้าต่างเวลาที่ต้องการ ยึดเวลาจากแถวล่าสุดในข้อมูลจริงเสมอ
 *     (ไม่ใช่เวลานาฬิกาปัจจุบัน) — ใช้ rain_total แทน rain_value ตรงๆ เพราะ rain_value จาก MQTT
 *     บางสถานีค้างค่าเดิมซ้ำหลายรอบ 15 นาทีแล้วค่อยรีเซ็ตเป็น 0 (ไม่ใช่ปริมาณฝนที่ตกใหม่ต่อรอบ)
 *     ถ้ารวมตรงๆ จะนับซ้ำ ส่วนผลต่างของ rain_total คำนวณทีละคู่แถวจะได้ปริมาณฝนต่อรอบที่ถูกต้อง
 *     รองรับกรณี rain_total รีเซ็ต (ค่าลดฮวบกลางทาง เช่น รีบูตอุปกรณ์) ด้วยการไม่หักลบติดลบ
 *   - 24h: ใช้ rain_daily ของแถวล่าสุด (เวลาใดก็ได้) ตรงๆ เหมือนเดิม
 */

const MQTT_RAIN_BASE =
  "http://10.101.111.123:8080/transfer_data/telemetry_mqtt_data/rain";

export type RainWindow = "1h" | "3h" | "24h" | "15m";

export interface RainRow {
  date_time: string;
  rain_value: number;
  rain_total: number;
  rain_daily: number;
}

export interface SeriesPoint {
  label: string;
  time: string;
  value: number;
}

// parser CSV ที่รองรับ field ห่อด้วย "..." (คอลัมน์ raw_json มี comma/quote ซ้อนอยู่)
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

function hourLabel(dt: string): string {
  const [datePart, timePart] = dt.split(" ");
  const [, m, d] = datePart.split("-");
  const hh = timePart?.slice(0, 5) ?? "";
  return `${d}/${m} ${hh}`;
}

// ไฟล์ CSV ของ MQTT บางไฟล์ใหญ่หลาย MB แต่เราต้องการแค่ข้อมูลไม่กี่วันล่าสุด
// ขอเฉพาะท้ายไฟล์ด้วย HTTP Range ก่อน (เบากว่าโหลดทั้งไฟล์มาก) — ถ้าเซิร์ฟเวอร์ไม่รองรับ
// Range (คืน 200 แทน 206) ค่อย fallback ไปโหลดทั้งไฟล์
const TAIL_BYTES = 300_000; // ~500-700 แถวล่าสุด เพียงพอสำหรับ window 1h/3h/24h(7 วันย้อนหลัง)

async function fetchCsvTail(url: string): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Range: `bytes=-${TAIL_BYTES}` },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok && res.status !== 206) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      // ถ้าได้ 206 (partial) แถวแรกอาจถูกตัดกลางบรรทัด ตัดทิ้งไปเพื่อความปลอดภัย
      return res.status === 206 ? text.slice(text.indexOf("\n") + 1) : text;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

// schema คงที่ของไฟล์ telemetry_<CODE>.csv (ดู docs/mqtt-data-source.md หัวข้อ 5) —
// ใช้ index ตายตัวแทนการ parse header เพราะตอนขอด้วย Range ท้ายไฟล์จะไม่มีแถว header ติดมาด้วย
const COL = { date_time: 0, rain_value: 3, rain_total: 4, rain_daily: 5 };

export async function fetchStationRows(stationCode: string): Promise<RainRow[]> {
  const url = `${MQTT_RAIN_BASE}/telemetry_${stationCode}.csv`;
  const text = await fetchCsvTail(url);
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];

  // ตัดบรรทัด header ทิ้งถ้าไฟล์เล็กกว่า TAIL_BYTES เลยได้ header ติดมาด้วย
  const dataLines = lines[0].startsWith("date_time") ? lines.slice(1) : lines;

  // เอาแค่ท้ายไฟล์พอ กันกรณี fallback เป็นโหลดทั้งไฟล์ (บางไฟล์ 8MB+)
  const tail = dataLines.slice(-2000);

  return tail
    .map((line) => {
      const cols = parseCsvLine(line);
      return {
        date_time: cols[COL.date_time],
        rain_value: Number(cols[COL.rain_value]) || 0,
        rain_total: Number(cols[COL.rain_total]) || 0,
        rain_daily: Number(cols[COL.rain_daily]) || 0,
      };
    })
    .filter((r) => {
      const t = new Date(r.date_time?.replace(" ", "T") ?? "");
      return !isNaN(t.getTime());
    })
    .sort((a, b) => a.date_time.localeCompare(b.date_time));
}

export function computeActual(
  rows: RainRow[],
  windowParam: RainWindow,
): { value: number; time: string | null; series: SeriesPoint[] } {
  if (rows.length === 0) return { value: 0, time: null, series: [] };

  if (windowParam === "24h") {
    const latest = rows[rows.length - 1];
    const byDate = new Map<string, RainRow>();
    for (const r of rows) byDate.set(r.date_time.slice(0, 10), r);
    const dates = [...byDate.keys()].sort().slice(-7);
    const series = dates.map((d) => {
      const r = byDate.get(d)!;
      return { label: d.slice(5), time: r.date_time, value: r.rain_daily };
    });
    return { value: latest.rain_daily, time: latest.date_time, series };
  }

  // ปริมาณฝนแต่ละรอบ 15 นาที = ผลต่าง rain_total ระหว่างแถวติดกัน (กันรีเซ็ตกลางทางไม่ให้ติดลบ)
  const deltaPoints: SeriesPoint[] = [];
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1];
    const curr = rows[i];
    const raw = curr.rain_total - prev.rain_total;
    // raw ติดลบ = rain_total รีเซ็ต (เช่น รีบูตอุปกรณ์) ระหว่างสองแถวนี้ — ถือว่าค่าปัจจุบัน
    // ทั้งหมดคือฝนที่ตกนับจากรีเซ็ต (อุปกรณ์เริ่มนับใหม่จากใกล้ 0)
    const delta = raw >= 0 ? raw : curr.rain_total;
    deltaPoints.push({
      label: hourLabel(curr.date_time),
      time: curr.date_time,
      value: Math.max(0, parseFloat(delta.toFixed(2))),
    });
  }
  if (deltaPoints.length === 0) {
    return { value: 0, time: rows[rows.length - 1]?.date_time ?? null, series: [] };
  }

  // แสดงย้อนหลัง 24 ชม. ล่าสุดที่ความละเอียด 15 นาที (ทุก tab ใช้ series เดียวกัน ต่างกันแค่ยอดรวม)
  const series = deltaPoints.slice(-96);
  const latestTime = deltaPoints[deltaPoints.length - 1].time;

  // 15m = ไม่รวมย้อนหลัง เอาแค่รอบ 15 นาทีล่าสุดรอบเดียว (ใช้แสดงค่า "ล่าสุด" ใน popup โดยไม่ยุ่งกับ
  // เกณฑ์สีความรุนแรงที่คำนวณจากยอดสะสมรายชั่วโมง)
  if (windowParam === "15m") {
    const last = deltaPoints[deltaPoints.length - 1];
    return { value: last.value, time: last.time, series };
  }

  // ยอดรวมของหน้าต่างเวลาที่เลือก ยึดจาก "แถวล่าสุดในข้อมูลจริง" ย้อนหลังไปตามจำนวนรอบ 15 นาที
  // (ไม่ใช่เวลานาฬิกาปัจจุบัน) — 1h = ย้อน 4 รอบ, 3h = ย้อน 12 รอบ
  const roundsBack = windowParam === "1h" ? 4 : 12;
  const windowPoints = deltaPoints.slice(-roundsBack);
  const value = parseFloat(windowPoints.reduce((s, p) => s + p.value, 0).toFixed(2));

  return { value, time: latestTime, series };
}
