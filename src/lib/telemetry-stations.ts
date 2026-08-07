/** สถานี telemetry MQTT — จาก location_telemetry_kkn_new.xlsx */
export interface TelemetryStationMeta {
  id: string;
  mapId: string | null;
  name: string;
  location: string;
  lat: number;
  lon: number;
}

export const PIPE_TELEMETRY_STATIONS: TelemetryStationMeta[] = [
  {
    id: "Pipe_01",
    mapId: "WP04",
    name: "ประตูระบายน้ำที่ 5 (ในท่อก่อนเข้า ปตร.5)",
    location: "ต. ในเมือง อ. เมือง",
    lat: 16.431767,
    lon: 102.826917,
  },
  {
    id: "Pipe_02",
    mapId: "WP03",
    name: "หน้าร้านจิ้มจุ่มริมคลอง",
    location: "ต. ในเมือง อ. เมือง",
    lat: 16.422786,
    lon: 102.837357,
  },
  {
    id: "Pipe_03",
    mapId: null,
    name: "ประตูระบายน้ำ บึงแก่นนคร ฝั่งตลาดริมบึงแก่นนคร",
    location: "ต. ในเมือง อ. เมือง",
    lat: 16.418806,
    lon: 102.837213,
  },
  {
    id: "Pipe_04",
    mapId: "WP02",
    name: "หน้า ปตท.เมืองขอนแก่น 2",
    location: "ต. ในเมือง อ. เมือง",
    lat: 16.451517,
    lon: 102.831126,
  },
  {
    id: "Pipe_05",
    mapId: "WP05",
    name: "ทางเข้าบึงทุ่งสร้าง",
    location: "ต. ในเมือง อ. เมือง",
    lat: 16.443986,
    lon: 102.848139,
  },
  {
    id: "Pipe_06",
    mapId: "WP07",
    name: "หน้าโรงพยาบาลขอนแก่นราม",
    location: "ต. ในเมือง อ. เมือง",
    lat: 16.432271,
    lon: 102.821814,
  },
];

export const ROAD_TELEMETRY_STATIONS: TelemetryStationMeta[] = [
  {
    id: "Road_01",
    mapId: "WR01",
    name: "ตลาดจอมพล ถนนจอมพล",
    location: "ต. ในเมือง อ. เมือง",
    lat: 16.44779,
    lon: 102.841038,
  },
  {
    id: "Road_02",
    mapId: "WR02",
    name: "สถานีน้ำมันพีทีที หน้าซอยสวัสดี ถนนมิตรภาพ",
    location: "ต. ในเมือง อ. เมือง",
    lat: 16.452768,
    lon: 102.829881,
  },
  {
    id: "Road_03",
    mapId: "WR03",
    name: "ดิ ออริจิ้น แคมปัส ขอนแก่น โนนม่วง",
    location: "ต. ในเมือง อ. เมือง",
    lat: 16.489249,
    lon: 102.820054,
  },
  {
    id: "Road_04",
    mapId: "WR04",
    name: "ซอยกังวาน 4 ถนนบ้านกอก",
    location: "ต. บ้านเป็ด อ. เมือง",
    lat: 16.421397,
    lon: 102.811917,
  },
  {
    id: "Road_05",
    mapId: "WR05",
    name: "หน้าหมู่บ้านชลพฤกษ์ กรีนวิลล์ ถนนศรีจันทร์",
    location: "ต. บ้านเป็ด อ. เมือง",
    lat: 16.438184,
    lon: 102.78899,
  },
  {
    id: "Road_06",
    mapId: "WR06",
    name: "โรงเรียนการศึกษาคนตาบอด ขอนแก่น",
    location: "ต. ในเมือง อ. เมือง",
    lat: 16.44025,
    lon: 102.805883,
  },
  {
    id: "Road_07",
    mapId: "WR07",
    name: "หมู่บ้านอโณทัย",
    location: "ต. ในเมือง อ. เมือง",
    lat: 16.443982,
    lon: 102.806371,
  },
  {
    id: "Road_08",
    mapId: "WR08",
    name: "หมู่บ้านพวงเพชร 4",
    location: "ต. ในเมือง อ. เมือง",
    lat: 16.44978,
    lon: 102.795457,
  },
  {
    id: "Road_09",
    mapId: "WR09",
    name: "ตลาดหนองไผ่ ถนนโยธาธิการ 2060",
    location: "ต. ศิลา อ. เมือง",
    lat: 16.474705,
    lon: 102.856401,
  },
];

