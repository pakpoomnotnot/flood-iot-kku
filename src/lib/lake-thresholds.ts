/** เกณฑ์ freeboard ต่อบึง — ใช้ร่วมกันระหว่างแผนที่ ตาราง และ dashboard */
export const LAKE_CONFIG = {
  Lake_02: { maxLevel: 150.0, watchFB: 1.5 },
  Lake_03: { maxLevel: 153.0, watchFB: 1.5 },
  Lake_05: { maxLevel: 155.6, watchFB: 1.75 },
  Lake_06: { maxLevel: 151.5, watchFB: 1.5 },
} as const;

export type LakeId = keyof typeof LAKE_CONFIG;

export type PondStatusKey = "critical" | "warning" | "watch" | "normal" | "nodata";

export type PondStatusThai =
  | "วิกฤต"
  | "เตือนภัย"
  | "เฝ้าระวัง"
  | "ปกติ"
  | "ไม่มีข้อมูล";

const STATUS_THAI: Record<PondStatusKey, PondStatusThai> = {
  critical: "วิกฤต",
  warning: "เตือนภัย",
  watch: "เฝ้าระวัง",
  normal: "ปกติ",
  nodata: "ไม่มีข้อมูล",
};

export function getPondFreeboard(
  lakeId: string,
  waterLevel: number | undefined,
): number | null {
  const cfg = LAKE_CONFIG[lakeId as LakeId];
  if (!cfg || waterLevel == null || isNaN(waterLevel)) return null;
  return parseFloat((cfg.maxLevel - waterLevel).toFixed(2));
}

export function getPondStatus(
  lakeId: string,
  waterLevel: number | undefined,
): PondStatusKey {
  const cfg = LAKE_CONFIG[lakeId as LakeId];
  if (!cfg || waterLevel == null || isNaN(waterLevel) || waterLevel === 0) {
    return "nodata";
  }
  const fb = cfg.maxLevel - waterLevel;
  if (fb < 0.5) return "critical";
  if (fb < 1.0) return "warning";
  if (fb < cfg.watchFB) return "watch";
  return "normal";
}

export function getPondStatusThai(
  lakeId: string,
  waterLevel: number | undefined,
): PondStatusThai {
  return STATUS_THAI[getPondStatus(lakeId, waterLevel)];
}

/**
 * เกณฑ์สี freeboard ต่อบึง — แหล่งอ้างอิงเดียวที่ marker บนแผนที่ (map_swamp),
 * legend บนแผนที่ และสีสถานะในตาราง (dashbaord-table) ใช้ร่วมกันทั้งหมด
 * ค่าตรงกับ getPondStatus() ทุกประการ (critical<0.5, warning<1.0, watch<watchFB)
 */
export interface PondThresholdSegment {
  label: PondStatusThai;
  range: string;
  color: string;
  textColor: string;
  minFB: number;
  maxFB: number;
}

const STATUS_COLOR: Record<Exclude<PondStatusKey, "nodata">, { color: string; textColor: string }> = {
  critical: { color: "#bf360c", textColor: "#fff" },
  warning: { color: "#f57f17", textColor: "#fff" },
  watch: { color: "#fdd835", textColor: "#333" },
  normal: { color: "#d0f8ce", textColor: "#333" },
};

export const NO_DATA_COLOR = { color: "#e5e7eb", textColor: "#6b7280" };

export function getLakeLegendSegments(lakeId: string): PondThresholdSegment[] {
  const cfg = LAKE_CONFIG[lakeId as LakeId];
  if (!cfg) return [];
  return [
    { label: "วิกฤต", range: "< 0.50 ม.", minFB: -Infinity, maxFB: 0.5, ...STATUS_COLOR.critical },
    { label: "เตือนภัย", range: "0.50–1.00 ม.", minFB: 0.5, maxFB: 1.0, ...STATUS_COLOR.warning },
    {
      label: "เฝ้าระวัง",
      range: `1.00–${cfg.watchFB.toFixed(2)} ม.`,
      minFB: 1.0,
      maxFB: cfg.watchFB,
      ...STATUS_COLOR.watch,
    },
    {
      label: "ปกติ",
      range: `> ${cfg.watchFB.toFixed(2)} ม.`,
      minFB: cfg.watchFB,
      maxFB: Infinity,
      ...STATUS_COLOR.normal,
    },
  ];
}

/** สี marker/badge จากระดับน้ำดิบตรงๆ — ให้ตรงกับ marker บนแผนที่และ badge ในตารางเป๊ะๆ */
export function getPondColor(
  lakeId: string,
  waterLevel: number | undefined,
): { color: string; textColor: string } {
  const status = getPondStatus(lakeId, waterLevel);
  if (status === "nodata") return NO_DATA_COLOR;
  return STATUS_COLOR[status];
}
