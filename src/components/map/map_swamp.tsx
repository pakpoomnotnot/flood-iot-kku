"use client";

import React, { useEffect, useRef, useState, FC, useMemo } from "react";
import { Layers, Map as MapIcon, Droplets, Waves } from "lucide-react";
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
// Legend segments (ระดับน้ำในบึง)
// ─────────────────────────────────────────────
const LEGEND_SEGMENTS = [
  { range: "0-1",   color: "#81d4fa", label: "" },
  { range: ">1-2",  color: "#d0f8ce", label: "" },
  { range: ">2-3",  color: "#7cb342", label: "" },
  { range: ">3-4",  color: "#fdd835", label: "" },
  { range: ">4-5",  color: "#f57f17", label: "" },
  { range: ">5-6",  color: "#8d6e63", label: "" },
  { range: ">6",    color: "#bf360c", label: "" },
];


const LEVEL_LABELS = [
  { label: "ต่ำ",      span: 2 },
  { label: "ปานกลาง",  span: 2 },
  { label: "สูง",      span: 2 },
  { label: "สูงมาก",   span: 1 },
];

// ─────────────────────────────────────────────
// Mock hourly water-level data
// ─────────────────────────────────────────────
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
// Chart Modal (กราฟเส้น)
// ─────────────────────────────────────────────
interface ChartModalProps {
  station: Station;
  currentLevel: number;
  onClose: () => void;
}

