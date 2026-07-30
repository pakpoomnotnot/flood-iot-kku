/**
 * เกณฑ์ความรุนแรงของฝน — แยกเป็น 2 ชุดตามช่วงเวลาสะสม เพราะตัวเลข มม. รายชั่วโมง
 * กับรายวันมีสเกลต่างกันมาก ใช้เกณฑ์เดียวกันไม่ได้:
 *   - รายชั่วโมง/3 ชม. (HOURLY_BANDS): เกณฑ์เดิมของระบบ
 *   - รายวัน 24 ชม. (DAILY_BANDS): เกณฑ์กรมอุตุนิยมวิทยา (มม./วัน)
 */

export type RainSeverityWindow = "1h" | "3h" | "24h";

export interface RainSeverityBand {
  /** ค่ามากกว่า min นี้ถึงจะเข้าเกณฑ์นี้ (exclusive) */
  min: number;
  /** label สั้นๆ ใช้ร่วมกับ badge สี (ไม่มีคำว่า "ฝน" นำหน้า เพื่อให้เข้ากับ mapping สีเดิม) */
  label: string;
  /** label เต็มสำหรับแสดงในแถบ legend บนแผนที่ */
  legendLabel: string;
  /** ช่วงตัวเลขสำหรับแสดงในแถบ legend */
  rangeLabel: string;
  color: string;
  textColor: string;
}

const NO_RAIN: RainSeverityBand = {
  min: -Infinity,
  label: "ไม่มีฝน",
  legendLabel: "ไม่มีฝน",
  rangeLabel: "0",
  color: "#90caf9",
  textColor: "#1f2937",
};

/** เกณฑ์ปริมาณฝนรายชั่วโมง / 3 ชม. (มม.) — เกณฑ์เดิมของระบบ */
export const HOURLY_BANDS: RainSeverityBand[] = [
  { min: 40, label: "วิกฤติ", legendLabel: "วิกฤติ", rangeLabel: "> 40.0", color: "#b71c1c", textColor: "#fff" },
  { min: 30, label: "เตือนภัย", legendLabel: "เตือนภัย", rangeLabel: "30.1–40.0", color: "#ef6c00", textColor: "#fff" },
  { min: 20, label: "เฝ้าระวัง", legendLabel: "เฝ้าระวัง", rangeLabel: "20.1–30.0", color: "#fbc02d", textColor: "#333" },
  { min: 0, label: "ปกติ", legendLabel: "ปกติ", rangeLabel: "0.0–20.0", color: "#2e7d32", textColor: "#fff" },
];

/** เกณฑ์ปริมาณฝนรายวัน (มม./วัน) ตามเกณฑ์กรมอุตุนิยมวิทยา */
export const DAILY_BANDS: RainSeverityBand[] = [
  { min: 90, label: "หนักมาก", legendLabel: "ฝนหนักมาก", rangeLabel: "> 90", color: "#e53935", textColor: "#fff" },
  { min: 70, label: "หนัก", legendLabel: "ฝนหนัก", rangeLabel: "> 70–90", color: "#a0522d", textColor: "#fff" },
  { min: 50, label: "หนัก", legendLabel: "ฝนหนัก", rangeLabel: "> 50–70", color: "#fb8c00", textColor: "#fff" },
  { min: 35, label: "หนัก", legendLabel: "ฝนหนัก", rangeLabel: "> 35–50", color: "#ffd54f", textColor: "#333" },
  { min: 20, label: "ปานกลาง", legendLabel: "ฝนปานกลาง", rangeLabel: "> 20–35", color: "#4caf50", textColor: "#fff" },
  { min: 10, label: "ปานกลาง", legendLabel: "ฝนปานกลาง", rangeLabel: "> 10–20", color: "#a5d6a7", textColor: "#333" },
  { min: 0, label: "เล็กน้อย", legendLabel: "ฝนเล็กน้อย", rangeLabel: "> 0–10", color: "#74b9ff", textColor: "#fff" },
];

export function getRainBands(window: RainSeverityWindow): RainSeverityBand[] {
  return window === "24h" ? DAILY_BANDS : HOURLY_BANDS;
}

/** แถบ legend เรียงจากค่าน้อย → มาก (สำหรับแสดงเป็นแท่งสีจากซ้ายไปขวา) */
export function getRainLegendSegments(window: RainSeverityWindow): RainSeverityBand[] {
  return [...getRainBands(window)].reverse();
}

export function getRainSeverity(
  value: number,
  window: RainSeverityWindow,
): RainSeverityBand {
  if (!(value > 0)) return NO_RAIN;
  const bands = getRainBands(window);
  return bands.find((b) => value > b.min) ?? bands[bands.length - 1];
}

export function windowLabel(window: RainSeverityWindow): string {
  if (window === "1h") return "1 ชั่วโมง";
  if (window === "3h") return "3 ชั่วโมง";
  return "24 ชั่วโมง (รายวัน)";
}
