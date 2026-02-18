"use client";

import React, { useEffect, useRef, useState, FC, useMemo } from "react";
import { Layers, Map as MapIcon, Droplets, ShieldAlert } from "lucide-react";
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
// Legend segments (ระดับน้ำท่วมถนน)
// ─────────────────────────────────────────────
const LEGEND_SEGMENTS = [
  { range: "0-0.11",    color: "#81d4fa" },
  { range: ">0.11-0.23", color: "#d0f8ce" },
  { range: ">0.23-0.34", color: "#7cb342" },
  { range: ">0.34-0.46", color: "#fdd835" },
  { range: ">0.46-0.57", color: "#f57f17" },
  { range: ">0.57-0.69", color: "#8d6e63" },
  { range: ">0.69",      color: "#bf360c" },
];

const LEVEL_LABELS = [
  { label: "ปลอดภัย", span: 1 },
  { label: "ระวัง",   span: 2 },
  { label: "อันตราย", span: 1 },
  { label: "วิกฤต",   span: 1 },
];

// ─────────────────────────────────────────────
// Mock hourly road flood data
// ─────────────────────────────────────────────
interface HourlyPoint { label: string; value: number; }

function generateMockRoadFlood(currentLevel: number): HourlyPoint[] {
  const now = new Date();
  let prev = Math.max(0, currentLevel - Math.random() * 0.3);
  return Array.from({ length: 24 }, (_, i) => {
    const t = new Date(now.getTime() - (23 - i) * 3_600_000);
    const label = `${t.getDate()}-${t.toLocaleString("en", { month: "short" })} ${t
      .getHours().toString().padStart(2, "0")}:00`;
    const delta = (Math.random() - 0.48) * 0.08;
    prev = Math.max(0, Math.min(1.2, prev + delta));
    if (i === 23) prev = currentLevel;
    return { label, value: parseFloat(prev.toFixed(3)) };
  });
}

