"use client";
import React, { useState, useEffect } from "react";
import {
  ComposedChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { getPondStatus } from "@/lib/lake-thresholds";

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────
interface WaterData {
  station:      string;
  location:     string;
  level:        number;
  bankLevel:    number;
  status:       string;
  diff:         number;
  time:         string;
  stationCode?: string;
}

// ─────────────────────────────────────────────
// LAV lookup tables (สำหรับคำนวณปริมาตร/พื้นที่)
// ─────────────────────────────────────────────
interface LavInfo {
  name_th:  string;
  maxVol:   number;
  maxArea:  number;
  maxLevel: number;
  table:    [number, number, number][];
}

const LAV_DATA: Record<string, LavInfo> = {
  Lake_02: {
    name_th:  "บึงทุ่งสร้าง",
    maxLevel: 150.0,
    maxVol:   2240580.209,
    maxArea:  742715.252,
    table: [
      [150.0, 742715.252, 2240580.209],
      [149.5, 728119.71,  1872613.424],
      [149.0, 709894.577, 1512923.241],
      [148.5, 672133.779, 1168838.097],
      [148.0, 653026.598, 837623.486],
      [147.5, 633984.684, 515923.48],
      [147.0, 595332.889, 210643.401],
      [146.5, 176572.427, 17941.403],
      [146.0, 15865.753,  1259.342],
    ],
  },
  Lake_03: {
    name_th:  "บึงแก่นนคร",
    maxLevel: 153.0,
    maxVol:   1800273.44,
    maxArea:  604444.6,
    table: [
      [152.0, 604444.6,  1800273.44],
      [151.5, 596553.82, 1499434.18],
      [151.0, 590101.47, 1202730.07],
      [150.5, 573454.11, 912835.53],
      [150.0, 537618.64, 633312.88],
      [149.5, 437042.52, 386984.34],
      [149.0, 307379.96, 201313.08],
      [148.5, 175730.32, 80190.36],
      [148.0, 89470.15,  13967.17],
      [147.5, 5601.33,   944.03],
      [147.0, 713.17,    95.39],
    ],
  },
  Lake_05: {
    name_th:  "บึงหนองโคตร",
    maxLevel: 155.6,
    maxVol:   7042958.829,
    maxArea:  1091408.3,
    table: [
      [155.0, 1091408.3,  7042958.829],
      [154.5, 1082261.86, 6499502.459],
      [154.0, 1070785.25, 5961217.788],
      [153.5, 1051155.6,  5431230.875],
      [153.0, 1033267.54, 4909906.539],
      [152.5, 1015241.26, 4397662.928],
      [152.0, 998249.51,  3894825.483],
      [151.5, 979688.97,  3400359.133],
      [151.0, 958023.69,  2916040.387],
      [150.5, 928415.59,  2444380.698],
      [150.0, 884737.59,  1991166.335],
      [149.5, 821914.62,  1561960.896],
      [149.0, 735077.25,  1170074.717],
      [148.5, 625223.68,  829540.808],
      [148.0, 452735.38,  566579.393],
      [147.5, 320752.68,  374294.954],
      [147.0, 235260.02,  238270.355],
      [146.5, 162074.05,  142121.555],
      [146.0, 106837.0,   77902.363],
      [145.5, 55900.69,   43025.011],
      [145.0, 35902.28,   20976.852],
      [144.5, 18540.02,   8457.009],
      [144.0, 8858.72,    2317.83],
      [143.5, 2641.99,    245.266],
      [143.0, 61.41,      0.0],
    ],
  },
  Lake_06: {
    name_th:  "หนองเลิงเปือย",
    maxLevel: 151.5,
    maxVol:   1374617.49,
    maxArea:  300597.883,
    table: [
      [151.5, 300597.883, 1374617.49],
      [151.0, 294528.131, 1225826.964],
      [150.5, 288410.097, 1080085.479],
      [150.0, 276435.774, 938885.265],
      [149.5, 256420.342, 805568.543],
      [149.0, 235258.272, 683157.218],
      [148.5, 224103.445, 568467.528],
      [148.0, 211944.453, 459508.669],
      [147.5, 199358.15,  356694.676],
      [147.0, 181922.376, 260595.203],
      [146.5, 152651.15,  176641.37],
      [146.0, 105758.932, 113336.951],
      [145.5, 70154.586,  71275.541],
      [145.0, 52412.629,  41682.544],
      [144.5, 37669.75,   19191.062],
      [144.0, 20047.157,  5728.448],
      [143.5, 8037.282,   0.0],
    ],
  },
};

function interpolateLAV(lakeId: string, level: number): { area: number; vol: number; pct: number } {
  const info = LAV_DATA[lakeId];
  if (!info) return { area: 0, vol: 0, pct: 0 };
  const table = info.table;
  let area = 0, vol = 0;
  if (level >= table[0][0]) {
    [, area, vol] = table[0];
  } else if (level <= table[table.length - 1][0]) {
    [, area, vol] = table[table.length - 1];
  } else {
    for (let i = 0; i < table.length - 1; i++) {
      const [l1, a1, v1] = table[i];
      const [l2, a2, v2] = table[i + 1];
      if (level <= l1 && level >= l2) {
        const t = (level - l2) / (l1 - l2);
        area    = a2 + t * (a1 - a2);
        vol     = v2 + t * (v1 - v2);
        break;
      }
    }
  }
  const pct = Math.min(100, Math.max(0, (vol / info.maxVol) * 100));
  return { area, vol, pct };
}

function fmtVol(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(3)} ล้าน ลบ.ม.`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(1)} พัน ลบ.ม.`;
  return `${v.toFixed(2)} ลบ.ม.`;
}
function fmtArea(a: number): string {
  if (a >= 1_000_000) return `${(a / 1_000_000).toFixed(4)} ตร.กม.`;
  return `${a.toLocaleString("th-TH", { maximumFractionDigits: 0 })} ตร.ม.`;
}

