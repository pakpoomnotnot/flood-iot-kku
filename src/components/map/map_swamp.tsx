"use client";

import React, { useEffect, useRef, useState, FC, useMemo } from "react";
import { Layers, Map as MapIcon } from "lucide-react";
import maplibregl, { Map, Marker, Popup, ScaleControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import stationsData from "./stations_complete.json";
import { useStation, generateMockStationData } from "@/contexts/station-context";

// ─────────────────────────────────────────────
// SVG Icons
// ─────────────────────────────────────────────
const ICONS = {
  droplets:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
  shieldAlert: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
  waves:       `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`,
  cloudRain:   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  mapPin:      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  tag:         `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.432 0l6.568-6.568a2.426 2.426 0 0 0 0-3.432l-8.704-8.704z"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>`,
};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface BasemapConfig { name: string; style: string; icon: string; }
type BasemapStyleKey = "hybrid" | "topo";

interface Station {
  id: string; no: number; name: string;
  location: { latitude: number; longitude: number; area: string };
  sensors: Array<{ type: string; name: string; range: string; unit: string; frequency: string }>;
}
interface StationsData {
  project: string; projectName: string;
  stationTypes: Array<{ type: string; name: string; stations: Station[] }>;
}

// ── CHANGE 1: เพิ่ม field water_volume_m3, water_area_m2, capacity_pct จาก API ──
interface LakeApiItem {
  lake_id: string;
  name_th: string;
  name_en: string;
  location: { lat: number; lng: number };
  status: "ok" | "error" | "no_data";
  water_level?: number;
  water_flow?: number;
  water_total?: number;
  rain_value?: number;
  rain_daily?: number;
  air_temp?: number;
  air_humid?: number;
  wind_direction_name?: string;
  date_time?: string;
  water_volume_m3?: number;   // ปริมาตรน้ำ ลบ.ม. จาก API โดยตรง
  water_area_m2?: number;     // พื้นที่ผิวน้ำ ตร.ม. จาก API โดยตรง
  capacity_pct?: number;      // % ความจุ จาก API โดยตรง
  error?: string;
}
interface LakesApiResponse {
  fetched_at: string;
  count: number;
  lakes: LakeApiItem[];
}

// ─────────────────────────────────────────────
// LAV (Level–Area–Volume) lookup tables
// ─────────────────────────────────────────────
interface LavInfo {
  name_th: string;
  name_en: string;
  maxVol: number;
  maxArea: number;
  maxLevel: number;
  table: [number, number, number][];
}

const LAV_DATA: Record<string, LavInfo> = {
  Lake_04: {
    name_th: "บึงหนองโคตร", name_en: "Bueng Nong Khot",
    maxLevel: 155.0, maxVol: 7042958.829, maxArea: 1091408.30,
    table: [
      [155.0, 1091408.30, 7042958.829],
      [154.5, 1082261.86, 6499502.459],
      [154.0, 1070785.25, 5961217.788],
      [153.5, 1051155.60, 5431230.875],
      [153.0, 1033267.54, 4909906.539],
      [152.5, 1015241.26, 4397662.928],
      [152.0,  998249.51, 3894825.483],
      [151.5,  979688.97, 3400359.133],
      [151.0,  958023.69, 2916040.387],
      [150.5,  928415.59, 2444380.698],
      [150.0,  884737.59, 1991166.335],
      [149.5,  821914.62, 1561960.896],
      [149.0,  735077.25, 1170074.717],
      [148.5,  625223.68,  829540.808],
      [148.0,  452735.38,  566579.393],
      [147.5,  320752.68,  374294.954],
      [147.0,  235260.02,  238270.355],
      [146.5,  162074.05,  142121.555],
      [146.0,  106837.00,   77902.363],
      [145.5,   55900.69,   43025.011],
      [145.0,   35902.28,   20976.852],
      [144.5,   18540.02,    8457.009],
      [144.0,    8858.72,    2317.830],
      [143.5,    2641.99,     245.266],
      [143.0,      61.41,       0.000],
    ],
  },
  Lake_01: {
    name_th: "บึงแก่นนคร", name_en: "Bueng Kaen Nakhon",
    maxLevel: 152.0, maxVol: 1800273.44, maxArea: 604444.60,
    table: [
      [152.0, 604444.60, 1800273.44],
      [151.5, 596553.82, 1499434.18],
      [151.0, 590101.47, 1202730.07],
      [150.5, 573454.11,  912835.53],
      [150.0, 537618.64,  633312.88],
      [149.5, 437042.52,  386984.34],
      [149.0, 307379.96,  201313.08],
      [148.5, 175730.32,   80190.36],
      [148.0,  89470.15,   13967.17],
      [147.5,   5601.33,     944.03],
      [147.0,    713.17,      95.39],
    ],
  },
  Lake_02: {
    name_th: "บึงทุ่งสร้าง (ตะวันตก)", name_en: "Bueng Thung Sang (W)",
    maxLevel: 150.0, maxVol: 2240580.209, maxArea: 742715.252,
    table: [
      [150.0, 742715.252, 2240580.209],
      [149.5, 728119.710, 1872613.424],
      [149.0, 709894.577, 1512923.241],
      [148.5, 672133.779, 1168838.097],
      [148.0, 653026.598,  837623.486],
      [147.5, 633984.684,  515923.480],
      [147.0, 595332.889,  210643.401],
      [146.5, 176572.427,   17941.403],
      [146.0,  15865.753,    1259.342],
    ],
  },
  Lake_03: {
    name_th: "หนองเลิงเปือย (ตะวันออก)", name_en: "Nong Loeng Phuai (E)",
    maxLevel: 151.5, maxVol: 1374617.490, maxArea: 300597.883,
    table: [
      [151.5, 300597.883, 1374617.490],
      [151.0, 294528.131, 1225826.964],
      [150.5, 288410.097, 1080085.479],
      [150.0, 276435.774,  938885.265],
      [149.5, 256420.342,  805568.543],
      [149.0, 235258.272,  683157.218],
      [148.5, 224103.445,  568467.528],
      [148.0, 211944.453,  459508.669],
      [147.5, 199358.150,  356694.676],
      [147.0, 181922.376,  260595.203],
      [146.5, 152651.150,  176641.370],
      [146.0, 105758.932,  113336.951],
      [145.5,  70154.586,   71275.541],
      [145.0,  52412.629,   41682.544],
      [144.5,  37669.750,   19191.062],
      [144.0,  20047.157,    5728.448],
      [143.5,   8037.282,       0.000],
    ],
  },
};

// ─────────────────────────────────────────────
// LAV interpolation helper
// ─────────────────────────────────────────────
function interpolateLAV(lakeId: string, level: number): { area: number; vol: number; pct: number } {
  const info = LAV_DATA[lakeId];
  if (!info) return { area: 0, vol: 0, pct: 0 };

  const table = info.table;
  let area = 0;
  let vol = 0;

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
        area = a2 + t * (a1 - a2);
        vol  = v2 + t * (v1 - v2);
        break;
      }
    }
  }

  const pct = Math.min(100, Math.max(0, (vol / info.maxVol) * 100));
  return { area, vol, pct };
}

