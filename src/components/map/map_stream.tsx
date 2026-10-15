"use client";

import { MAPTILER_API_KEY } from "@/lib/map-config";
import React, { useEffect, useRef, useState, FC } from "react";
import { Layers, Map as MapIcon } from "lucide-react";
import maplibregl, { Map, Marker, Popup, ScaleControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import stationsData from "./stations_complete.json";
import { useStation, generateMockStationData } from "@/contexts/station-context";
import { formatTelemetryTime, NO_DATA_COLOR } from "@/lib/water-level-status";
import { CANAL_MAP_IDS, CANAL_LAKE_SOURCE } from "@/lib/telemetry-stations";

// ─────────────────────────────────────────────
// ระดับน้ำในลำน้ำ (ทางน้ำเปิด) — แยกออกจากท่อระบายน้ำ
// สถานีลำน้ำใช้ข้อมูลจากสถานีบึงแบบ "ทางน้ำเปิด" (Lake_XX) ผ่าน CANAL_LAKE_SOURCE เช่น
// WP06 (สะพาน บ้านทุ่งเศรษฐี) -> Lake_01 ค่าที่ได้เป็นระดับเทียบน้ำทะเล (ม.รทก.) ไม่ใช่ความลึกน้ำ
// และยังไม่มีเกณฑ์ความรุนแรงที่ยืนยันแล้ว จึงใช้สีกลางตลอด
// ─────────────────────────────────────────────
const STREAM_COLOR = "#3B82F6";

const WAVES_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`;

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

interface LakeApiItem {
  lake_id: string;
  status: "ok" | "error" | "no_data";
  stale?: boolean;
  water_level?: number;
  date_time?: string;
}

// ภาพหน้าตัดลำน้ำ (ทางน้ำเปิดรูปสี่เหลี่ยมคางหมู) พร้อมเส้นระดับน้ำและค่า ม.รทก. ที่ผิวน้ำ
// ไม่มีข้อมูลระดับตลิ่ง/ท้องน้ำอ้างอิง ระดับน้ำในภาพจึงเป็นเพียงภาพประกอบ ไม่ตามมาตราส่วนจริง
const crossSectionSvg = (valueText: string, color: string): string => {
  const groundY = 28;
  const bedY = 128;
  const topL = 40, topR = 200, botL = 82, botR = 158;
  const surfaceY = 74;
  const t = (surfaceY - groundY) / (bedY - groundY);
  const surfL = topL + t * (botL - topL);
  const surfR = topR - t * (topR - botR);
  const water = `M${surfL} ${surfaceY} L${surfR} ${surfaceY} L${botR} ${bedY} L${botL} ${bedY} Z`;
  return `
    <svg class="stream-svg" viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="หน้าตัดลำน้ำ">
      <defs>
        <clipPath id="streamWaterClip"><path d="${water}"/></clipPath>
      </defs>
      <path d="M0 ${groundY} H${topL} L${botL} ${bedY} H${botR} L${topR} ${groundY} H240 V150 H0 Z" fill="#E9DFCF"/>
      <path d="${water}" fill="${color}" fill-opacity="0.7"/>
      <g clip-path="url(#streamWaterClip)">
        <path class="stream-wave" d="M20 ${surfaceY + 4} q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V${bedY} H20 Z" fill="${color}" fill-opacity="0.35"/>
      </g>
      <line x1="${surfL}" y1="${surfaceY}" x2="${surfR}" y2="${surfaceY}" stroke="${color}" stroke-width="2.5"/>
      <path d="M0 ${groundY} H${topL} L${botL} ${bedY} H${botR} L${topR} ${groundY} H240" fill="none" stroke="#8B5E3C" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M114 62 L120 ${surfaceY - 1} L126 62 Z" fill="${color}"/>
      <rect x="55" y="34" width="130" height="28" rx="14" fill="#fff" stroke="${color}" stroke-width="2"/>
      <text x="120" y="53" text-anchor="middle" fill="#1E293B" font-family="system-ui,-apple-system,sans-serif"><tspan font-size="17" font-weight="800">${valueText}</tspan><tspan font-size="10" font-weight="700" dx="4" fill="#64748B">ม.รทก.</tspan></text>
    </svg>
  `;
};

const MapComponentStream: FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map          = useRef<Map | null>(null);
  const markersRef   = useRef<Marker[]>([]);
  const lakeRef      = useRef<Record<string, LakeApiItem>>({});

  const [currentStyle, setCurrentStyle]   = useState<BasemapStyleKey>("topo");
  const [isLoaded, setIsLoaded]           = useState(false);
  const [isSwitcherOpen, setSwitcherOpen] = useState(false);

  const { setSelectedStationData } = useStation();
  const API_KEY = MAPTILER_API_KEY;

  const basemaps: Record<BasemapStyleKey, BasemapConfig> = {
    hybrid: { name: "Hybrid",      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${API_KEY}`,  icon: "🌍" },
    topo:   { name: "Topographic", style: `https://api.maptiler.com/maps/topo-v2/style.json?key=${API_KEY}`, icon: "🏔️" },
  };

  const getLake = (stationId: string): LakeApiItem | undefined => {
    const lakeId = CANAL_LAKE_SOURCE[stationId];
    return lakeId ? lakeRef.current[lakeId] : undefined;
  };

  const hasLevel = (lake: LakeApiItem | undefined): lake is LakeApiItem & { water_level: number } =>
    lake?.status === "ok" && lake.water_level != null;

  // ── Marker ──
  const createMarkerElement = (stationId: string): HTMLDivElement => {
    const el = document.createElement("div");
    el.className = "custom-marker-wrapper";
    const markerColor = hasLevel(getLake(stationId)) ? STREAM_COLOR : NO_DATA_COLOR.color;
    el.innerHTML = `
      <div class="custom-marker-animated" style="--marker-color: ${markerColor}; --water-height: 55%;">
        <div class="marker-water-container">
          <div class="marker-water-wave"></div>
          <div class="marker-water-fill"></div>
        </div>
        <div class="marker-icon">${WAVES_ICON}</div>
        <div class="marker-ring"></div>
      </div>
    `;
    return el;
  };

  // ── Popup HTML ──
  const createPopupContent = (station: Station): string => {
    const lake = getLake(station.id);
    const hasData = hasLevel(lake);
    const level = hasData ? lake.water_level : 0;
    const color = hasData ? STREAM_COLOR : NO_DATA_COLOR.color;
    const timeLabel = hasData ? formatTelemetryTime(lake.date_time) : "ไม่มีข้อมูล";
    // แจ้งเตือนเมื่อไม่มีค่าเข้ามาเลย หรือ MQTT ไม่อัปเดตมานาน (ไม่ใช่แค่ค่า 0.00 จริง)
    const errorNotice = lake?.stale || !hasData
      ? `<div class="station-error-notice">⚠️ สถานีเกิดข้อผิดพลาด รอการตรวจสอบ</div>`
      : "";

    return `
      <div class="modern-popup">
        <div class="popup-close-btn" onclick="this.closest('.maplibregl-popup').remove()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <div class="popup-location-header" style="background: linear-gradient(135deg, ${STREAM_COLOR}15 0%, ${STREAM_COLOR}05 100%);">
          <div class="station-type-badge" style="background: ${STREAM_COLOR};">
            ${WAVES_ICON}<span>ลำน้ำ</span>
          </div>
          <h3 class="location-name">${station.name}</h3>
          <div class="location-area">${station.location.area}</div>
        </div>
        <div class="popup-content-body">
          <div class="data-label">ระดับน้ำในลำน้ำ</div>
          ${errorNotice}
          <div class="stream-section">
            ${crossSectionSvg(level.toFixed(2), color)}
            <div class="stream-caption">ภาพแสดงหน้าตัดลำน้ำ ไม่ตามมาตราส่วน</div>
          </div>
          <div class="popup-footer-row">
            <div class="data-timestamp">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${timeLabel}</span>
            </div>
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
        if (!CANAL_MAP_IDS.has(station.id)) return;
        const el    = createMarkerElement(station.id);
        const popup = new Popup({ offset: 35, closeButton: false }).setHTML(createPopupContent(station));
        const marker = new Marker({ element: el })
          .setLngLat([station.location.longitude, station.location.latitude])
          .setPopup(popup);
        if (map.current) { marker.addTo(map.current); markersRef.current.push(marker); }

        el.addEventListener("click", () => {
          setSelectedStationData(generateMockStationData(station));
        });
      });
    });
  };

  useEffect(() => {
    const loadLakes = async () => {
      try {
        const res = await fetch("/api/lake");
        const json = await res.json();
        const byId: Record<string, LakeApiItem> = {};
        for (const lake of json.lakes ?? []) {
          byId[lake.lake_id] = lake;
        }
        lakeRef.current = byId;
        if (isLoaded) addStationMarkers();
      } catch (error) {
        console.error("Error loading stream telemetry:", error);
      }
    };
    loadLakes();
    const interval = setInterval(loadLakes, 15 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      {/* ── แถบล่างสุด — ลำน้ำยังไม่มีเกณฑ์ความรุนแรงที่ยืนยันแล้ว ── */}
      <div className="flex-shrink-0 bg-white border-t border-gray-300 px-3 py-2 text-center text-[10px] text-gray-400">
        ยังไม่มีเกณฑ์ความรุนแรงระดับน้ำสำหรับลำน้ำ
      </div>

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
        .station-error-notice { display: flex; align-items: center; gap: 6px; background: #fef2f2; border: 1px solid #fca5a5; color: #b91c1c; font-size: 11px; font-weight: 700; padding: 8px 10px; border-radius: 8px; margin-bottom: 10px; }
        .popup-footer-row { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
        .data-timestamp { display: flex; align-items: center; gap: 5px; font-size: 10px; color: #9CA3AF; }
        .data-timestamp svg { color: #9CA3AF; }

        /* ภาพหน้าตัดลำน้ำ */
        .stream-section { background: white; border: 1px solid #E5E7EB; border-radius: 10px; padding: 6px 6px 4px; overflow: hidden; }
        .stream-svg { display: block; width: 100%; height: auto; }
        .stream-wave { animation: streamWave 3s linear infinite; }
        @keyframes streamWave { from { transform: translateX(0); } to { transform: translateX(-40px); } }
        .stream-caption { text-align: center; font-size: 9px; color: #94A3B8; font-weight: 600; margin-top: 2px; }

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

export default MapComponentStream;
