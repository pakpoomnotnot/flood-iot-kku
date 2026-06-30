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

/** ระดับน้ำในท่อ (ม.) — ตาม LEGEND ใน map_drainage */
export function getPipeLevelStatusThai(levelM: number | undefined): PipeLevelStatusThai {
  if (levelM == null || isNaN(levelM)) return "ไม่มีข้อมูล";
  if (levelM > 2.5) return "วิกฤต";
  if (levelM > 2.0) return "เตือนภัย";
  if (levelM > 1.5) return "เฝ้าระวัง";
  if (levelM > 1.0) return "ปานกลาง";
  if (levelM > 0.5) return "ปานกลาง";
  return "ปกติ";
}

/** ระดับน้ำบนผิวถนน (ม.) — ตาม LEGEND ใน map_road */
export function getRoadLevelStatusThai(levelM: number | undefined): RoadLevelStatusThai {
  if (levelM == null || isNaN(levelM)) return "ไม่มีข้อมูล";
  if (levelM > 0.69) return "น้ำท่วม";
  if (levelM > 0.46) return "สูง";
  if (levelM > 0.23) return "กลาง";
  if (levelM > 0.11) return "ต่ำ";
  return "ปกติ";
}

export function getPipeMarkerColor(levelM: number): string {
  if (levelM > 2.5) return "#bf360c";
  if (levelM > 2.0) return "#8d6e63";
  if (levelM > 1.5) return "#f57f17";
  if (levelM > 1.0) return "#fdd835";
  if (levelM > 0.5) return "#7cb342";
  return "#81d4fa";
}

export function getRoadMarkerColor(levelM: number): string {
  if (levelM > 0.69) return "#bf360c";
  if (levelM > 0.57) return "#8d6e63";
  if (levelM > 0.46) return "#f57f17";
  if (levelM > 0.34) return "#fdd835";
  if (levelM > 0.23) return "#7cb342";
  if (levelM > 0.11) return "#d0f8ce";
  return "#81d4fa";
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
    if (levelM == null || isNaN(levelM)) {
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
    if (levelM == null || isNaN(levelM)) {
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