// ─────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  const color = v > 0.8 ? "#DC2626" : v > 0.6 ? "#F87171" : v > 0.4 ? "#FB923C" : v > 0.2 ? "#CA8A04" : "#16A34A";
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-600 mb-1">{label}</p>
      <p className="font-bold" style={{ color }}>{v} ม.</p>
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
  const data         = useMemo(() => generateMockRoadFlood(currentLevel), [station.id]);
  const currentLabel = data[data.length - 1]?.label ?? "";
  const tickLabels   = data.filter((_, i) => i % 4 === 0).map((d) => d.label);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4 rounded-2xl bg-white shadow-2xl border border-red-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-800">กราฟน้ำท่วมถนน — {station.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{station.location.area}</p>
          </div>
          <button onClick={onClose} className="ml-4 mt-0.5 flex-shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sub-header */}
        <div className="flex items-center gap-4 px-5 py-2.5 bg-red-50/60 text-xs text-gray-500 border-b border-red-100">
          <span>{station.location.area}</span>
          <span className="ml-auto font-semibold text-red-600">
            ระดับน้ำปัจจุบัน: {currentLevel.toFixed(2)} ม.
          </span>
        </div>

        {/* Chart */}
        <div className="px-4 pt-4 pb-3">
          <p className="text-[11px] font-medium text-gray-400 mb-3 uppercase tracking-wide">
            ระดับน้ำท่วมถนน (ม.) — 24 ชั่วโมงย้อนหลัง
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 10, right: 60, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="roadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" ticks={tickLabels} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 1.2]} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} unit=" ม." />
              <Tooltip content={<CustomTooltip />} />

              {/* Threshold lines */}
              <ReferenceLine y={0.2} stroke="#CA8A04" strokeWidth={1} strokeDasharray="5 4"
                label={{ value: "ระวัง", position: "right", fontSize: 9, fill: "#CA8A04", fontWeight: 600 }} />
              <ReferenceLine y={0.6} stroke="#EA580C" strokeWidth={1} strokeDasharray="5 4"
                label={{ value: "อันตราย", position: "right", fontSize: 9, fill: "#EA580C", fontWeight: 600 }} />
              <ReferenceLine y={0.8} stroke="#DC2626" strokeWidth={1} strokeDasharray="5 4"
                label={{ value: "วิกฤต", position: "right", fontSize: 9, fill: "#DC2626", fontWeight: 600 }} />

              {/* เส้นปัจจุบัน */}
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
                stroke="#EF4444"
                strokeWidth={2.5}
                fill="url(#roadGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#EF4444", strokeWidth: 2, stroke: "#fff" }}
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
// Main MapComponentRoads
// ─────────────────────────────────────────────
const MapComponentRoads: FC = () => {
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
    const waterLevel  = Math.random() * 0.8;
    const waterHeight = Math.min((waterLevel / 1) * 100, 100);
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

    const waterHeight = prefix === "WR" ? Math.min((mockValue / 1) * 100, 100) : 50;

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
          ${prefix === "WR" ? `
          <div class="road-flood-container">
            <div class="road-visualization">
              <div class="road-surface">
                <div class="road-marking road-marking-1"></div>
                <div class="road-marking road-marking-2"></div>
                <div class="road-marking road-marking-3"></div>
              </div>
              <div class="flood-water" style="--flood-height: ${waterHeight}%;">
                <div class="water-flow-road">
                  <div class="water-wave-road wave-1"></div>
                  <div class="water-wave-road wave-2"></div>
                  <div class="water-ripple ripple-1"></div>
                  <div class="water-ripple ripple-2"></div>
                  <div class="water-ripple ripple-3"></div>
                </div>
                <div class="debris debris-1">🍃</div>
                <div class="debris debris-2">🍂</div>
                <div class="debris debris-3">📄</div>
              </div>
              <div class="flood-level-indicator">
                <div class="level-bar" style="height: ${waterHeight}%;"></div>
                <div class="level-marks">
                  <div class="level-mark" style="bottom: 0%;"><span>0</span></div>
                  <div class="level-mark" style="bottom: 25%;"><span>0.2</span></div>
                  <div class="level-mark" style="bottom: 50%;"><span>0.4</span></div>
                  <div class="level-mark" style="bottom: 75%;"><span>0.6</span></div>
                  <div class="level-mark" style="bottom: 100%;"><span>0.8</span></div>
                </div>
              </div>
              <div class="road-level-text">
                <span class="road-level-number">${mockValue.toFixed(2)}</span>
                <span class="road-level-unit">${mockUnit}</span>
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
            ${prefix === "WR" ? `
            <button class="road-chart-btn" data-station-id="${station.id}" data-level="${mockValue.toFixed(3)}" title="ดูกราฟระดับน้ำท่วมถนน">
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
        if (station.id.substring(0, 2) !== "WR") return;
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
              `.road-chart-btn[data-station-id="${station.id}"]`
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

      {/* ── Legend แถบล่างสุด ── */}
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
        .modern-popup { font-family: system-ui,-apple-system,sans-serif; width: 270px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.12); position: relative; }
        .popup-close-btn { position: absolute; top: 10px; right: 10px; width: 24px; height: 24px; border-radius: 50%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: all 0.2s; }
        .popup-close-btn:hover { background: rgba(0,0,0,0.7); transform: scale(1.05); }
        .popup-close-btn svg { color: #fff; }
        .popup-location-header { padding: 16px 14px 12px; border-bottom: 1px solid #E5E7EB; }
        .station-type-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; color: white; font-size: 10px; font-weight: 600; margin-bottom: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .station-type-badge svg { width: 12px; height: 12px; }
        .location-name { font-size: 15px; font-weight: 700; color: #111827; margin: 0 0 4px; line-height: 1.3; }
        .location-area { font-size: 11px; color: #6B7280; font-weight: 500; }
        .popup-content-body { padding: 14px; background: #F9FAFB; }
        .data-label { font-size: 10px; color: #6B7280; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
        .data-value-box { background: white; border: 2px solid #E5E7EB; border-radius: 10px; padding: 12px; display: flex; align-items: baseline; gap: 6px; margin-bottom: 10px; }
        .data-number { font-size: 32px; font-weight: 800; color: #1F2937; line-height: 1; }
        .data-unit { font-size: 14px; font-weight: 600; color: #6B7280; }
        .popup-footer-row { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
        .data-timestamp { display: flex; align-items: center; gap: 5px; font-size: 10px; color: #9CA3AF; }
        .data-timestamp svg { color: #9CA3AF; }

        /* ปุ่มกราฟเส้น (สีแดง) */
        .road-chart-btn { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: #FEF2F2; border: 1.5px solid #FECACA; color: #EF4444; cursor: pointer; transition: background 0.15s, transform 0.15s; }
        .road-chart-btn:hover { background: #FEE2E2; transform: scale(1.1); }
        .road-chart-btn:active { transform: scale(0.95); }

        /* road flood popup */
        .road-flood-container { margin-bottom: 0; }
        .road-visualization { position: relative; width: 100%; height: 200px; background: linear-gradient(180deg,#CBD5E1 0%,#94A3B8 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .road-surface { position: absolute; bottom: 0; left: 0; right: 0; height: 100%; background: linear-gradient(180deg,#3F3F46 0%,#27272A 100%); display: flex; justify-content: space-around; align-items: center; padding: 0 20px; }
        .road-marking { width: 6px; height: 40px; background: linear-gradient(180deg,#FBBF24 0%,#F59E0B 100%); border-radius: 3px; box-shadow: 0 0 10px rgba(251,191,36,0.6); animation: markingFade 1.5s ease-in-out infinite; }
        .road-marking-2 { animation-delay: 0.5s; }
        .road-marking-3 { animation-delay: 1s; }
        @keyframes markingFade { 0%,100% { opacity: 0.3; transform: scaleY(0.95); } 50% { opacity: 1; transform: scaleY(1); } }
        .flood-water { position: absolute; bottom: 0; left: 0; right: 0; height: var(--flood-height); background: linear-gradient(180deg, rgba(14,165,233,0.75) 0%, rgba(2,132,199,0.85) 50%, rgba(3,105,161,0.95) 100%); transition: height 0.8s cubic-bezier(0.4,0,0.2,1); box-shadow: inset 0 -20px 30px rgba(0,0,0,0.2); }
        .water-flow-road { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
        .water-wave-road { position: absolute; top: -12px; left: -50%; width: 200%; height: 24px; background: radial-gradient(ellipse at center, rgba(224,242,254,0.95) 0%, rgba(186,230,253,0.8) 40%, rgba(125,211,252,0.5) 70%, transparent 100%); border-radius: 50%; }
        .wave-1 { animation: roadWave1 3s ease-in-out infinite; filter: drop-shadow(0 2px 4px rgba(14,165,233,0.4)); }
        .wave-2 { animation: roadWave2 4s ease-in-out infinite; top: -8px; opacity: 0.8; }
        @keyframes roadWave1 { 0%,100% { transform: translateX(0) translateY(0) scaleY(1); } 50% { transform: translateX(-25%) translateY(-5px) scaleY(1.2); } }
        @keyframes roadWave2 { 0%,100% { transform: translateX(-10%) translateY(0) scaleY(1); } 50% { transform: translateX(15%) translateY(-4px) scaleY(1.15); } }
        .water-ripple { position: absolute; width: 50px; height: 50px; border: 3px solid rgba(224,242,254,0.7); border-radius: 50%; animation: rippleExpand 2.5s ease-out infinite; }
        .ripple-1 { top: 15%; left: 20%; animation-delay: 0s; }
        .ripple-2 { top: 45%; left: 55%; animation-delay: 0.8s; }
        .ripple-3 { top: 70%; left: 35%; animation-delay: 1.6s; }
        @keyframes rippleExpand { 0% { transform: scale(0.3); opacity: 1; border-width: 3px; } 70% { transform: scale(1.5); opacity: 0.4; border-width: 1px; } 100% { transform: scale(2); opacity: 0; border-width: 0; } }
        .debris { position: absolute; font-size: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); animation: debrisFloat 10s linear infinite; z-index: 5; }
        .debris-1 { top: 25%; left: -10%; animation-delay: 0s; animation-duration: 10s; }
        .debris-2 { top: 55%; left: -10%; animation-delay: 3.5s; animation-duration: 12s; }
        .debris-3 { top: 75%; left: -10%; animation-delay: 7s; animation-duration: 11s; }
        @keyframes debrisFloat { 0% { left: -10%; transform: translateY(0) rotate(0deg); } 25% { transform: translateY(-15px) rotate(90deg); } 50% { transform: translateY(-5px) rotate(180deg); } 75% { transform: translateY(-12px) rotate(270deg); } 100% { left: 110%; transform: translateY(0) rotate(360deg); } }
        .flood-level-indicator { position: absolute; right: 12px; top: 12px; bottom: 12px; width: 35px; background: linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.9) 100%); border-radius: 18px; overflow: hidden; z-index: 10; border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .level-bar { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(180deg, rgba(248,113,113,1) 0%, rgba(239,68,68,1) 50%, rgba(220,38,38,1) 100%); transition: height 0.8s cubic-bezier(0.4,0,0.2,1); border-radius: 18px 18px 0 0; animation: levelPulse 2s ease-in-out infinite; }
        @keyframes levelPulse { 0%,100% { opacity: 0.9; } 50% { opacity: 1; } }
        .level-marks { position: absolute; top: 0; bottom: 0; left: 0; right: 0; }
        .level-mark { position: absolute; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.6); }
        .level-mark::before { content: ''; position: absolute; left: 0; width: 10px; height: 2px; background: #fff; }
        .level-mark span { position: absolute; right: -32px; top: -8px; font-size: 9px; font-weight: 800; color: #0F172A; background: rgba(255,255,255,0.95); padding: 2px 5px; border-radius: 4px; transform: translateY(-50%); }
        .road-level-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 15; display: flex; align-items: baseline; gap: 8px; background: rgba(255,255,255,0.98); padding: 12px 20px; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.25); border: 3px solid #DC2626; animation: textGlow 2s ease-in-out infinite; }
        @keyframes textGlow { 0%,100% { box-shadow: 0 8px 16px rgba(0,0,0,0.25), 0 0 0 3px rgba(239,68,68,0.5); } 50% { box-shadow: 0 8px 20px rgba(0,0,0,0.3), 0 0 0 3px rgba(239,68,68,0.8), 0 0 20px rgba(239,68,68,0.4); } }
        .road-level-number { font-size: 38px; font-weight: 900; color: #991B1B; line-height: 1; }
        .road-level-unit { font-size: 16px; font-weight: 800; color: #DC2626; }

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

export default MapComponentRoads;