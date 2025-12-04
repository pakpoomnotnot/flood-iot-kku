"use client";

import React, { useEffect, useRef, useState, FC } from "react";

import {
  Map as MapIcon,
  Layers,
  Droplets,
  MapPin,
  Navigation,
  CloudRain,
  ShieldAlert,
  Waves,
  X,
} from "lucide-react";
import maplibregl, {
  Map,
  Marker,
  Popup,
  ScaleControl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import stationsData from "./stations_complete.json";
import { useStation, generateMockStationData } from "@/contexts/station-context";

// --- SVG Icons (เพื่อใช้ใน HTML String) ---
const ICONS = {
  droplets: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
  shieldAlert: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
  waves: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`,
  cloudRain: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  tag: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.432 0l6.568-6.568a2.426 2.426 0 0 0 0-3.432l-8.704-8.704z"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>`,
  cpu: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>`,
};

// Define types
interface BasemapConfig {
  name: string;
  style: string;
  icon: string;
}
type BasemapStyleKey = "hybrid" | "topo";
interface Station {
  id: string;
  no: number;
  name: string;
  location: { latitude: number; longitude: number; area: string };
  sensors: Array<{
    type: string;
    name: string;
    range: string;
    unit: string;
    frequency: string;
  }>;
}
interface StationsData {
  project: string;
  projectName: string;
  stationTypes: Array<{ type: string; name: string; stations: Station[] }>;
}

const MapComponentAnalytics: FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [currentStyle, setCurrentStyle] = useState<BasemapStyleKey>("topo");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isSwitcherOpen, setSwitcherOpen] = useState<boolean>(false);
  // Use station context
  const { setSelectedStationData } = useStation();

  const API_KEY: string = "yYduxrRP3C81U2fRFNIU";

  const basemaps: Record<BasemapStyleKey, BasemapConfig> = {
    hybrid: {
      name: "Hybrid",
      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${API_KEY}`,
      icon: "🌍",
    },
    topo: {
      name: "Topographic",
      style: `https://api.maptiler.com/maps/topo-v2/style.json?key=${API_KEY}`,
      icon: "🏔️",
    },
  };

  // Station type configurations
  const stationTypeConfig = {
    WP: { color: "#3B82F6", label: "ท่อระบายน้ำ", icon: ICONS.droplets },
    WR: { color: "#EF4444", label: "ระดับน้ำบนถนน", icon: ICONS.shieldAlert },
    PW: { color: "#10B981", label: "บึง/หนองน้ำ", icon: ICONS.waves },
    RF: { color: "#8B5CF6", label: "ปริมาณฝน", icon: ICONS.cloudRain },
  };

  // ฟังก์ชันสร้าง custom marker element
  const createMarkerElement = (stationId: string): HTMLDivElement => {
    const el = document.createElement("div");
    el.className = "custom-marker-wrapper";

    const prefix = stationId.substring(0, 2) as keyof typeof stationTypeConfig;
    const config = stationTypeConfig[prefix] || {
      color: "#6B7280",
      icon: ICONS.mapPin,
    };

    el.innerHTML = `
      <div class="custom-marker" style="background: ${config.color}; border: 3px solid white;">
        ${config.icon}
      </div>
    `;
    return el;
  };

  // ฟังก์ชันสร้าง popup content
  const createPopupContent = (station: Station): string => {
    const prefix = station.id.substring(0, 2) as keyof typeof stationTypeConfig;
    const typeInfo = stationTypeConfig[prefix] || {
      label: "อื่นๆ",
      color: "#6B7280",
      icon: ICONS.tag,
    };

    // Mock data based on station type
    let mockValue: string;
    let mockUnit: string;
    let mockLabel: string;
    
    switch (prefix) {
      case "RF": // ปริมาณฝน
        mockValue = (Math.random() * 50).toFixed(1);
        mockUnit = "มม.";
        mockLabel = "ปริมาณฝนสะสม";
        break;
      case "WP": // ท่อระบายน้ำ
        mockValue = (Math.random() * 2 + 0.5).toFixed(2);
        mockUnit = "ม.";
        mockLabel = "ระดับน้ำในท่อ";
        break;
      case "WR": // ระดับน้ำบนถนน
        mockValue = (Math.random() * 0.8).toFixed(2);
        mockUnit = "ม.";
        mockLabel = "ระดับน้ำท่วมถนน";
        break;
      case "PW": // บึง/หนองน้ำ
        mockValue = (Math.random() * 5 + 1).toFixed(2);
        mockUnit = "ม.";
        mockLabel = "ระดับน้ำในบึง";
        break;
      default:
        mockValue = "N/A";
        mockUnit = "";
        mockLabel = "ข้อมูล";
    }
    
    const mockDate = "4 ธ.ค. 2568 14:30";

    return `
      <div class="modern-popup">
        <div class="popup-close-btn" onclick="this.closest('.maplibregl-popup').remove()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
        
        <div class="popup-location-header" style="background: linear-gradient(135deg, ${typeInfo.color}15 0%, ${typeInfo.color}05 100%);">
          <div class="station-type-badge" style="background: ${typeInfo.color};">
            ${typeInfo.icon}
            <span>${typeInfo.label}</span>
          </div>
          <h3 class="location-name">${station.name}</h3>
          <div class="location-area">${station.location.area}</div>
        </div>
        
        <div class="popup-content-body">
          <div class="data-label">${mockLabel}</div>
          
          <div class="data-value-box">
            <span class="data-number">${mockValue}</span>
            <span class="data-unit">${mockUnit}</span>
          </div>
          
          <div class="data-timestamp">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>อัพเดท: ${mockDate}</span>
          </div>
          
          <div class="detail-link">
            <span>ดูรายละเอียดเพิ่มเติม</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      </div>
    `;
  };

  const addStationMarkers = () => {
    if (!map.current) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const data = stationsData as StationsData;
    data.stationTypes.forEach((stationType) => {
      stationType.stations.forEach((station) => {
        // แสดงเฉพาะสถานีบึง/หนองน้ำ (PW)
        const prefix = station.id.substring(0, 2);
        if (prefix !== "") return;

        const el = createMarkerElement(station.id);
        const popup = new Popup({ offset: 35, closeButton: false }).setHTML(
          createPopupContent(station)
        );

        const marker = new Marker({ element: el })
          .setLngLat([station.location.longitude, station.location.latitude])
          .setPopup(popup);

        if (map.current) {
          marker.addTo(map.current);
          markersRef.current.push(marker);
        }

        el.addEventListener("click", () => {
          // Generate mock data and pass to sidebar
          const mockData = generateMockStationData(station);
          setSelectedStationData(mockData);
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

    map.current.on("load", () => {
      setIsLoaded(true);
      if (!map.current) return;
      addStationMarkers();
    });

    map.current.on("mousedown", () => {
      if (isSwitcherOpen) setSwitcherOpen(false);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
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
    <div className="relative w-full h-full bg-gray-900 font-sans rounded-xl">
      <div ref={mapContainer} className="w-full h-full rounded-lg"/>

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-800 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-white text-lg mt-4 font-semibold">
              กำลังโหลดแผนที่...
            </p>
          </div>
        </div>
      )}

      {/* Basemap Switcher */}
      <div className="absolute top-4 right-4 z-40">
        <div className="relative">
          <button
            onClick={() => setSwitcherOpen(!isSwitcherOpen)}
            disabled={!isLoaded}
            className={`
              flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg 
              hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 
              focus:ring-blue-500 focus:ring-opacity-50
              ${!isLoaded ? "opacity-50 cursor-not-allowed" : ""}
            `}
            aria-label="Select Basemap"
          >
            <Layers className="h-6 w-6 text-gray-700" />
          </button>

          {isSwitcherOpen && isLoaded && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 p-3">
              <div className="flex items-center space-x-2 mb-3 px-1">
                <MapIcon className="h-5 w-5 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-800">
                  เลือกรูปแบบแผนที่
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(
                  Object.entries(basemaps) as [BasemapStyleKey, BasemapConfig][]
                ).map(([key, basemap]) => (
                  <button
                    key={key}
                    onClick={() => switchBasemap(key)}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 
                      text-xs font-medium h-20
                      ${
                        currentStyle === key
                          ? "bg-blue-500 text-white shadow-md ring-2 ring-blue-300"
                          : "bg-gray-50/50 hover:bg-blue-100/80 text-gray-700 hover:shadow-sm"
                      }
                    `}
                  >
                    <span className="text-2xl mb-1">{basemap.icon}</span>
                    <span className="text-center leading-tight">
                      {basemap.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-40 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs border border-gray-200">
        {/* Station Type Legend */}
        {/* <div className="mb-3">
          <h3 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1">
            <Waves className="h-3.5 w-3.5" />
            สถานีตรวจวัดบึง/หนองน้ำ
          </h3>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm border border-white"
              style={{ backgroundColor: "#10B981" }}
              dangerouslySetInnerHTML={{ __html: ICONS.waves }}
            />
            <span className="text-xs text-gray-700 font-medium">
              บึง/หนองน้ำ
            </span>
          </div>
        </div> */}

        {/* Water Level Legend */}
        <div className="border-t border-gray-200 pt-3">
          <h3 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1">
            <Droplets className="h-3.5 w-3.5" />
            ระดับน้ำในบึง (ม.)
          </h3>
          
          <div className="flex gap-0.5 mb-1.5 rounded overflow-hidden shadow-sm">
            {[
              { range: "0-1", display: "0-1", color: "#BFDBFE" },
              { range: "1-2", display: ">1-2", color: "#86EFAC" },
              { range: "2-3", display: ">2-3", color: "#BEF264" },
              { range: "3-4", display: ">3-4", color: "#FDE047" },
              { range: "4-5", display: ">4-5", color: "#FB923C" },
              { range: "5-6", display: ">5-6", color: "#F87171" },
              { range: ">6", display: ">6", color: "#DC2626" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex-1 h-7 flex items-center justify-center"
                style={{ backgroundColor: item.color }}
                title={item.range + " ม."}
              >
                <span className="text-[8px] font-bold text-gray-800 leading-tight text-center">
                  {item.display}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[9px] text-gray-600 px-0.5 mt-1">
            <span>ต่ำ</span>
            <span>ปานกลาง</span>
            <span>สูง</span>
            <span>สูงมาก</span>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        /* Modern Popup Styles */
        .modern-popup {
          font-family: system-ui, -apple-system, sans-serif;
          width: 260px;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          position: relative;
        }
        
        .popup-close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 10;
        }
        
        .popup-close-btn:hover {
          background: rgba(0, 0, 0, 0.7);
          transform: scale(1.05);
        }
        
        .popup-close-btn svg {
          color: #fff;
        }
        
        .popup-location-header {
          padding: 16px 14px 12px;
          border-bottom: 1px solid #E5E7EB;
        }
        
        .station-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          color: white;
          font-size: 10px;
          font-weight: 600;
          margin-bottom: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .station-type-badge svg {
          width: 12px;
          height: 12px;
        }
        
        .location-name {
          font-size: 15px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px 0;
          line-height: 1.3;
        }
        
        .location-area {
          font-size: 11px;
          color: #6B7280;
          font-weight: 500;
        }
        
        .popup-content-body {
          padding: 14px;
          background: #F9FAFB;
        }
        
        .data-label {
          font-size: 10px;
          color: #6B7280;
          margin-bottom: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .data-value-box {
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 10px;
        }
        
        .data-number {
          font-size: 32px;
          font-weight: 800;
          color: #1F2937;
          line-height: 1;
        }
        
        .data-unit {
          font-size: 14px;
          font-weight: 600;
          color: #6B7280;
        }
        
        .data-timestamp {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          color: #9CA3AF;
          margin-bottom: 12px;
        }
        
        .data-timestamp svg {
          color: #9CA3AF;
        }
        
        .detail-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .detail-link:hover {
          background: #3B82F6;
          border-color: #3B82F6;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        
        .detail-link span {
          font-size: 11px;
          font-weight: 600;
          color: #3B82F6;
          transition: color 0.2s;
        }
        
        .detail-link:hover span {
          color: white;
        }
        
        .detail-link svg {
          color: #3B82F6;
          transition: color 0.2s;
        }
        
        .detail-link:hover svg {
          color: white;
        }

        .custom-marker-wrapper {
          cursor: pointer;
        }
        .custom-marker {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15),
            0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        .custom-marker-wrapper:hover .custom-marker {
          transform: scale(1.2);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2),
            0 4px 6px rgba(0, 0, 0, 0.15);
        }

        .maplibregl-popup-content {
          padding: 0;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          background: transparent;
        }
        .maplibregl-popup-tip {
          display: none;
        }
        
        .maplibregl-popup-close-button {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default MapComponentAnalytics;