// ─────────────────────────────────────────────
// Status color helpers
// ─────────────────────────────────────────────
function rainfallStatusColor(status: string) {
  switch (status) {
    case "หนักมาก":  return "bg-red-500 text-white";
    case "หนัก":     return "bg-orange-400 text-white";
    case "ปานกลาง": return "bg-yellow-400 text-gray-900";
    case "เล็กน้อย": return "bg-blue-400 text-white";
    default:          return "bg-gray-200 text-gray-600";
  }
}

function pondStatusColor(status: string) {
  switch (status) {
    case "วิกฤต":    return "bg-red-600 text-white";
    case "เตือนภัย": return "bg-orange-500 text-white";
    case "เฝ้าระวัง": return "bg-yellow-400 text-gray-900";
    case "ไม่มีข้อมูล": return "bg-gray-200 text-gray-600";
    default:          return "bg-emerald-500 text-white";
  }
}

function pondFreeboardCellColor(lakeId: string | undefined, waterLevel: number): string {
  switch (getPondStatus(lakeId ?? "", waterLevel)) {
    case "critical":
      return "bg-red-100 text-red-700 border border-red-200";
    case "warning":
      return "bg-orange-100 text-orange-700 border border-orange-200";
    case "watch":
      return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    case "normal":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    default:
      return "bg-gray-100 text-gray-500 border border-gray-200";
  }
}

function pondFreeboardTextColor(lakeId: string | undefined, waterLevel: number): string {
  switch (getPondStatus(lakeId ?? "", waterLevel)) {
    case "critical": return "text-red-600";
    case "warning":  return "text-orange-500";
    case "watch":    return "text-yellow-600";
    case "normal":   return "text-emerald-600";
    default:         return "text-gray-500";
  }
}

