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
    location: "ต. บ้านค้อ อ. เมือง",
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
    name: "ถนนหมอชาญอุทิศ",
    location: "ต. ในเมือง อ. เมือง",
    lat: 16.451517,
    lon: 102.831126,
  },
  {
    id: "Pipe_05",
    mapId: "WP05",
    name: "ศูนย์วิจัยและเพาะเลี้ยงสัตว์น้ำจืด",
    location: "ต. บ้านค้อ อ. เมือง",
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

export const PIPE_BY_MAP_ID = Object.fromEntries(
  PIPE_TELEMETRY_STATIONS.filter((s) => s.mapId).map((s) => [s.mapId!, s]),
);

export const ROAD_BY_MAP_ID = Object.fromEntries(
  ROAD_TELEMETRY_STATIONS.filter((s) => s.mapId).map((s) => [s.mapId!, s]),
);
