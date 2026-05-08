export interface LakeInfo {
  id: string;
  nameTh: string;
  nameEn: string;
  lat: number;
  lng: number;
}

export const LAKES: LakeInfo[] = [
  {
    id: "Lake_01",
    nameTh: "สะพาน บ้านทุ่งเศรษฐี (ทางน้ำเปิด)",
    nameEn: "Ban Thung Sethee Bridge (Open Channel)",
    lat: 16.435,
    lng: 102.869,
  },
  {
    id: "Lake_02",
    nameTh: "บึงทุ่งสร้าง",
    nameEn: "Bueng Thung Sang",
    lat: 16.452,
    lng: 102.855,
  },
  {
    id: "Lake_03",
    nameTh: "บึงแก่นนคร",
    nameEn: "Bueng Kaen Nakhon",
    lat: 16.419,
    lng: 102.836,
  },
  {
    id: "Lake_04",
    nameTh: "คุ้มสีฐาน มหาวิทยาลัยขอนแก่น (ทางน้ำเปิด)",
    nameEn: "Khum Seethan, Khon Kaen University (Open Channel)",
    lat: 16.443,
    lng: 102.814,
  },
  {
    id: "Lake_05",
    nameTh: "บึงหนองโคตร",
    nameEn: "Bueng Nong Khot",
    lat: 16.429,
    lng: 102.805,
  },
  {
    id: "Lake_06",
    nameTh: "หนองเลิงเปือย",
    nameEn: "Nong Loeng Phuai",
    lat: 16.430,
    lng: 102.877,
  },
];

export const LAKE_MAP = Object.fromEntries(LAKES.map((l) => [l.id, l]));