function statusColor(status: string, mode: "rainfall" | "pond" | "default") {
  if (mode === "pond")    return pondStatusColor(status);
  if (mode === "rainfall") return rainfallStatusColor(status);
  // default (drainage, roads)
  switch (status) {
    case "สูง":    return "bg-red-500 text-white";
    case "กลาง":   return "bg-yellow-400 text-gray-900";
    case "ต่ำ":    return "bg-green-400 text-white";
    case "น้ำท่วม": return "bg-red-600 text-white";
    default:        return "bg-gray-200 text-gray-600";
  }
}

// ─────────────────────────────────────────────
// Mock data generator สำหรับกราฟระดับน้ำบึง
// ─────────────────────────────────────────────
interface HourlyPoint {
  label:      string;
  value:      number;
  actual:     number | null;
  forecast:   number | null;
  isCurrent:  boolean;
  isForecast: boolean;
}

function generateMockWaterLevel(currentLevel: number): HourlyPoint[] {
  const now  = new Date();
  let prev   = Math.max(currentLevel - Math.random() * 0.5, 0.1);
  return Array.from({ length: 24 }, (_, i) => {
    const t   = new Date(now.getTime() - (23 - i) * 3_600_000);
    const lbl = `${t.getDate()}-${t.toLocaleString("en", { month: "short" })} ${t
      .getHours()
      .toString()
      .padStart(2, "0")}:00`;
    const delta = (Math.random() - 0.45) * 0.15;
    prev        = Math.max(0.1, prev + delta);
    if (i === 23) prev = currentLevel;
    return {
      label:      lbl,
      value:      parseFloat(prev.toFixed(2)),
      actual:     parseFloat(prev.toFixed(2)),
      forecast:   null,
      isCurrent:  i === 23,
      isForecast: false,
    };
  });
}

// ─────────────────────────────────────────────
// Forecast data (rainfall chart)
// ─────────────────────────────────────────────
interface ForecastItem {
  station_code:      string;
  station_name:      string;
  forecast_datetime: string;
  rainfall_mm:       number;
  lead_hour:         number;
  model_run_time:    string;
}
interface ForecastResponse {
  run:          { run_time: string };
  count:        number;
  station_code: string;
  data:         ForecastItem[];
}

function toHourlyPoints(items: ForecastItem[]): HourlyPoint[] {
  const now    = new Date();
  const sorted = [...items].sort(
    (a, b) => new Date(a.forecast_datetime).getTime() - new Date(b.forecast_datetime).getTime(),
  );
  let closestIdx = 0, minDiff = Infinity;
  sorted.forEach((item, i) => {
    const diff = Math.abs(new Date(item.forecast_datetime).getTime() - now.getTime());
    if (diff < minDiff) { minDiff = diff; closestIdx = i; }
  });
  const firstForecastIdx = sorted.findIndex((item) => item.lead_hour > 0);
  return sorted.map((item, i) => {
    const t         = new Date(item.forecast_datetime);
    const label     = `${t.getDate()}-${t.toLocaleString("en", { month: "short" })} ${t.getHours().toString().padStart(2, "0")}:00`;
    const isForecast = item.lead_hour > 0;
    return {
      label,
      value:      item.rainfall_mm,
      actual:     !isForecast || i === firstForecastIdx ? item.rainfall_mm : null,
      forecast:   isForecast ? item.rainfall_mm : i === firstForecastIdx - 1 ? item.rainfall_mm : null,
      isCurrent:  i === closestIdx,
      isForecast,
    };
  });
}

function sliceByRatio(points: HourlyPoint[]): HourlyPoint[] {
  const actualPoints   = points.filter((p) => p.actual !== null);
  const forecastPoints = points.filter((p) => p.forecast !== null);
  if (actualPoints.length === 0 || forecastPoints.length === 0) return points;
  const unit = Math.min(Math.floor(actualPoints.length / 3), Math.floor(forecastPoints.length / 2));
  if (unit === 0) return points;
  const keepActualLabels   = new Set(actualPoints.slice(-(unit * 3)).map((p) => p.label));
  const keepForecastLabels = new Set(forecastPoints.slice(0, unit * 2).map((p) => p.label));
  const keepLabels         = new Set([...keepActualLabels, ...keepForecastLabels]);
  return points.filter((p) => keepLabels.has(p.label));
}