// ── CHANGE 2: fmtVol แสดงตัวเลขจริงเป็น ลบ.ม. พร้อม comma separator ──
function fmtVol(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(3)} ล้าน ลบ.ม.`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(1)} พัน ลบ.ม.`;
  return `${v.toFixed(2)} ลบ.ม.`;
}

// ── ฟังก์ชันแสดงปริมาตรเต็มๆ พร้อม comma สำหรับ popup และ modal ──
function fmtVolFull(v: number): string {
  // แสดงเป็น ลบ.ม. พร้อม comma separator ทศนิยม 2 ตำแหน่ง
  return `${v.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ลบ.ม.`;
}

function fmtArea(a: number): string {
  if (a >= 1_000_000) return `${(a / 1_000_000).toFixed(4)} ตร.กม.`;
  return `${a.toLocaleString("th-TH", { maximumFractionDigits: 0 })} ตร.ม.`;
}

// ─────────────────────────────────────────────
// Station type config
// ─────────────────────────────────────────────
const stationTypeConfig = {
  WP: { color: "#3B82F6", label: "ท่อระบายน้ำ",   icon: ICONS.droplets    },
  WR: { color: "#EF4444", label: "ระดับน้ำบนถนน", icon: ICONS.shieldAlert },
  PW: { color: "#10B981", label: "บึง/หนองน้ำ",    icon: ICONS.waves       },
  RF: { color: "#8B5CF6", label: "ปริมาณฝน",       icon: ICONS.cloudRain   },
};

// ─────────────────────────────────────────────
// Legend segments
// ─────────────────────────────────────────────
const LEGEND_SEGMENTS = [
  { range: "0-1",   color: "#81d4fa" },
  { range: ">1-2",  color: "#d0f8ce" },
  { range: ">2-3",  color: "#7cb342" },
  { range: ">3-4",  color: "#fdd835" },
  { range: ">4-5",  color: "#f57f17" },
  { range: ">5-6",  color: "#8d6e63" },
  { range: ">6",    color: "#bf360c" },
];
const LEVEL_LABELS = [
  { label: "ต่ำ",      span: 2 },
  { label: "ปานกลาง",  span: 2 },
  { label: "สูง",      span: 2 },
  { label: "สูงมาก",   span: 1 },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatDateTime(dt: string): string {
  if (!dt) return "—";
  try {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return dt;
    return d.toLocaleString("th-TH", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return dt; }
}

interface HourlyPoint { label: string; value: number; }

function generateMockWaterLevel(currentLevel: number): HourlyPoint[] {
  const now = new Date();
  let prev = Math.max(0.2, currentLevel - Math.random() * 1.5);
  return Array.from({ length: 24 }, (_, i) => {
    const t = new Date(now.getTime() - (23 - i) * 3_600_000);
    const label = `${t.getDate()}-${t.toLocaleString("en", { month: "short" })} ${t
      .getHours().toString().padStart(2, "0")}:00`;
    const delta = (Math.random() - 0.45) * 0.3;
    prev = Math.max(0.1, Math.min(6.5, prev + delta));
    if (i === 23) prev = currentLevel;
    return { label, value: parseFloat(prev.toFixed(2)) };
  });
}

// ─────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-600 mb-1">{label}</p>
      <p className="font-bold text-blue-700">{payload[0].value} ม.</p>
    </div>
  );
};

