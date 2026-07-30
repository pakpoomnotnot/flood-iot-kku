/**
 * แหล่งข้อมูลพยากรณ์ฝนภายใน — อ่านไฟล์ rain_interp_to_tele_*.csv โดยตรงจาก
 * http://10.101.111.123:8080/transfer_data/rain/1hr_2km_f48hr/
 * แทนการเรียก backend ภายนอก (http://10.198.110.39:9001)
 *
 * ไฟล์แต่ละไฟล์คือรันของโมเดล ตั้งชื่อ rain_interp_to_tele_1hr_2km_<YYYYMMDD>_<HHMM>.csv
 * รันทุก 3 ชม. (01,04,07,10,13,16,19,22 น. เวลาไทย) แทนที่จะโหลด directory listing
 * (มีไฟล์สะสมนับพัน) ทุกครั้ง เราคำนวณชื่อไฟล์ของรันล่าสุดจากเวลาปัจจุบันโดยตรง
 * แล้วไล่ถอยครั้งละ 3 ชม. หากยังไม่พบไฟล์ (เผื่อรันล่าสุดยังไม่ถูกเผยแพร่)
 */

const FORECAST_BASE =
  "http://10.101.111.123:8080/transfer_data/rain/1hr_2km_f48hr";
const RUN_HOURS = [1, 4, 7, 10, 13, 16, 19, 22];
const BANGKOK_OFFSET_MS = 7 * 3600_000;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** เวลาปัจจุบัน แสดงผลเป็น "wall clock" ของกรุงเทพฯ (UTC+7, ไม่มี DST) โดยอ่านผ่าน getUTC* */
function nowBangkok(): Date {
  return new Date(Date.now() + BANGKOK_OFFSET_MS);
}

function formatRunSlot(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}_${pad(d.getUTCHours())}00`;
}

function initialSlot(): Date {
  const d = nowBangkok();
  const hours = d.getUTCHours();
  const candidates = RUN_HOURS.filter((h) => h <= hours);
  const slot = new Date(d);
  slot.setUTCMinutes(0, 0, 0);
  if (candidates.length > 0) {
    slot.setUTCHours(Math.max(...candidates));
  } else {
    slot.setUTCDate(slot.getUTCDate() - 1);
    slot.setUTCHours(22);
  }
  return slot;
}

/** "YYYY-MM-DD HH:MM:SS" ตาม wall clock กรุงเทพฯ ปัจจุบัน (เทียบแบบ string ตรงๆ กับ datetime ในไฟล์ CSV ได้) */
export function bangkokNowString(): string {
  const d = nowBangkok();
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

export interface LatestForecastCsv {
  text: string;
  runSlot: string;
}

/** ดึงไฟล์รันล่าสุดของโมเดล 1hr_2km_f48hr (ไล่ถอยทีละ 3 ชม. ถ้ายังไม่พบ) */
export async function fetchLatestForecastCsv(): Promise<LatestForecastCsv> {
  let slot = initialSlot();
  let lastError: unknown;
  for (let attempt = 0; attempt < 6; attempt++) {
    const runSlot = formatRunSlot(slot);
    const url = `${FORECAST_BASE}/rain_interp_to_tele_1hr_2km_${runSlot}.csv`;
    try {
      const res = await fetch(url, {
        next: { revalidate: 900 },
        signal: AbortSignal.timeout(20_000),
      });
      if (res.ok) {
        const text = await res.text();
        return { text, runSlot };
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastError = e;
    }
    slot = new Date(slot.getTime() - 3 * 3600_000);
  }
  throw new Error(
    `ไม่พบไฟล์พยากรณ์ฝนล่าสุด: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

export interface ForecastRow {
  time: string;
  value: number;
}

/** parse คอลัมน์ของสถานีเดียวจาก CSV ข้อความดิบ */
export function parseForecastCsvColumn(
  text: string,
  stationCode: string,
): ForecastRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const header = lines[0].split(",");
  const colIdx = header.indexOf(stationCode);
  if (colIdx === -1) return [];
  return lines
    .slice(1)
    .map((line) => {
      const cols = line.split(",");
      return { time: cols[0], value: Number(cols[colIdx]) || 0 };
    })
    .filter((r) => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(r.time));
}

/** parse ทุกสถานีในคราวเดียว (ใช้กับ endpoint แบบ bulk เพื่อไม่ต้อง parse ไฟล์เดิมซ้ำหลายรอบ) */
export function parseForecastCsvAll(
  text: string,
  stationCodes: readonly string[],
): { time: string; values: Record<string, number> }[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const header = lines[0].split(",");
  const colIdxByStation = Object.fromEntries(
    stationCodes.map((c) => [c, header.indexOf(c)]),
  );
  return lines
    .slice(1)
    .map((line) => {
      const cols = line.split(",");
      const time = cols[0];
      const values: Record<string, number> = {};
      for (const c of stationCodes) {
        const idx = colIdxByStation[c];
        values[c] = idx >= 0 ? Number(cols[idx]) || 0 : 0;
      }
      return { time, values };
    })
    .filter((r) => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(r.time));
}

/** "YYYY-MM-DD HH:MM:SS" -> "DD/MM HH:MM" สำหรับ label กราฟ */
export function hourLabel(dt: string): string {
  const [datePart, timePart] = dt.split(" ");
  const [, m, d] = datePart.split("-");
  const hh = timePart?.slice(0, 5) ?? "";
  return `${d}/${m} ${hh}`;
}
