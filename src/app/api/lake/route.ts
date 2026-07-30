import { NextResponse } from "next/server";
import { fetchLatestTelemetryReading, isStaleReading } from "../lib/fetchTelemetryReading";
import { LAKES } from "../lib/lakes";

interface LavRow { level: number; area: number; vol: number; }
interface LavInfo { maxVol: number; maxArea: number; rows: LavRow[]; }

const LAV: Record<string, LavInfo> = {
  // Lake_01: สะพาน บ้านทุ่งเศรษฐี (ทางน้ำเปิด) — ไม่มีตาราง LAV (ทางน้ำเปิด)
  // Lake_02: บึงทุ่งสร้าง
  Lake_02: {
    maxVol: 2240580.209, maxArea: 742715.252,
    rows: [
      { level: 150.0, area: 742715.252, vol: 2240580.209 },
      { level: 149.5, area: 728119.710, vol: 1872613.424 },
      { level: 149.0, area: 709894.577, vol: 1512923.241 },
      { level: 148.5, area: 672133.779, vol: 1168838.097 },
      { level: 148.0, area: 653026.598, vol:  837623.486 },
      { level: 147.5, area: 633984.684, vol:  515923.480 },
      { level: 147.0, area: 595332.889, vol:  210643.401 },
      { level: 146.5, area: 176572.427, vol:   17941.403 },
      { level: 146.0, area:  15865.753, vol:    1259.342 },
    ],
  },
  // Lake_03: บึงแก่นนคร
  Lake_03: {
    maxVol: 1800273.44, maxArea: 604444.60,
    rows: [
      { level: 152.0, area: 604444.60,  vol: 1800273.440 },
      { level: 151.5, area: 596553.82,  vol: 1499434.180 },
      { level: 151.0, area: 590101.47,  vol: 1202730.070 },
      { level: 150.5, area: 573454.11,  vol:  912835.530 },
      { level: 150.0, area: 537618.64,  vol:  633312.880 },
      { level: 149.5, area: 437042.52,  vol:  386984.340 },
      { level: 149.0, area: 307379.96,  vol:  201313.080 },
      { level: 148.5, area: 175730.32,  vol:   80190.360 },
      { level: 148.0, area:  89470.15,  vol:   13967.170 },
      { level: 147.5, area:   5601.33,  vol:     944.030 },
      { level: 147.0, area:    713.17,  vol:      95.390 },
    ],
  },
  // Lake_04: คุ้มสีฐาน มหาวิทยาลัยขอนแก่น (ทางน้ำเปิด) — ไม่มีตาราง LAV (ทางน้ำเปิด)
  // Lake_05: บึงหนองโคตร
  Lake_05: {
    maxVol: 7042958.829, maxArea: 1091408.30,
    rows: [
      { level: 155.0, area: 1091408.30, vol: 7042958.829 },
      { level: 154.5, area: 1082261.86, vol: 6499502.459 },
      { level: 154.0, area: 1070785.25, vol: 5961217.788 },
      { level: 153.5, area: 1051155.60, vol: 5431230.875 },
      { level: 153.0, area: 1033267.54, vol: 4909906.539 },
      { level: 152.5, area: 1015241.26, vol: 4397662.928 },
      { level: 152.0, area:  998249.51, vol: 3894825.483 },
      { level: 151.5, area:  979688.97, vol: 3400359.133 },
      { level: 151.0, area:  958023.69, vol: 2916040.387 },
      { level: 150.5, area:  928415.59, vol: 2444380.698 },
      { level: 150.0, area:  884737.59, vol: 1991166.335 },
      { level: 149.5, area:  821914.62, vol: 1561960.896 },
      { level: 149.0, area:  735077.25, vol: 1170074.717 },
      { level: 148.5, area:  625223.68, vol:  829540.808 },
      { level: 148.0, area:  452735.38, vol:  566579.393 },
      { level: 147.5, area:  320752.68, vol:  374294.954 },
      { level: 147.0, area:  235260.02, vol:  238270.355 },
      { level: 146.5, area:  162074.05, vol:  142121.555 },
      { level: 146.0, area:  106837.00, vol:   77902.363 },
      { level: 145.5, area:   55900.69, vol:   43025.011 },
      { level: 145.0, area:   35902.28, vol:   20976.852 },
      { level: 144.5, area:   18540.02, vol:    8457.009 },
      { level: 144.0, area:    8858.72, vol:    2317.830 },
      { level: 143.5, area:    2641.99, vol:     245.266 },
      { level: 143.0, area:      61.41, vol:       0.000 },
    ],
  },
  // Lake_06: หนองเลิงเปือย
  Lake_06: {
    maxVol: 1374617.490, maxArea: 300597.883,
    rows: [
      { level: 151.5, area: 300597.883, vol: 1374617.490 },
      { level: 151.0, area: 294528.131, vol: 1225826.964 },
      { level: 150.5, area: 288410.097, vol: 1080085.479 },
      { level: 150.0, area: 276435.774, vol:  938885.265 },
      { level: 149.5, area: 256420.342, vol:  805568.543 },
      { level: 149.0, area: 235258.272, vol:  683157.218 },
      { level: 148.5, area: 224103.445, vol:  568467.528 },
      { level: 148.0, area: 211944.453, vol:  459508.669 },
      { level: 147.5, area: 199358.150, vol:  356694.676 },
      { level: 147.0, area: 181922.376, vol:  260595.203 },
      { level: 146.5, area: 152651.150, vol:  176641.370 },
      { level: 146.0, area: 105758.932, vol:  113336.951 },
      { level: 145.5, area:  70154.586, vol:   71275.541 },
      { level: 145.0, area:  52412.629, vol:   41682.544 },
      { level: 144.5, area:  37669.750, vol:   19191.062 },
      { level: 144.0, area:  20047.157, vol:    5728.448 },
      { level: 143.5, area:   8037.282, vol:       0.000 },
    ],
  },
};