const ChartModal: FC<ChartModalProps> = ({ station, currentLevel, onClose }) => {
  const data         = useMemo(() => generateMockWaterLevel(currentLevel), [station.id]);
  const currentLabel = data[data.length - 1]?.label ?? "";
  const tickLabels   = data.filter((_, i) => i % 4 === 0).map((d) => d.label);

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
        <div className="flex items-center gap-4 px-5 py-2.5 bg-blue-50/60 text-xs text-gray-500 border-b border-blue-100">
          <span>📍 {station.location.area}</span>
          <span className="ml-auto font-semibold text-blue-700">
            ระดับน้ำปัจจุบัน: {currentLevel.toFixed(2)} ม.
          </span>
        </div>

        {/* Chart */}
        <div className="px-4 pt-4 pb-3">
          <p className="text-[11px] font-medium text-gray-400 mb-3 uppercase tracking-wide">
            ระดับน้ำในบึง (ม.) — 24 ชั่วโมงย้อนหลัง
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

              {/* เส้น threshold */}
              <ReferenceLine y={1.5} stroke="#CA8A04" strokeWidth={1} strokeDasharray="5 4"
                label={{ value: "เฝ้าระวัง", position: "right", fontSize: 9, fill: "#CA8A04", fontWeight: 600 }} />
              <ReferenceLine y={3.0} stroke="#EA580C" strokeWidth={1} strokeDasharray="5 4"
                label={{ value: "เตือนภัย", position: "right", fontSize: 9, fill: "#EA580C", fontWeight: 600 }} />
              <ReferenceLine y={4.5} stroke="#DC2626" strokeWidth={1} strokeDasharray="5 4"
                label={{ value: "วิกฤต", position: "right", fontSize: 9, fill: "#DC2626", fontWeight: 600 }} />

              {/* เส้นแดงบอกเวลาปัจจุบัน */}
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

  const { setSelectedStationData } = useStation();
  const API_KEY = "yYduxrRP3C81U2fRFNIU";

  const basemaps: Record<BasemapStyleKey, BasemapConfig> = {
    hybrid: { name: "Hybrid",      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${API_KEY}`,  icon: "🌍" },
    topo:   { name: "Topographic", style: `https://api.maptiler.com/maps/topo-v2/style.json?key=${API_KEY}`, icon: "🏔️" },
  };

  // ── Marker ──
  const createMarkerElement = (stationId: string): HTMLDivElement => {
    const el = document.createElement("div");
    el.className = "custom-marker-wrapper";
    const prefix = stationId.substring(0, 2) as keyof typeof stationTypeConfig;
    const config = stationTypeConfig[prefix] || { color: "#6B7280", icon: ICONS.mapPin };
    const waterLevel  = Math.random() * 5 + 1;
    const waterHeight = Math.min((waterLevel / 6) * 100, 100);
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

  // ── Popup HTML ──
  const createPopupContent = (station: Station): string => {
    const prefix   = station.id.substring(0, 2) as keyof typeof stationTypeConfig;
    const typeInfo = stationTypeConfig[prefix] || { label: "อื่นๆ", color: "#6B7280", icon: ICONS.tag };

    let mockValue = 0;
    let mockUnit  = "";
    let mockLabel = "";
    switch (prefix) {
      case "RF": mockValue = Math.random() * 50;      mockUnit = "มม."; mockLabel = "ปริมาณฝนสะสม";   break;
      case "WP": mockValue = Math.random() * 2 + 0.5; mockUnit = "ม.";  mockLabel = "ระดับน้ำในท่อ";   break;
      case "WR": mockValue = Math.random() * 0.8;     mockUnit = "ม.";  mockLabel = "ระดับน้ำท่วมถนน"; break;
      case "PW": mockValue = Math.random() * 5 + 1;   mockUnit = "ม.";  mockLabel = "ระดับน้ำในบึง";   break;
      default:   mockValue = 0; mockUnit = ""; mockLabel = "ข้อมูล";
    }

    const waterHeight = prefix === "PW" ? Math.min((mockValue / 6) * 100, 100) : 50;

    return `
      <div class="modern-popup">
        <div class="popup-close-btn" onclick="this.closest('.maplibregl-popup').remove()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <div class="popup-location-header" style="background: linear-gradient(135deg, ${typeInfo.color}15 0%, ${typeInfo.color}05 100%);">
          <div class="station-type-badge" style="background: ${typeInfo.color};">
            ${typeInfo.icon}<span>${typeInfo.label}</span>
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
                <span class="level-number">${mockValue.toFixed(2)}</span>
                <span class="level-unit">${mockUnit}</span>
              </div>
              <div class="water-scale">
                ${[6,5,4,3,2,1,0].map(n => `<div class="scale-line" style="bottom:${(n/6)*100}%"><span>${n}</span></div>`).join("")}
              </div>
            </div>
          </div>
          ` : `
          <div class="data-value-box">
            <span class="data-number">${mockValue.toFixed(2)}</span>
            <span class="data-unit">${mockUnit}</span>
          </div>
          `}
          <div class="popup-footer-row">
            <div class="data-timestamp">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>4 ธ.ค. 2568 14:30</span>
            </div>
            ${prefix === "PW" ? `
            <button class="swamp-chart-btn" data-station-id="${station.id}" data-level="${mockValue.toFixed(2)}" title="ดูกราฟระดับน้ำ">
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

  // ── Add markers ──
  const addStationMarkers = () => {
    if (!map.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const data = stationsData as StationsData;
    data.stationTypes.forEach((stationType) => {
      stationType.stations.forEach((station) => {
        if (station.id.substring(0, 2) !== "PW") return;
        const el    = createMarkerElement(station.id);
        const popup = new Popup({ offset: 35, closeButton: false }).setHTML(createPopupContent(station));
        const marker = new Marker({ element: el })
          .setLngLat([station.location.longitude, station.location.latitude])
          .setPopup(popup);
        if (map.current) { marker.addTo(map.current); markersRef.current.push(marker); }

        el.addEventListener("click", () => {
          setSelectedStationData(generateMockStationData(station));
        });

        popup.on("open", () => {
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
    if (map.current || !mapContainer.current) return;
    map.current = new Map({
      container: mapContainer.current,
      style: basemaps[currentStyle].style,
      center: [102.82, 16.44],
      zoom: 12,
      attributionControl: false,
    });
    map.current.addControl(new ScaleControl(), "bottom-left");
    map.current.on("load", () => { setIsLoaded(true); addStationMarkers(); });
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

      {/* ── Map ── */}
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

        {/* Basemap switcher */}
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

      {/* ── Legend แถบล่างสุด (เหมือน map_rain) ── */}
      <div className="flex-shrink-0 bg-white border-t border-gray-300 px-3 pt-1.5 pb-2">
        {/* แถบสี 7 ช่อง */}
        <div className="flex w-full rounded-sm overflow-hidden border border-gray-300">
          {LEGEND_SEGMENTS.map((seg, i) => (
            <div key={i} className="flex-1 flex items-center justify-center py-2" style={{ backgroundColor: seg.color }}>
              <span className="text-[9px] font-bold text-gray-800 whitespace-nowrap">{seg.range}</span>
            </div>
          ))}
        </div>
        {/* Label ระดับ */}
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

      {/* ── Chart Modal ── */}
      {chartStation && (
        <ChartModal
          station={chartStation}
          currentLevel={chartLevel}
          onClose={() => setChartStation(null)}
        />
      )}

      {/* ── Global styles ── */}
      <style jsx global>{`
        .modern-popup {
          font-family: system-ui, -apple-system, sans-serif;
          width: 280px; background: white; border-radius: 12px;
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
          border-radius: 6px; color: white; font-size: 10px; font-weight: 600; margin-bottom: 8px;
        }
        .station-type-badge svg { width: 12px; height: 12px; }
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
        .popup-footer-row { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
        .data-timestamp { display: flex; align-items: center; gap: 5px; font-size: 10px; color: #9CA3AF; }
        .data-timestamp svg { color: #9CA3AF; }

        /* ปุ่มกราฟเส้น (สีเขียว) */
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
          position: relative; width: 100%; height: 180px;
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
        .water-level-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 10; display: flex; align-items: baseline; gap: 6px; background: rgba(255,255,255,0.95); padding: 10px 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 2px solid #0EA5E9; }
        .level-number { font-size: 32px; font-weight: 900; color: #0369A1; line-height: 1; }
        .level-unit { font-size: 14px; font-weight: 700; color: #0284C7; }
        .water-scale { position: absolute; right: 8px; top: 0; bottom: 0; width: 30px; z-index: 5; }
        .scale-line { position: absolute; right: 0; width: 100%; height: 1px; background: rgba(14,165,233,0.3); display: flex; align-items: center; justify-content: flex-end; }
        .scale-line::before { content: ''; position: absolute; right: 0; width: 8px; height: 1px; background: #0EA5E9; }
        .scale-line span { position: absolute; right: 12px; font-size: 9px; font-weight: 700; color: #0369A1; background: rgba(255,255,255,0.9); padding: 1px 4px; border-radius: 3px; transform: translateY(-50%); }

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