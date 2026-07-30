export type PipeLevelStatusThai =
  | "วิกฤต"
  | "เตือนภัย"
  | "เฝ้าระวัง"
  | "ปานกลาง"
  | "ปกติ"
  | "ไม่มีข้อมูล";

export type RoadLevelStatusThai =
  | "น้ำท่วม"
  | "สูง"
  | "กลาง"
  | "ต่ำ"
  | "ปกติ"
  | "ไม่มีข้อมูล";

export interface LevelBand {
  /** ค่ามากกว่า min นี้ถึงจะเข้าเกณฑ์นี้ (exclusive) */
  min: number;
  label: string;
  range: string;
  color: string;
  textColor: string;
}

/**
 * เกณฑ์ระดับน้ำในท่อ (ม.) — แหล่งอ้างอิงเดียวที่ marker บนแผนที่ (map_drainage),
 * legend บนแผนที่ และสีสถานะในตาราง (dashbaord-table) ใช้ร่วมกันทั้งหมด
 * เพื่อไม่ให้สีเพี้ยนไปคนละทางเหมือนที่เคยเกิดขึ้น
 */
export const PIPE_BANDS: LevelBand[] = [
  { min: 2.5, label: "วิกฤต", range: "> 2.5", color: "#bf360c", textColor: "#fff" },
  { min: 2.0, label: "เตือนภัย", range: "> 2.0–2.5", color: "#8d6e63", textColor: "#fff" },
  { min: 1.5, label: "เฝ้าระวัง", range: "> 1.5–2.0", color: "#f57f17", textColor: "#fff" },
  { min: 1.0, label: "ปานกลาง", range: "> 1.0–1.5", color: "#fdd835", textColor: "#333" },
  { min: 0.5, label: "ปานกลาง", range: "> 0.5–1.0", color: "#7cb342", textColor: "#fff" },
  { min: -Infinity, label: "ปกติ", range: "0–0.5", color: "#81d4fa", textColor: "#333" },
];

/**
 * เกณฑ์ระดับน้ำบนผิวถนน (ม.) — แหล่งอ้างอิงเดียวที่ marker บนแผนที่ (map_road),
 * legend บนแผนที่ และสีสถานะในตาราง ใช้ร่วมกันทั้งหมด
 */
export const ROAD_BANDS: LevelBand[] = [
  { min: 0.69, label: "น้ำท่วม", range: "> 0.69", color: "#bf360c", textColor: "#fff" },
  { min: 0.57, label: "สูง", range: "> 0.57–0.69", color: "#8d6e63", textColor: "#fff" },
  { min: 0.46, label: "สูง", range: "> 0.46–0.57", color: "#f57f17", textColor: "#fff" },
  { min: 0.34, label: "กลาง", range: "> 0.34–0.46", color: "#fdd835", textColor: "#333" },
  { min: 0.23, label: "กลาง", range: "> 0.23–0.34", color: "#7cb342", textColor: "#fff" },
  { min: 0.11, label: "ต่ำ", range: "> 0.11–0.23", color: "#d0f8ce", textColor: "#333" },
  { min: -Infinity, label: "ปกติ", range: "0–0.11", color: "#81d4fa", textColor: "#333" },
];

function bandFor(bands: LevelBand[], levelM: number): LevelBand {
  return bands.find((b) => levelM > b.min) ?? bands[bands.length - 1];
}

/** สี badge เมื่อไม่มีข้อมูล (ใช้ร่วมกันทั้งตารางและแผนที่) */
export const NO_DATA_COLOR = { color: "#e5e7eb", textColor: "#6b7280" };

/**
 * หมายเหตุ: ระดับน้ำท่อ/ถนน 0.00 ม. เป็นค่าที่เกิดขึ้นจริงและพบบ่อย (ท่อแห้ง/ถนนไม่มีน้ำท่วม
 * ตอนไม่มีฝน) จึง "ไม่" ถือว่า 0 คือไม่มีข้อมูล (ต่างจากระดับน้ำบึงที่เป็นค่าระดับ รทก. ซึ่ง 0
 * เป็นไปไม่ได้ทางกายภาพ) — ไม่มีข้อมูลจริงๆ คือกรณี undefined/NaN (ไม่มี reading เข้ามาเลย)
 */