// ─────────────────────────────────────────────
// Custom Tooltips
// ─────────────────────────────────────────────
const RainfallTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const isForecast = payload[0]?.payload?.isForecast;
  const val        = payload[0]?.payload?.value;
  return (
    <div className="rounded-lg border border-blue-100 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700">
        {label}
        {isForecast && (
          <span className="ml-1.5 rounded-full bg-purple-100 px-1.5 py-0.5 text-purple-600 font-medium">
            พยากรณ์
          </span>
        )}
      </p>
      <p className={`font-bold mt-0.5 ${isForecast ? "text-purple-600" : "text-blue-600"}`}>
        {val} มม.
      </p>
    </div>
  );
};

const WaterLevelTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-600 mb-1">{label}</p>
      <p className="font-bold text-emerald-700">{payload[0].value} ม.รทก.</p>
    </div>
  );
};

// ─────────────────────────────────────────────
// Chart Modal — Rainfall
// ─────────────────────────────────────────────
interface RainfallChartModalProps {
  station: WaterData;
  onClose: () => void;
}

const RainfallChartModal = ({ station, onClose }: RainfallChartModalProps) => {
  const [data, setData]       = useState<HourlyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [runTime, setRunTime] = useState<string | null>(null);

  useEffect(() => {
    if (!station.stationCode) { setData([]); setLoading(false); return; }
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const res  = await fetch(`/api/rain/forecast-timeseries?station_code=${station.stationCode}&limit=500`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ForecastResponse = await res.json();
        setRunTime(json.run?.run_time ?? null);
        setData(toHourlyPoints(json.data ?? []));
      } catch (e: any) {
        setError(e.message ?? "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [station.stationCode]);

  const ratioData        = sliceByRatio(data);
  const displayData      = ratioData.filter((_, i) => i % 2 === 0);
  const currentLabel     = displayData.find((d) => d.isCurrent)?.label ?? data.find((d) => d.isCurrent)?.label ?? "";
  const firstForecastLbl = displayData.find((d) => d.isForecast)?.label ?? "";
  const tickLabels       = displayData.filter((_, i) => i % 6 === 0).map((d) => d.label);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-2xl mx-4 rounded-2xl bg-white shadow-2xl border border-blue-100 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-800">กราฟฝน — {station.station}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{station.location}</p>
          </div>
          <button onClick={onClose} className="ml-4 mt-0.5 flex-shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Sub-header */}
        <div className="flex flex-wrap gap-3 px-5 py-3 bg-blue-50/60 text-xs text-gray-500 border-b border-blue-100">
          <span>อัปเดตล่าสุด: {station.time}</span>
          {runTime && (
            <span className="text-purple-500">
              รันโมเดล: {new Date(runTime).toLocaleString("th-TH", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <span className={`ml-auto inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${rainfallStatusColor(station.status)}`}>
            {station.status}
          </span>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 px-5 pt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-4 rounded-sm bg-blue-500" />ข้อมูลย้อนหลัง</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-4 rounded-sm bg-purple-400 opacity-75" />พยากรณ์ล่วงหน้า</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-5" style={{ borderTop: "2px dashed #f87171" }} />ปัจจุบัน</span>
        </div>
        {/* Chart */}
        <div className="px-4 pt-2 pb-5">
          <p className="text-[11px] font-medium text-gray-400 mb-2 uppercase tracking-wide">ปริมาณน้ำฝนรายชั่วโมง (มม.)</p>
          {loading ? (
            <div className="flex h-[220px] items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
                <svg className="h-6 w-6 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                กำลังโหลดข้อมูล...
              </div>
            </div>
          ) : error ? (
            <div className="flex h-[220px] items-center justify-center">
              <div className="flex flex-col items-center gap-1 text-sm text-red-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {error}
              </div>
            </div>
          ) : displayData.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">ไม่มีข้อมูลสถานีนี้</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={displayData} margin={{ top: 8, right: 10, left: -10, bottom: 5 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" ticks={tickLabels} tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} unit=" มม." />
                <Tooltip content={<RainfallTooltip />} />
                {currentLabel && (
                  <ReferenceLine x={currentLabel} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3"
                    label={{ value: "ปัจจุบัน", position: "top", fontSize: 10, fill: "#ef4444", fontWeight: 600 }} />
                )}
                {firstForecastLbl && firstForecastLbl !== currentLabel && (
                  <ReferenceLine x={firstForecastLbl} stroke="#a855f7" strokeWidth={1} strokeDasharray="3 3" />
                )}
                <Bar dataKey="actual"   name="ย้อนหลัง" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={40} />
                <Bar dataKey="forecast" name="พยากรณ์"  fill="#a855f7" radius={[3, 3, 0, 0]} maxBarSize={40} opacity={0.75} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex justify-end px-5 pb-4">
          <button onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-200 transition-colors font-medium">ปิด</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Chart Modal — Pond (ระดับน้ำบึง)
// ─────────────────────────────────────────────
interface PondChartModalProps {
  station: WaterData;
  onClose: () => void;
}

const PondChartModal = ({ station, onClose }: PondChartModalProps) => {
  const lakeId    = station.stationCode ?? "";
  const lav       = interpolateLAV(lakeId, station.level);
  const lavInfo   = LAV_DATA[lakeId];
  const data      = generateMockWaterLevel(station.level);
  const tickLabels = data.filter((_, i) => i % 4 === 0).map((d) => d.label);
  const currentLabel = data[data.length - 1]?.label ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-2xl mx-4 rounded-2xl bg-white shadow-2xl border border-emerald-100 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-800">กราฟระดับน้ำ — {station.station}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{station.location}</p>
          </div>
          <button onClick={onClose} className="ml-4 mt-0.5 flex-shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sub-header */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 bg-emerald-50/60 text-xs text-gray-500 border-b border-emerald-100">
          <span>📍 {station.location}</span>
          <span className="ml-auto font-semibold text-emerald-700">
            ระดับน้ำปัจจุบัน: {station.level.toFixed(2)} ม.รทก.
          </span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${pondStatusColor(station.status)}`}>
            {station.status}
          </span>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
          {[
            { label: "ระดับน้ำ",     value: `${station.level.toFixed(2)} ม.รทก.`, color: "text-blue-700" },
            { label: "ระดับขอบบึง",  value: `${station.bankLevel.toFixed(2)} ม.รทก.`, color: "text-gray-600" },
            { label: "ระยะห่างขอบ", value: `${station.diff.toFixed(2)} ม.`, color: pondFreeboardTextColor(station.stationCode, station.level) },
            { label: "% ความจุ",    value: lavInfo ? `${lav.pct.toFixed(1)} %` : "—", color: lav.pct >= 80 ? "text-red-600" : lav.pct >= 50 ? "text-orange-500" : "text-emerald-600" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center bg-white rounded-xl py-2 px-1 shadow-sm border border-gray-100">
              <span className={`text-sm font-extrabold leading-tight ${item.color} text-center`}>{item.value}</span>
              <span className="text-[9px] text-gray-400 font-medium mt-0.5 text-center">{item.label}</span>
            </div>
          ))}
        </div>

        {/* LAV info */}
        {lavInfo && (
          <div className="flex gap-3 px-5 py-2 bg-blue-50/40 border-b border-blue-100 text-xs text-gray-500">
            <span>ปริมาตรน้ำ: <strong className="text-blue-700">{fmtVol(lav.vol)}</strong></span>
            <span>พื้นที่ผิวน้ำ: <strong className="text-violet-700">{fmtArea(lav.area)}</strong></span>
            <span>ความจุสูงสุด: <strong className="text-gray-600">{fmtVol(lavInfo.maxVol)}</strong></span>
          </div>
        )}

        {/* Chart */}
        <div className="px-4 pt-4 pb-3">
          <p className="text-[11px] font-medium text-gray-400 mb-3 uppercase tracking-wide">
            ระดับน้ำในบึง (ม.รทก.) — 24 ชั่วโมงย้อนหลัง
            <span className="ml-2 normal-case text-emerald-400">อัปเดต: {station.time}</span>
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="pondGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" ticks={tickLabels} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} unit=" ม." />
              <Tooltip content={<WaterLevelTooltip />} />
              <ReferenceLine x={currentLabel} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3"
                label={{ value: "ปัจจุบัน", position: "top", fontSize: 9, fill: "#ef4444", fontWeight: 600 }} />
              <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} fill="url(#pondGradient)" dot={false}
                activeDot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-end px-5 pb-4 border-t border-gray-50 pt-3">
          <button onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-200 transition-colors font-medium">ปิด</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main WaterTable Component
// ─────────────────────────────────────────────
interface WaterTableProps {
  data: WaterData[];
  mode?: "rainfall" | "pond" | "default";
}

const WaterTable = ({ data, mode = "default" }: WaterTableProps) => {
  const [selectedStation, setSelectedStation] = useState<WaterData | null>(null);

  // คอลัมน์ header ตาม mode
  const levelHeader = mode === "rainfall"
    ? "ฝนล่าสุด (มม.) ↓"
    : mode === "pond"
      ? "ระดับน้ำ (ม.รทก.) ↓"
      : "ระดับน้ำ ↓";

  const secondaryHeader = mode === "pond" ? "freeboard (ม.)" : null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                ชื่อสถานี
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                ที่ตั้ง
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                เวลา
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                {levelHeader}
              </th>
              {secondaryHeader && (
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {secondaryHeader}
                </th>
              )}
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                สถานะ
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                กราฟ
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={mode === "pond" ? 7 : 6} className="py-12 text-center text-sm text-gray-400">
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-100 transition-colors hover:bg-blue-50/40">
                  <td className="px-4 py-3 font-medium text-gray-800">{row.station}</td>
                  <td className="px-4 py-3 text-gray-500">{row.location}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{row.time}</td>

                  {/* ค่าระดับน้ำ / ฝน */}
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center rounded-md px-2.5 py-1 text-sm font-bold min-w-[60px] bg-white border border-gray-200 text-gray-800">
                      {mode === "pond"
                        ? row.level > 0 ? row.level.toFixed(2) : "—"
                        : mode === "default"
                          ? row.status === "ไม่มีข้อมูล"
                            ? "—"
                            : row.level.toFixed(2)
                          : row.level}
                    </span>
                  </td>

                  {/* freeboard (เฉพาะ pond) */}
                  {mode === "pond" && (
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center rounded-md px-2.5 py-1 text-sm font-bold min-w-[52px] ${pondFreeboardCellColor(row.stationCode, row.level)}`}>
                        {row.diff > 0 ? row.diff.toFixed(2) : "—"}
                      </span>
                    </td>
                  )}

                  {/* สถานะ */}
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(row.status, mode)}`}>
                      {row.status}
                    </span>
                  </td>

                  {/* ปุ่มกราฟ */}
                  <td className="px-2 py-3 text-center">
                    <button
                      onClick={() => setSelectedStation(row)}
                      className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 p-1.5 text-blue-500 transition-all hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300 hover:scale-110 active:scale-95"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal — เลือกตาม mode */}
      {selectedStation && mode === "pond" && (
        <PondChartModal station={selectedStation} onClose={() => setSelectedStation(null)} />
      )}
      {selectedStation && mode !== "pond" && (
        <RainfallChartModal station={selectedStation} onClose={() => setSelectedStation(null)} />
      )}
    </div>
  );
};

export default WaterTable;