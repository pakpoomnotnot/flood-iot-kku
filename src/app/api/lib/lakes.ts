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
    nameTh: "บึงแก่นนคร",
    nameEn: "Bueng Kaen Nakhon",
    lat: 16.4147,
    lng: 102.8382,
  },
  {
    id: "Lake_02",
    nameTh: "บึงทุ่งสร้าง",
    nameEn: "Bueng Thung Sang",
    lat: 16.4492,
    lng: 102.8514,
  },
  {
    id: "Lake_03",
    nameTh: "หนองเลิงเปือย",
    nameEn: "Nong Loeng Phuai",
    lat: 16.3131,
    lng: 103.7103,
  },
  {
    id: "Lake_04",
    nameTh: "บึงหนองโคตร",
    nameEn: "Bueng Nong Khot",
    lat: 16.4349,
    lng: 102.8025,
  },
];

export const LAKE_MAP = Object.fromEntries(LAKES.map((l) => [l.id, l]));