function isNoDataLevel(levelM: number | undefined): levelM is undefined {
  return levelM == null || isNaN(levelM);
}

/** ระดับน้ำในท่อ (ม.) — ตาม LEGEND ใน map_drainage */
export function getPipeLevelStatusThai(levelM: number | undefined): PipeLevelStatusThai {
  if (isNoDataLevel(levelM)) return "ไม่มีข้อมูล";
  return bandFor(PIPE_BANDS, levelM).label as PipeLevelStatusThai;
}

/** ระดับน้ำบนผิวถนน (ม.) — ตาม LEGEND ใน map_road */
export function getRoadLevelStatusThai(levelM: number | undefined): RoadLevelStatusThai {
  if (isNoDataLevel(levelM)) return "ไม่มีข้อมูล";
  return bandFor(ROAD_BANDS, levelM).label as RoadLevelStatusThai;
}

export function getPipeMarkerColor(levelM: number): string {
  if (isNoDataLevel(levelM)) return NO_DATA_COLOR.color;
  return bandFor(PIPE_BANDS, levelM).color;
}

export function getRoadMarkerColor(levelM: number): string {
  if (isNoDataLevel(levelM)) return NO_DATA_COLOR.color;
  return bandFor(ROAD_BANDS, levelM).color;
}

/** สี badge ของตาราง (คำนวณจากค่าดิบตรงๆ ให้ตรงกับ marker/legend บนแผนที่เป๊ะๆ) */
export function getPipeLevelColor(levelM: number | undefined): { color: string; textColor: string } {
  if (isNoDataLevel(levelM)) return NO_DATA_COLOR;
  const b = bandFor(PIPE_BANDS, levelM);
  return { color: b.color, textColor: b.textColor };
}

export function getRoadLevelColor(levelM: number | undefined): { color: string; textColor: string } {
  if (isNoDataLevel(levelM)) return NO_DATA_COLOR;
  const b = bandFor(ROAD_BANDS, levelM);
  return { color: b.color, textColor: b.textColor };
}

export function bucketSurfaceWaterLevels(levels: Array<number | undefined>) {
  const stats = { critical: 0, alert: 0, watch: 0, normal: 0, noData: 0 };
  levels.forEach((levelM) => {
    if (levelM == null || isNaN(levelM)) {
      stats.noData++;
      return;
    }
    if (levelM >= 0.15) stats.critical++;
    else if (levelM >= 0.08) stats.alert++;
    else if (levelM >= 0.03) stats.watch++;
    else stats.normal++;
  });
  return stats;
}

/** จัดกลุ่มระดับน้ำในท่อ (ม.) ตามเกณฑ์ map_drainage */
export function bucketPipeLevels(levels: Array<number | undefined>) {
  const stats = { critical: 0, alert: 0, watch: 0, normal: 0, noData: 0 };
  levels.forEach((levelM) => {
    if (isNoDataLevel(levelM)) {
      stats.noData++;
      return;
    }
    if (levelM > 2.5) stats.critical++;
    else if (levelM > 2.0) stats.alert++;
    else if (levelM > 1.5) stats.watch++;
    else stats.normal++;
  });
  return stats;
}

/** จัดกลุ่มระดับน้ำบนถนน (ม.) ตามเกณฑ์ map_road */
export function bucketRoadLevels(levels: Array<number | undefined>) {
  const stats = { critical: 0, alert: 0, watch: 0, normal: 0, noData: 0 };
  levels.forEach((levelM) => {
    if (isNoDataLevel(levelM)) {
      stats.noData++;
      return;
    }
    if (levelM > 0.69) stats.critical++;
    else if (levelM > 0.46) stats.alert++;
    else if (levelM > 0.23) stats.watch++;
    else stats.normal++;
  });
  return stats;
}

export function formatTelemetryTime(dateTime?: string): string {
  if (!dateTime) return "—";
  const d = new Date(dateTime.replace(" ", "T"));
  if (isNaN(d.getTime())) return dateTime;
  return d.toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