// ─────────────────────────────────────────────
// Chart Modal
// ─────────────────────────────────────────────
interface ChartModalProps {
  station: Station;
  currentLevel: number;
  lakeData: LakeApiItem | null;
  onClose: () => void;
}

const ChartModal: FC<ChartModalProps> = ({ station, currentLevel, lakeData, onClose }) => {
  const data         = useMemo(() => generateMockWaterLevel(currentLevel), [station.id, currentLevel]);
  const currentLabel = data[data.length - 1]?.label ?? "";
  const tickLabels   = data.filter((_, i) => i % 4 === 0).map((d) => d.label);

  // ── CHANGE 4: ใช้ข้อมูลจาก API โดยตรง (water_volume_m3, water_area_m2, capacity_pct) ──
  const lakeId  = lakeData?.lake_id ?? "";
  const lavInfo = LAV_DATA[lakeId];

  // ใช้ค่าจาก API ก่อน ถ้าไม่มีค่อย fallback LAV interpolation
  const apiVol  = lakeData?.water_volume_m3;
  const apiArea = lakeData?.water_area_m2;
  const apiPct  = lakeData?.capacity_pct;

  const lav = interpolateLAV(lakeId, currentLevel); // ใช้สำหรับ fallback เท่านั้น

  const displayVol  = apiVol  != null ? apiVol  : lav.vol;
  const displayArea = apiArea != null ? apiArea : lav.area;
  const displayPct  = apiPct  != null ? apiPct  : lav.pct;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4 rounded-2xl bg-white shadow-2xl border border-blue-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-800">กราฟระดับน้ำ — {station.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{station.location.area}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-0.5 flex-shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sub-header */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 bg-blue-50/60 text-xs text-gray-500 border-b border-blue-100">
          <span>📍 {station.location.area}</span>
          {lakeData?.air_temp != null && <span>🌡️ {lakeData.air_temp.toFixed(1)} °C</span>}
          {lakeData?.air_humid != null && <span>💧 ความชื้น {lakeData.air_humid.toFixed(0)}%</span>}
          {lakeData?.rain_daily != null && <span>🌧️ ฝนวันนี้ {lakeData.rain_daily.toFixed(1)} มม.</span>}
          {lakeData?.wind_direction_name && <span>💨 ลม {lakeData.wind_direction_name}</span>}
          <span className="ml-auto font-semibold text-blue-700">
            ระดับน้ำปัจจุบัน: {currentLevel.toFixed(2)} ม.รทก.
          </span>
        </div>

        {/* ── CHANGE 4: Info cards — แสดงปริมาตรน้ำจาก API เป็น ลบ.ม. ── */}
        {lakeData && lakeData.status === "ok" && (
          <div className="grid grid-cols-4 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
            {[
              {
                label: "ปริมาตรน้ำ (ลบ.ม.)",
                value: fmtVolFull(displayVol),
                color: "text-blue-700",
              },
              {
                label: "% ความจุ",
                value: `${displayPct.toFixed(2)} %`,
                color: displayPct >= 80 ? "text-red-600" : displayPct >= 50 ? "text-orange-500" : "text-emerald-600",
              },
              {
                label: "พื้นที่ผิวน้ำ",
                value: fmtArea(displayArea),
                color: "text-violet-700",
              },
              {
                label: "ความจุสูงสุด",
                value: lavInfo ? fmtVol(lavInfo.maxVol) : "—",
                color: "text-gray-600",
              },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center bg-white rounded-xl py-2 px-1 shadow-sm border border-gray-100">
                <span className={`text-sm font-extrabold leading-tight ${item.color} text-center`}>{item.value}</span>
                <span className="text-[9px] text-gray-400 font-medium mt-0.5 text-center">{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        <div className="px-4 pt-4 pb-3">
          <p className="text-[11px] font-medium text-gray-400 mb-3 uppercase tracking-wide">
            ระดับน้ำในบึง (ม.รทก.) — 24 ชั่วโมงย้อนหลัง
            {lakeData?.date_time && (
              <span className="ml-2 normal-case text-blue-400">
                อัปเดต: {formatDateTime(lakeData.date_time)}
              </span>
            )}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="swampGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" ticks={tickLabels} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 7]} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} unit=" ม." />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={1.5} stroke="#CA8A04" strokeWidth={1} strokeDasharray="5 4"
                label={{ value: "เฝ้าระวัง", position: "right", fontSize: 9, fill: "#CA8A04", fontWeight: 600 }} />
              <ReferenceLine y={3.0} stroke="#EA580C" strokeWidth={1} strokeDasharray="5 4"
                label={{ value: "เตือนภัย", position: "right", fontSize: 9, fill: "#EA580C", fontWeight: 600 }} />
              <ReferenceLine y={4.5} stroke="#DC2626" strokeWidth={1} strokeDasharray="5 4"
                label={{ value: "วิกฤต", position: "right", fontSize: 9, fill: "#DC2626", fontWeight: 600 }} />
              <ReferenceLine
                x={currentLabel}
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                label={{ value: "ปัจจุบัน", position: "top", fontSize: 9, fill: "#ef4444", fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10B981"
                strokeWidth={2.5}
                fill="url(#swampGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 pb-4 border-t border-gray-50 pt-3">
          <button onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-200 transition-colors font-medium">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main MapComponentSwamp
// ─────────────────────────────────────────────
const MapComponentSwamp: FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map          = useRef<Map | null>(null);
  const markersRef   = useRef<Marker[]>([]);

  const [currentStyle, setCurrentStyle]   = useState<BasemapStyleKey>("topo");
  const [isLoaded, setIsLoaded]           = useState(false);
  const [isSwitcherOpen, setSwitcherOpen] = useState(false);
  const [chartStation, setChartStation]   = useState<Station | null>(null);
  const [chartLevel, setChartLevel]       = useState(0);

  const [lakesData, setLakesData]     = useState<LakeApiItem[]>([]);
  const [apiLoading, setApiLoading]   = useState(true);
  const [apiError, setApiError]       = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string>("");

  const lakesDataRef = useRef<LakeApiItem[]>([]);

  const { setSelectedStationData } = useStation();
  const API_KEY = "yYduxrRP3C81U2fRFNIU";

  // mapping: station ID จาก stations_complete.json → lake_id จาก API
  // PW01=บึงแก่นนคร, PW02=บึงทุ่งสร้าง, PW03=หนองเลิงเปือย, PW05=บึงหนองโคตร
  // PW04 (คุ้มสีฐาน มข.) ไม่มีใน Lake API จึงไม่ map
  const STATION_TO_LAKE: Record<string, string> = {
    "PW01": "Lake_01",  // บึงแก่นนคร
    "PW02": "Lake_02",  // บึงทุ่งสร้าง
    "PW03": "Lake_03",  // หนองเลิงเปือย
    "PW05": "Lake_04",  // บึงหนองโคตร
  };

  const basemaps: Record<BasemapStyleKey, BasemapConfig> = {
    hybrid: { name: "Hybrid",      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${API_KEY}`,  icon: "🌍" },
    topo:   { name: "Topographic", style: `https://api.maptiler.com/maps/topo-v2/style.json?key=${API_KEY}`, icon: "🏔️" },
  };

  const fetchLakesData = async () => {
    try {
      setApiLoading(true);
      setApiError(null);
      const res  = await fetch("http://localhost:3000/api/lake");
      if (!res.ok) throw new Error(`API ตอบกลับ ${res.status}`);
      const json: LakesApiResponse = await res.json();
      lakesDataRef.current = json.lakes;
      setLakesData(json.lakes);
      setLastFetched(json.fetched_at);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setApiError(msg);
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchLakesData();
    const interval = setInterval(fetchLakesData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getLakeData = (stationId: string): LakeApiItem | null => {
    const lakeId = STATION_TO_LAKE[stationId];
    if (!lakeId) return null;
    return lakesDataRef.current.find((l) => l.lake_id === lakeId) ?? null;
  };

  const createMarkerElement = (stationId: string): HTMLDivElement => {
    const el = document.createElement("div");
    el.className = "custom-marker-wrapper";
    const prefix = stationId.substring(0, 2) as keyof typeof stationTypeConfig;
    const config = stationTypeConfig[prefix] || { color: "#6B7280", icon: ICONS.mapPin };

    const ld = getLakeData(stationId);
    const lakeId = STATION_TO_LAKE[stationId] ?? "";
    const waterLevel = ld?.water_level ?? 0;

    // ใช้ capacity_pct จาก API โดยตรง ถ้าไม่มีค่อย fallback LAV
    const apiPct = ld?.capacity_pct;
    const { pct: lavPct } = interpolateLAV(lakeId, waterLevel);
    const waterHeight = lakeId
      ? (apiPct != null ? apiPct : lavPct)
      : Math.min((waterLevel / 6) * 100, 100);

    el.innerHTML = `
      <div class="custom-marker-animated" style="--marker-color: ${config.color}; --water-height: ${waterHeight}%;">
        <div class="marker-water-container">
          <div class="marker-water-wave"></div>
          <div class="marker-water-fill"></div>
        </div>
        <div class="marker-icon">${config.icon}</div>
        <div class="marker-ring"></div>
      </div>
    `;
    return el;
  };

  // ── CHANGE 3: createPopupContent — lavRow ใช้ water_volume_m3 จาก API แสดงเป็น ลบ.ม. ──
  const createPopupContent = (station: Station): string => {
    const prefix   = station.id.substring(0, 2) as keyof typeof stationTypeConfig;
    const typeInfo = stationTypeConfig[prefix] || { label: "อื่นๆ", color: "#6B7280", icon: ICONS.tag };

    const ld = getLakeData(station.id);
    const lakeId = STATION_TO_LAKE[station.id] ?? "";

    let displayValue = 0;
    let mockUnit  = "";
    let mockLabel = "";

    switch (prefix) {
      case "RF":
        displayValue = ld?.rain_daily ?? Math.random() * 50;
        mockUnit  = "มม."; mockLabel = "ปริมาณฝนสะสม (วันนี้)";
        break;
      case "WP":
        displayValue = ld?.water_level ?? Math.random() * 2 + 0.5;
        mockUnit  = "ม."; mockLabel = "ระดับน้ำในท่อ";
        break;
      case "WR":
        displayValue = ld?.water_level ?? Math.random() * 0.8;
        mockUnit  = "ม."; mockLabel = "ระดับน้ำท่วมถนน";
        break;
      case "PW":
        displayValue = ld?.water_level ?? 0;
        mockUnit  = "ม.รทก."; mockLabel = "ระดับน้ำในบึง";
        break;
      default:
        displayValue = 0; mockUnit = ""; mockLabel = "ข้อมูล";
    }

    // ── ดึงค่าจาก API โดยตรง (water_volume_m3, water_area_m2, capacity_pct) ──
    const apiVol  = ld?.water_volume_m3;
    const apiArea = ld?.water_area_m2;
    const apiPct  = ld?.capacity_pct;

    // fallback LAV interpolation ถ้า API ไม่ส่งค่ามา
    const lav     = prefix === "PW" ? interpolateLAV(lakeId, displayValue) : null;
    const lavInfo = prefix === "PW" ? LAV_DATA[lakeId] : null;

    const finalVol  = apiVol  != null ? apiVol  : (lav?.vol  ?? 0);
    const finalArea = apiArea != null ? apiArea : (lav?.area ?? 0);
    const finalPct  = apiPct  != null ? apiPct  : (lav?.pct  ?? 0);

    // water tank height ใช้ % ความจุจาก API
    const waterHeight = prefix === "PW"
      ? finalPct
      : Math.min((displayValue / 6) * 100, 100);

    const timestampDisplay = ld?.date_time ? formatDateTime(ld.date_time) : "—";

    const statusBadge = ld
      ? ld.status === "ok"
        ? `<span class="api-badge ok">● Live</span>`
        : `<span class="api-badge err">● ไม่มีสัญญาณ</span>`
      : `<span class="api-badge warn">● Mock</span>`;

    // ── LAV row แสดงปริมาตรน้ำเป็น ลบ.ม. จาก API ──
    const lavRow = (prefix === "PW" && (apiVol != null || lav)) ? `
      <div class="lav-info-row">
        <div class="lav-chip vol">
          <span class="lav-chip-label">ปริมาตรน้ำ</span>
          <span class="lav-chip-val">${fmtVolFull(finalVol)}</span>
        </div>
        <div class="lav-chip pct" style="--pct-color: ${finalPct >= 80 ? "#dc2626" : finalPct >= 50 ? "#ea580c" : finalPct >= 20 ? "#16a34a" : "#2563eb"};">
          <span class="lav-chip-label">ความจุ</span>
          <span class="lav-chip-val pct-val">${finalPct.toFixed(2)}%</span>
        </div>
        <div class="lav-chip area">
          <span class="lav-chip-label">พื้นที่ผิว</span>
          <span class="lav-chip-val">${fmtArea(finalArea)}</span>
        </div>
      </div>
    ` : "";

    const extraRow = (prefix === "PW" && ld && ld.status === "ok") ? `
      <div class="popup-extra-row">
        ${ld.rain_daily != null ? `<div class="extra-chip">🌧 ฝน ${ld.rain_daily.toFixed(1)} มม.</div>` : ""}
        ${ld.air_temp   != null ? `<div class="extra-chip">🌡 ${ld.air_temp.toFixed(1)} °C</div>` : ""}
        ${ld.air_humid  != null ? `<div class="extra-chip">💧 ${ld.air_humid.toFixed(0)}%</div>` : ""}
        ${ld.wind_direction_name ? `<div class="extra-chip">💨 ${ld.wind_direction_name}</div>` : ""}
      </div>
    ` : "";

    return `
      <div class="modern-popup">
        <div class="popup-close-btn" onclick="this.closest('.maplibregl-popup').remove()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <div class="popup-location-header" style="background: linear-gradient(135deg, ${typeInfo.color}15 0%, ${typeInfo.color}05 100%);">
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px;">
            <div class="station-type-badge" style="background: ${typeInfo.color};">
              ${typeInfo.icon}<span>${typeInfo.label}</span>
            </div>
            ${statusBadge}
          </div>
          <h3 class="location-name">${station.name}</h3>
          <div class="location-area">${station.location.area}</div>
        </div>
        <div class="popup-content-body">
          <div class="data-label">${mockLabel}</div>
          ${prefix === "PW" ? `
          <div class="water-level-container">
            <div class="water-tank" style="--popup-water-height: ${waterHeight}%;">
              <div class="water-fill-popup">
                <div class="water-wave-popup"></div>
                <div class="water-shimmer-popup"></div>
              </div>
              <div class="water-level-text">
                <span class="level-number">${displayValue.toFixed(2)}</span>
                <span class="level-unit">${mockUnit}</span>
              </div>
              <div class="water-scale">
                ${lavInfo
                  ? [100, 75, 50, 25, 0].map(p => {
                      return `<div class="scale-line" style="bottom:${p}%"><span>${p}%</span></div>`;
                    }).join("")
                  : [6,5,4,3,2,1,0].map(n => `<div class="scale-line" style="bottom:${(n/6)*100}%"><span>${n}</span></div>`).join("")
                }
              </div>
            </div>
          </div>
          ` : `
          <div class="data-value-box">
            <span class="data-number">${displayValue.toFixed(2)}</span>
            <span class="data-unit">${mockUnit}</span>
          </div>
          `}
          ${lavRow}
          ${extraRow}
          <div class="popup-footer-row">
            <div class="data-timestamp">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${timestampDisplay}</span>
            </div>
            ${prefix === "PW" ? `
            <button class="swamp-chart-btn" data-station-id="${station.id}" data-level="${displayValue.toFixed(2)}" title="ดูกราฟระดับน้ำ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </button>
            ` : ""}
          </div>
        </div>
      </div>
    `;
  };

  const addStationMarkers = () => {
    if (!map.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const data = stationsData as StationsData;
    data.stationTypes.forEach((stationType) => {
      stationType.stations.forEach((station) => {
        if (station.id.substring(0, 2) !== "PW") return;
        const el    = createMarkerElement(station.id);
        const popup = new Popup({ offset: 35, closeButton: false });
        const marker = new Marker({ element: el })
          .setLngLat([station.location.longitude, station.location.latitude])
          .setPopup(popup);
        if (map.current) { marker.addTo(map.current); markersRef.current.push(marker); }

        el.addEventListener("click", () => {
          setSelectedStationData(generateMockStationData(station));
        });

        popup.on("open", () => {
          popup.setHTML(createPopupContent(station));
          setTimeout(() => {
            const btn = document.querySelector<HTMLButtonElement>(
              `.swamp-chart-btn[data-station-id="${station.id}"]`
            );
            if (btn) {
              btn.addEventListener("click", (e) => {
                e.stopPropagation();
                setChartLevel(parseFloat(btn.dataset.level ?? "0"));
                setChartStation(station);
              });
            }
          }, 50);
        });
      });
    });
  };

  useEffect(() => {
    if (isLoaded) addStationMarkers();
  }, [lakesData, isLoaded]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    map.current = new Map({
      container: mapContainer.current,
      style: basemaps[currentStyle].style,
      center: [102.82, 16.44],
      zoom: 12,
      attributionControl: false,
    });
    map.current.addControl(new ScaleControl(), "bottom-left");
    map.current.on("load", () => { setIsLoaded(true); });
    map.current.on("mousedown", () => { if (isSwitcherOpen) setSwitcherOpen(false); });
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const switchBasemap = (styleKey: BasemapStyleKey) => {
    if (!map.current || !isLoaded) return;
    setCurrentStyle(styleKey);
    map.current.setStyle(basemaps[styleKey].style);
    map.current.once("style.load", () => addStationMarkers());
    setSwitcherOpen(false);
  };

  return (
    <div className="relative w-full h-full bg-gray-900 font-sans rounded-xl overflow-hidden flex flex-col">

      <div className="relative flex-1 min-h-0">
        <div ref={mapContainer} className="w-full h-full" />

        {!isLoaded && (
          <div className="absolute inset-0 bg-slate-800/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto" />
              <p className="text-white text-lg mt-4 font-semibold">กำลังโหลดแผนที่...</p>
            </div>
          </div>
        )}

        {isLoaded && (
          <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
            {apiLoading && (
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow text-xs text-gray-600">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                กำลังดึงข้อมูลบึง...
              </div>
            )}
            {!apiLoading && apiError && (
              <div className="flex items-center gap-1.5 bg-red-50/95 border border-red-200 backdrop-blur-sm rounded-full px-3 py-1.5 shadow text-xs text-red-700">
                ⚠️ {apiError}
                <button onClick={fetchLakesData} className="ml-1 underline hover:no-underline">ลองใหม่</button>
              </div>
            )}
            {!apiLoading && !apiError && lastFetched && (
              <div className="flex items-center gap-1.5 bg-emerald-50/95 border border-emerald-200 backdrop-blur-sm rounded-full px-3 py-1.5 shadow text-xs text-emerald-700">
                ✅ Live — อัปเดต {formatDateTime(lastFetched)}
              </div>
            )}
          </div>
        )}

        <div className="absolute top-4 right-4 z-40">
          <div className="relative">
            <button
              onClick={() => setSwitcherOpen(!isSwitcherOpen)}
              disabled={!isLoaded}
              className={`flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isLoaded ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Layers className="h-6 w-6 text-gray-700" />
            </button>
            {isSwitcherOpen && isLoaded && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 p-3">
                <div className="flex items-center space-x-2 mb-3 px-1">
                  <MapIcon className="h-5 w-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-800">เลือกรูปแบบแผนที่</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(basemaps) as [BasemapStyleKey, BasemapConfig][]).map(([key, bm]) => (
                    <button key={key} onClick={() => switchBasemap(key)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg text-xs font-medium h-20 transition-all ${
                        currentStyle === key ? "bg-blue-500 text-white ring-2 ring-blue-300 shadow-md" : "bg-gray-50/50 hover:bg-blue-100/80 text-gray-700"
                      }`}
                    >
                      <span className="text-2xl mb-1">{bm.icon}</span>
                      <span>{bm.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 bg-white border-t border-gray-300 px-3 pt-1.5 pb-2">
        <div className="flex w-full rounded-sm overflow-hidden border border-gray-300">
          {LEGEND_SEGMENTS.map((seg, i) => (
            <div key={i} className="flex-1 flex items-center justify-center py-2" style={{ backgroundColor: seg.color }}>
              <span className="text-[9px] font-bold text-gray-800 whitespace-nowrap">{seg.range}</span>
            </div>
          ))}
        </div>
        <div className="flex w-full mt-0.5">
          {LEVEL_LABELS.map((l, i) => (
            <div
              key={i}
              className={`text-center text-[10px] font-semibold text-gray-700 ${i < LEVEL_LABELS.length - 1 ? "border-r border-gray-300" : ""}`}
              style={{ flex: l.span }}
            >
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Chart Modal */}
      {chartStation && (
        <ChartModal
          station={chartStation}
          currentLevel={chartLevel}
          lakeData={getLakeData(chartStation.id)}
          onClose={() => setChartStation(null)}
        />
      )}

      {/* Global styles */}
      <style jsx global>{`
        .modern-popup {
          font-family: system-ui, -apple-system, sans-serif;
          width: 290px; background: white; border-radius: 12px;
          overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.12); position: relative;
        }
        .popup-close-btn {
          position: absolute; top: 10px; right: 10px; width: 24px; height: 24px;
          border-radius: 50%; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 10; transition: all 0.2s;
        }
        .popup-close-btn:hover { background: rgba(0,0,0,0.7); transform: scale(1.05); }
        .popup-close-btn svg { color: #fff; }
        .popup-location-header { padding: 16px 14px 12px; border-bottom: 1px solid #E5E7EB; }
        .station-type-badge {
          display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px;
          border-radius: 6px; color: white; font-size: 10px; font-weight: 600;
        }
        .station-type-badge svg { width: 12px; height: 12px; }
        .api-badge {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px;
        }
        .api-badge.ok   { background: #f0fdf4; color: #16a34a; border: 1px solid #86efac; }
        .api-badge.err  { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; }
        .api-badge.warn { background: #fffbeb; color: #d97706; border: 1px solid #fcd34d; }
        .location-name { font-size: 15px; font-weight: 700; color: #111827; margin: 0 0 4px; line-height: 1.3; }
        .location-area { font-size: 11px; color: #6B7280; font-weight: 500; }
        .popup-content-body { padding: 14px; background: #F9FAFB; }
        .data-label { font-size: 10px; color: #6B7280; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
        .data-value-box {
          background: white; border: 2px solid #E5E7EB; border-radius: 10px;
          padding: 12px; display: flex; align-items: baseline; gap: 6px; margin-bottom: 10px;
        }
        .data-number { font-size: 32px; font-weight: 800; color: #1F2937; line-height: 1; }
        .data-unit { font-size: 14px; font-weight: 600; color: #6B7280; }

        /* ── LAV info row ── */
        .lav-info-row {
          display: flex; gap: 5px; margin: 8px 0 6px;
        }
        .lav-chip {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          background: white; border-radius: 8px; padding: 5px 4px;
          border: 1px solid #E5E7EB;
        }
        .lav-chip-label { font-size: 9px; color: #9CA3AF; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
        .lav-chip-val   { font-size: 10px; font-weight: 700; color: #1F2937; text-align: center; line-height: 1.3; word-break: break-all; }
        .lav-chip.pct .pct-val { color: var(--pct-color, #16a34a); }

        .popup-extra-row { display: flex; flex-wrap: wrap; gap: 4px; margin: 6px 0; }
        .extra-chip {
          font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px;
          background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE;
        }
        .popup-footer-row { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
        .data-timestamp { display: flex; align-items: center; gap: 5px; font-size: 10px; color: #9CA3AF; }
        .data-timestamp svg { color: #9CA3AF; }
        .swamp-chart-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 50%;
          background: #F0FDF4; border: 1.5px solid #86EFAC;
          color: #16A34A; cursor: pointer; transition: background 0.15s, transform 0.15s;
        }
        .swamp-chart-btn:hover { background: #DCFCE7; transform: scale(1.1); }
        .swamp-chart-btn:active { transform: scale(0.95); }

        /* water tank */
        .water-level-container { margin-bottom: 0; }
        .water-tank {
          position: relative; width: 100%; height: 160px;
          background: linear-gradient(180deg, #E0F2FE 0%, #F0F9FF 100%);
          border: 3px solid #0EA5E9; border-radius: 12px; overflow: hidden;
          box-shadow: inset 0 2px 8px rgba(14,165,233,0.1);
        }
        .water-fill-popup {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: var(--popup-water-height);
          background: linear-gradient(180deg, rgba(6,182,212,0.6) 0%, rgba(14,165,233,0.75) 50%, rgba(8,145,178,0.9) 100%);
          transition: height 0.8s cubic-bezier(0.4,0,0.2,1);
        }
        .water-wave-popup { position: absolute; top: -15px; left: -50%; width: 200%; height: 30px; background: radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 50%, transparent 70%); border-radius: 45%; animation: popupWaterWave 5s ease-in-out infinite; }
        .water-shimmer-popup { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%); background-size: 200% 200%; animation: popupShimmer 4s ease-in-out infinite; }
        @keyframes popupWaterWave { 0%,100% { transform: translateX(0) translateY(0) rotate(0deg); } 25% { transform: translateX(-15%) translateY(-3px) rotate(-2deg); } 50% { transform: translateX(0) translateY(-5px) rotate(0deg); } 75% { transform: translateX(-15%) translateY(-3px) rotate(2deg); } }
        @keyframes popupShimmer { 0%,100% { background-position: 0% 50%; opacity: 0.5; } 50% { background-position: 100% 50%; opacity: 0.8; } }
        .water-level-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 10; display: flex; align-items: baseline; gap: 6px; background: rgba(255,255,255,0.95); padding: 8px 12px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 2px solid #0EA5E9; }
        .level-number { font-size: 26px; font-weight: 900; color: #0369A1; line-height: 1; }
        .level-unit { font-size: 11px; font-weight: 700; color: #0284C7; }
        .water-scale { position: absolute; right: 8px; top: 0; bottom: 0; width: 36px; z-index: 5; }
        .scale-line { position: absolute; right: 0; width: 100%; height: 1px; background: rgba(14,165,233,0.3); display: flex; align-items: center; justify-content: flex-end; }
        .scale-line::before { content: ''; position: absolute; right: 0; width: 8px; height: 1px; background: #0EA5E9; }
        .scale-line span { position: absolute; right: 12px; font-size: 9px; font-weight: 700; color: #0369A1; background: rgba(255,255,255,0.9); padding: 1px 3px; border-radius: 3px; transform: translateY(-50%); white-space: nowrap; }

        /* markers */
        .custom-marker-wrapper { cursor: pointer; }
        .custom-marker-animated { width: 40px; height: 40px; border-radius: 50%; position: relative; display: flex; justify-content: center; align-items: center; border: 3px solid white; background: var(--marker-color); box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1); transition: all 0.3s cubic-bezier(0.4,0,0.2,1); overflow: hidden; }
        .marker-water-container { position: absolute; bottom: 0; left: 0; right: 0; height: var(--water-height); overflow: hidden; border-radius: 0 0 50% 50%; }
        .marker-water-fill { position: absolute; bottom: 0; left: 0; right: 0; height: 100%; background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.7) 100%); animation: waterShimmer 3s ease-in-out infinite; }
        .marker-water-wave { position: absolute; top: -10px; left: -50%; width: 200%; height: 20px; background: rgba(255,255,255,0.4); border-radius: 45%; animation: waterWave 4s ease-in-out infinite; }
        @keyframes waterWave { 0%,100% { transform: translateX(0) translateY(0); } 25% { transform: translateX(-10%) translateY(-2px); } 50% { transform: translateX(0) translateY(-3px); } 75% { transform: translateX(-10%) translateY(-2px); } }
        @keyframes waterShimmer { 0%,100% { opacity: 0.6; } 50% { opacity: 0.9; } }
        .marker-icon { position: relative; z-index: 10; color: white; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2)); }
        .marker-ring { position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px; border-radius: 50%; border: 2px solid var(--marker-color); opacity: 0; animation: ringPulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
        @keyframes ringPulse { 0% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 0; } 100% { transform: scale(0.95); opacity: 0; } }
        .custom-marker-wrapper:hover .custom-marker-animated { transform: scale(1.15); box-shadow: 0 8px 20px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.15); }
        .custom-marker-wrapper:hover .marker-water-wave { animation-duration: 2s; }
        .custom-marker-wrapper:hover .marker-ring { animation-duration: 1.5s; }
        .maplibregl-popup-content { padding: 0; border-radius: 12px; background: transparent; box-shadow: none; }
        .maplibregl-popup-tip { display: none; }
        .maplibregl-popup-close-button { display: none; }
      `}</style>
    </div>
  );
};

export default MapComponentSwamp;