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