function computeLAV(
  lakeId: string,
  level: number
): { water_volume_m3: number; water_area_m2: number; capacity_pct: number } | null {
  const info = LAV[lakeId];
  if (!info || level == null || isNaN(level)) return null;

  const { rows, maxVol } = info;
  let area = 0;
  let vol  = 0;

  if (level >= rows[0].level) {
    area = rows[0].area;
    vol  = rows[0].vol;
  } else if (level <= rows[rows.length - 1].level) {
    area = rows[rows.length - 1].area;
    vol  = rows[rows.length - 1].vol;
  } else {
    for (let i = 0; i < rows.length - 1; i++) {
      const hi = rows[i];
      const lo = rows[i + 1];
      if (level <= hi.level && level >= lo.level) {
        const t = (level - lo.level) / (hi.level - lo.level);
        area = lo.area + t * (hi.area - lo.area);
        vol  = lo.vol  + t * (hi.vol  - lo.vol);
        break;
      }
    }
  }

  return {
    water_volume_m3: Math.round(vol  * 1000) / 1000,
    water_area_m2:   Math.round(area * 100)  / 100,
    capacity_pct:    Math.round((vol / maxVol) * 10000) / 100,
  };
}

export async function GET() {
  const results = await Promise.allSettled(
    LAKES.map(async (lake) => {
      const reading = await fetchLatestTelemetryReading("lake", lake.id);
      return { lake, reading };
    })
  );

  const fetched_at = new Date().toISOString();

  const lakes = results.map((result, i) => {
    const lake = LAKES[i];

    if (result.status === "rejected") {
      return {
        lake_id: lake.id,
        name_th: lake.nameTh,
        name_en: lake.nameEn,
        location: { lat: lake.lat, lng: lake.lng },
        status: "error",
        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
      };
    }

    const { reading } = result.value;
    if (!reading) {
      return {
        lake_id: lake.id,
        name_th: lake.nameTh,
        name_en: lake.nameEn,
        location: { lat: lake.lat, lng: lake.lng },
        status: "no_data",
      };
    }

    const lav = computeLAV(lake.id, reading.water_level_m);

    return {
      lake_id: lake.id,
      name_th: lake.nameTh,
      name_en: lake.nameEn,
      location: { lat: lake.lat, lng: lake.lng },
      status: "ok",
      stale: isStaleReading(reading.date_time),
      water_level: reading.water_level_m,
      water_flow:  reading.water_flow,
      water_total: reading.water_total,
      rain_value:  reading.rain_value,
      rain_daily:  reading.rain_daily,
      air_temp:    reading.air_temp,
      air_humid:   reading.air_humid,
      wind_direction_name: reading.wind_direction_name,
      date_time:   reading.date_time,
      water_volume_m3: lav?.water_volume_m3 ?? null,
      water_area_m2:   lav?.water_area_m2   ?? null,
      capacity_pct:    lav?.capacity_pct    ?? null,
    };
  });

  return NextResponse.json(
    { fetched_at, count: lakes.length, lakes },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}