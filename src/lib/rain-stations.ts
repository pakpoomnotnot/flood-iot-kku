/** สถานีวัดปริมาณฝน — อัปเดตจาก location_telemetry_kkn_new.xlsx */
export const RAIN_STATIONS = {
  UNE_MC: {
    name: "ศูนย์อุตุนิยมวิทยาภาคตะวันออกเฉียงเหนือตอนบน",
    lat: 16.462351,
    lon: 102.785676,
  },
  BKN: {
    name: "สถานีสูบน้ำเสียบึงแก่นนคร",
    lat: 16.41982,
    lon: 102.837253,
  },
  BTS: {
    name: "สถานีสูบน้ำเสียบึงทุ่งสร้าง",
    lat: 16.438529,
    lon: 102.844659,
  },
  KKC_MUN: {
    name: "สำนักงานเทศบาลนครขอนแก่น",
    lat: 16.430254,
    lon: 102.829483,
  },
  NLP: {
    name: "สำนักงานเทศบาลตำบลพระลับ",
    lat: 16.415307,
    lon: 102.900005,
  },
  BNK: {
    name: "สถานีสูบน้ำพลังงานไฟฟ้าบึงหนองโคตร",
    lat: 16.429484,
    lon: 102.804717,
  },
  SIL_MUN: {
    name: "เทศบาลเมืองศิลา",
    lat: 16.4742179270467,
    lon: 102.849241639758,
  },
  MKO_MUN: {
    name: "สำนักงานเทศบาลเมืองเก่า",
    lat: 16.4018870643003,
    lon: 102.787782207717,
  },
  KKC_SP: {
    name: "อุทยานวิทยาศาสตร์ มหาวิทยาลัยขอนแก่น",
    lat: 16.455760,
    lon: 102.819849,
  },
  UNE_SH: {
    name: "บ้านพักข้าราชการศูนย์อุตุนิยมวิทยา",
    lat: 16.445932,
    lon: 102.831674,
  },
  RMUTI: {
    name: "มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน",
    lat: 16.429731,
    lon: 102.815895,
  },
  NEU: {
    name: "โรงเรียนสองภาษา",
    lat: 16.4404882746413,
    lon: 102.804895638965,
  },
  KKC_BL: {
    name: "โรงเรียนการศึกษาคนตาบอด ขอนแก่น",
    lat: 16.440488,
    lon: 102.804896,
  },
  BSV: {
    name: "สถานีดับเพลิง เทศบาลบ้านเป็ด",
    lat: 16.434369,
    lon: 102.758417,
  },
  SNK_HOSP: {
    name: "สถาบันวิจัยและพัฒนา RDI",
    lat: 16.47479,
    lon: 102.822987,
  },
} as const;

export type RainStationCode = keyof typeof RAIN_STATIONS;

/** ลำดับแสดงผลบนแผนที่ */
export const RAIN_STATION_DISPLAY_ORDER: RainStationCode[] = [
  "SNK_HOSP",
  "KKC_MUN",
  "BKN",
  "BTS",
  "NLP",
  "BNK",
  "SIL_MUN",
  "UNE_MC",
  "MKO_MUN",
  "NEU",
  "UNE_SH",
  "KKC_SP",
  "BSV",
  "RMUTI",
  "KKC_BL",
];

export function getRainStationNameMap(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(RAIN_STATIONS).map(([id, { name }]) => [id, name]),
  );
}