/**
 * สถานีในกลุ่ม "ท่อระบายน้ำ" (WP) ที่จริงๆ แล้วเป็นคลองเปิด ไม่ใช่ท่อปิด — ใช้แยก tab
 * ท่อ/คลอง บนแผนที่และตาราง (อ้างอิง map_id จาก stations_complete.json ไม่ใช่ id ของ telemetry)
 */
export const CANAL_MAP_IDS: ReadonlySet<string> = new Set(["WP06"]);

/**
 * สถานีคลอง (WP) ที่จริงๆ แล้วใช้ข้อมูลระดับน้ำจากสถานีบึงแบบ "ทางน้ำเปิด" (Lake_XX)
 * เช่น WP06 (สะพาน บ้านทุ่งเศรษฐี) กับ Lake_01 (สะพาน บ้านทุ่งเศรษฐี (ทางน้ำเปิด)) เป็นจุดเดียวกัน
 * มี telemetry จริงผ่าน /api/lake อยู่แล้ว จึงดึงมาแสดงในส่วนคลองแทนที่จะรอสาย telemetry ท่อแยกต่างหาก
 */
export const CANAL_LAKE_SOURCE: Record<string, string> = {
  WP06: "Lake_01",
};

export const PIPE_BY_MAP_ID = Object.fromEntries(
  PIPE_TELEMETRY_STATIONS.filter((s) => s.mapId).map((s) => [s.mapId!, s]),
);

/**
 * ความสูงท่อ + ตำแหน่งติดตั้ง sensor ต่อสถานี (ม.) — จากไฟล์ระดับท่อระบายน้ำ.xlsx
 * ใช้คำนวณ % ระดับน้ำในท่อ: ((ระดับน้ำที่วัดได้ + ตำแหน่งติดตั้ง sensor) / ความสูงท่อ) * 100
 * (สูตรเดียวกับที่ใช้ในไฟล์ต้นฉบับ คีย์ด้วย station_id "Pipe_XX" ไม่ใช่ map_id)
 */
export interface PipeCapacityConfig {
  heightM: number;
  sensorOffsetM: number;
}

export const PIPE_CAPACITY: Record<string, PipeCapacityConfig> = {
  Pipe_01: { heightM: 2, sensorOffsetM: 0.3 },
  Pipe_02: { heightM: 3, sensorOffsetM: 0.3 },
  Pipe_03: { heightM: 1.5, sensorOffsetM: 0.3 },
  Pipe_04: { heightM: 4, sensorOffsetM: 0.3 },
  Pipe_05: { heightM: 2, sensorOffsetM: 0.3 },
  Pipe_06: { heightM: 2, sensorOffsetM: 0.3 },
};

export function getPipeCapacityPct(
  stationId: string,
  waterLevelM: number | undefined,
): number | null {
  const cfg = PIPE_CAPACITY[stationId];
  if (!cfg || waterLevelM == null || isNaN(waterLevelM)) return null;
  const pct = ((waterLevelM + cfg.sensorOffsetM) / cfg.heightM) * 100;
  return Math.max(0, Math.min(100, pct));
}

export const ROAD_BY_MAP_ID = Object.fromEntries(
  ROAD_TELEMETRY_STATIONS.filter((s) => s.mapId).map((s) => [s.mapId!, s]),
);
