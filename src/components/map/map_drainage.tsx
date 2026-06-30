"use client";

import React, { useEffect, useRef, useState, FC } from "react";
import { Layers, Map as MapIcon, Droplets } from "lucide-react";
import maplibregl, { Map, Marker, Popup, ScaleControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import stationsData from "./stations_complete.json";
import { useStation, generateMockStationData } from "@/contexts/station-context";
import type { TelemetryStationResult } from "@/app/api/lib/fetchTelemetryReading";
import { getPipeMarkerColor, formatTelemetryTime } from "@/lib/water-level-status";
import { TelemetryHistoryChartModal } from "@/components/telemetry/telemetry-history-chart-modal";

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
// Legend segments (ระดับน้ำในท่อ)
// ─────────────────────────────────────────────
const LEGEND_SEGMENTS = [
  { range: "0-0.5",   color: "#81d4fa" },
  { range: ">0.5-1",  color: "#d0f8ce" },
  { range: ">1-1.5",  color: "#7cb342" },
  { range: ">1.5-2",  color: "#fdd835" },
  { range: ">2-2.5",  color: "#f57f17" },
  { range: ">2.5",    color: "#8d6e63" },
  { range: "สูงมาก", color: "#bf360c" },
];


const LEVEL_LABELS = [
  { label: "ปกติ",      span: 2 },
  { label: "ปานกลาง",  span: 2 },
  { label: "วิกฤต",    span: 2 },
];

// ─────────────────────────────────────────────
// Main MapComponentDrainage
// ─────────────────────────────────────────────
const MapComponentDrainage: FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map          = useRef<Map | null>(null);
  const markersRef   = useRef<Marker[]>([]);
  const telemetryRef = useRef<Record<string, TelemetryStationResult>>({});

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
    const reading = telemetryRef.current[stationId];
    const levelM = reading?.status === "ok" ? (reading.water_level_m ?? 0) : 0;
    const markerColor = reading?.status === "ok" ? getPipeMarkerColor(levelM) : config.color;
    const waterHeight = Math.min((levelM / 3) * 100, 100);
    el.innerHTML = `
      <div class="custom-marker-animated" style="--marker-color: ${markerColor}; --water-height: ${waterHeight}%;">
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
    const reading  = telemetryRef.current[station.id];
    const hasData  = reading?.status === "ok" && reading.water_level_m != null;
    const mockValue = hasData ? reading!.water_level_m! : 0;
    const mockUnit  = "ม.";
    const mockLabel = "ระดับน้ำในท่อ";
    const timeLabel = hasData ? formatTelemetryTime(reading!.date_time) : "ไม่มีข้อมูล";

    const waterHeight = Math.min((mockValue / 3) * 100, 100);

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
          ${prefix === "WP" ? `
          <div class="pipe-water-container">
            <div class="pipe-visualization">
              <div class="pipe-body" style="--pipe-water-height: ${waterHeight}%;">
                <div class="pipe-water-flow">
                  <div class="water-wave-pipe"></div>
                  <div class="water-shimmer-pipe"></div>
                  <div class="water-bubbles">
                    <div class="bubble bubble-1"></div>
                    <div class="bubble bubble-2"></div>
                    <div class="bubble bubble-3"></div>
                  </div>
                </div>
                <div class="pipe-level-indicator">
                  <span class="pipe-level-number">${mockValue.toFixed(2)}</span>
                  <span class="pipe-level-unit">${mockUnit}</span>
                </div>
                <div class="pipe-scale">
                  <div class="pipe-scale-line" style="bottom: 0%;"><span>0</span></div>
                  <div class="pipe-scale-line" style="bottom: 33.33%;"><span>1</span></div>
                  <div class="pipe-scale-line" style="bottom: 66.67%;"><span>2</span></div>
                  <div class="pipe-scale-line" style="bottom: 100%;"><span>3</span></div>
                </div>
              </div>
              <div class="pipe-cap pipe-cap-top"></div>
              <div class="pipe-cap pipe-cap-bottom"></div>
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
              <span>${timeLabel}</span>
            </div>
            ${prefix === "WP" ? `
            <button class="drain-chart-btn" data-station-id="${station.id}" data-level="${mockValue.toFixed(2)}" title="ดูกราฟระดับน้ำในท่อ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
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
        if (station.id.substring(0, 2) !== "WP") return;
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
              `.drain-chart-btn[data-station-id="${station.id}"]`
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
    const loadTelemetry = async () => {
      try {
        const res = await fetch("/api/water/pipe");
        const json = await res.json();
        const map: Record<string, TelemetryStationResult> = {};
        for (const station of json.stations ?? []) {
          if (station.map_id) map[station.map_id] = station;
        }
        telemetryRef.current = map;
        if (isLoaded) addStationMarkers();
      } catch (error) {
        console.error("Error loading pipe telemetry:", error);
      }
    };
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isLoaded]);

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
        <TelemetryHistoryChartModal
          category="pipe"
          stationCode={chartStation.id}
          title={`กราฟระดับน้ำในท่อ — ${chartStation.name}`}
          subtitle={chartStation.location.area}
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
        .station-type-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; color: white; font-size: 10px; font-weight: 600; margin-bottom: 8px; }
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

        /* ปุ่มกราฟแท่ง (สีน้ำเงิน) */
        .drain-chart-btn { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: #EFF6FF; border: 1.5px solid #BFDBFE; color: #3B82F6; cursor: pointer; transition: background 0.15s, transform 0.15s; }
        .drain-chart-btn:hover { background: #DBEAFE; transform: scale(1.1); }
        .drain-chart-btn:active { transform: scale(0.95); }

        /* pipe popup */
        .pipe-water-container { margin-bottom: 0; }
        .pipe-visualization { position: relative; width: 100%; height: 180px; display: flex; align-items: center; justify-content: center; }
        .pipe-body { position: relative; width: 80%; height: 100%; background: linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%); border: 3px solid #475569; border-radius: 8px; overflow: hidden; box-shadow: inset 0 2px 8px rgba(71,85,105,0.2), 0 4px 12px rgba(0,0,0,0.1); }
        .pipe-water-flow { position: absolute; bottom: 0; left: 0; right: 0; height: var(--pipe-water-height); background: linear-gradient(180deg, rgba(59,130,246,0.7) 0%, rgba(37,99,235,0.85) 50%, rgba(29,78,216,0.95) 100%); transition: height 0.8s cubic-bezier(0.4,0,0.2,1); }
        .water-wave-pipe { position: absolute; top: -12px; left: -50%; width: 200%; height: 25px; background: radial-gradient(ellipse at center, rgba(147,197,253,0.6) 0%, rgba(96,165,250,0.3) 50%, transparent 70%); border-radius: 45%; animation: pipeWaterWave 4s ease-in-out infinite; }
        .water-shimmer-pipe { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%); background-size: 200% 200%; animation: pipeShimmer 3s ease-in-out infinite; }
        .water-bubbles { position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; }
        .bubble { position: absolute; bottom: 0; width: 6px; height: 6px; background: rgba(255,255,255,0.5); border-radius: 50%; animation: bubbleRise 3s ease-in infinite; }
        .bubble-1 { left: 20%; animation-delay: 0s; animation-duration: 3s; }
        .bubble-2 { left: 50%; animation-delay: 1s; animation-duration: 4s; }
        .bubble-3 { left: 80%; animation-delay: 2s; animation-duration: 3.5s; }
        @keyframes pipeWaterWave { 0%,100% { transform: translateX(0) translateY(0); } 25% { transform: translateX(-12%) translateY(-2px); } 50% { transform: translateX(0) translateY(-4px); } 75% { transform: translateX(-12%) translateY(-2px); } }
        @keyframes pipeShimmer { 0%,100% { background-position: 0% 50%; opacity: 0.6; } 50% { background-position: 100% 50%; opacity: 1; } }
        @keyframes bubbleRise { 0% { bottom: 0; opacity: 0; transform: translateX(0) scale(0.5); } 10% { opacity: 1; } 90% { opacity: 1; } 100% { bottom: 100%; opacity: 0; transform: translateX(10px) scale(1); } }
        .pipe-level-indicator { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 10; display: flex; align-items: baseline; gap: 6px; background: rgba(255,255,255,0.95); padding: 10px 18px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 2px solid #3B82F6; }
        .pipe-level-number { font-size: 32px; font-weight: 900; color: #1E40AF; line-height: 1; }
        .pipe-level-unit { font-size: 15px; font-weight: 700; color: #3B82F6; }
        .pipe-scale { position: absolute; right: 6px; top: 0; bottom: 0; width: 25px; z-index: 5; }
        .pipe-scale-line { position: absolute; right: 0; width: 100%; height: 1px; background: rgba(71,85,105,0.3); display: flex; align-items: center; justify-content: flex-end; }
        .pipe-scale-line::before { content: ''; position: absolute; right: 0; width: 6px; height: 2px; background: #475569; }
        .pipe-scale-line span { position: absolute; right: 10px; font-size: 9px; font-weight: 700; color: #1E293B; background: rgba(255,255,255,0.95); padding: 1px 3px; border-radius: 3px; transform: translateY(-50%); }
        .pipe-cap { position: absolute; left: 50%; transform: translateX(-50%); width: calc(80% - 6px); height: 8px; background: linear-gradient(180deg, #334155 0%, #475569 100%); border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .pipe-cap-top { top: -4px; }
        .pipe-cap-bottom { bottom: -4px; }

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

export default MapComponentDrainage;