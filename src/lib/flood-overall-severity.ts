import { LAKE_CONFIG, getPondStatusThai } from "@/lib/lake-thresholds";
import { getPipeLevelStatusThai, getRoadLevelStatusThai } from "@/lib/water-level-status";
import type { TelemetryStationResult } from "@/app/api/lib/fetchTelemetryReading";

export interface LakeApiItemLite {
  lake_id: string;
  name_th: string;
  status: "ok" | "error" | "no_data";
  water_level?: number;
}

export type OverallSeverity = "CRITICAL" | "WARNING" | "WATCH" | "NORMAL";

export const OVERALL_SEVERITY_TEXT: Record<OverallSeverity, string> = {
  CRITICAL: "วิกฤต",
  WARNING: "เตือนภัย",
  WATCH: "เฝ้าระวัง",
  NORMAL: "ปกติ",
};

/** ประเมินสถานะรวมของทั้งเมือง จากบึง/ท่อระบายน้ำ/ถนน จริงทุกจุด — ใช้ร่วมกันระหว่าง
 * หน้าศูนย์บัญชาการ (map_help.tsx) และตัวสร้างรายงาน PDF (pdfGenerator.tsx) */
export function computeOverallSeverity(
  lakes: LakeApiItemLite[],
  pipes: TelemetryStationResult[],
  roads: TelemetryStationResult[],
): { level: OverallSeverity; reasons: string[] } {
  const reasons: string[] = [];
  let level: OverallSeverity = "NORMAL";

  const bump = (next: OverallSeverity) => {
    const order: OverallSeverity[] = ["NORMAL", "WATCH", "WARNING", "CRITICAL"];
    if (order.indexOf(next) > order.indexOf(level)) level = next;
  };

  Object.keys(LAKE_CONFIG).forEach((lakeId) => {
    const lake = lakes.find((l) => l.lake_id === lakeId);
    const status = getPondStatusThai(lakeId, lake?.status === "ok" ? lake.water_level : undefined);
    if (status === "วิกฤต") {
      bump("CRITICAL");
      reasons.push(`ระดับน้ำ${lake?.name_th ?? lakeId}ใกล้ล้นตลิ่ง`);
    } else if (status === "เตือนภัย") {
      bump("WARNING");
      reasons.push(`ระดับน้ำ${lake?.name_th ?? lakeId}สูงกว่าปกติ`);
    }
  });

  roads.forEach((r) => {
    const status = getRoadLevelStatusThai(r.status === "ok" ? r.water_level_m : undefined);
    if (status === "น้ำท่วม") {
      bump("CRITICAL");
      reasons.push(`น้ำท่วมผิวถนนที่ ${r.name_th}`);
    } else if (status === "สูง") {
      bump("WARNING");
    }
  });

  pipes.forEach((p) => {
    const status = getPipeLevelStatusThai(p.status === "ok" ? p.water_level_m : undefined);
    if (status === "วิกฤต") {
      bump("CRITICAL");
      reasons.push(`ระดับน้ำในท่อ ${p.name_th} สูงผิดปกติ`);
    } else if (status === "เตือนภัย") {
      bump("WARNING");
    }
  });

  return { level, reasons };
}
