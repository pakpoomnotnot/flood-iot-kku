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
  NavigationControl,
  GeolocateControl,
  ScaleControl,
  FullscreenControl,
  MapMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import stationsData from "./stations_complete.json";
import { useStation, generateMockStationData } from "@/contexts/station-context";

// --- SVG Icons (เพื่อใช้ใน HTML String) ---
const ICONS = {
  droplets: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.48-2.26-1.3-3.05C8.9 8.4 8 7.3 8 6.25c0-1.1.9-2 2-2s2 .9 2 2c0 1.05-.9 2.15-1.7 2.95-.82.8-1.3 1.9-1.3 3.05 0 2.22 1.8 4.05 4 4.05s4-1.83 4-4.05c0-1.16-.48-2.26-1.3-3.05C16.9 8.4 16 7.3 16 6.25c0-1.1.9-2 2-2s2 .9 2 2"/></svg>`,
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
interface MapProps {
  sidebarWidth: number;
  isWidth: any;
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

const MapLibreComponent: FC<MapProps> = ({ sidebarWidth, isWidth}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [currentStyle, setCurrentStyle] = useState<BasemapStyleKey>("topo");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isSwitcherOpen, setSwitcherOpen] = useState<boolean>(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isResizing = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
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

  // ฟังก์ชันสร้าง custom marker element
  const createMarkerElement = (stationId: string): HTMLDivElement => {
    const el = document.createElement("div");
    el.className = "custom-marker-wrapper";

    const prefix = stationId.substring(0, 2);
    let config = { color: "gray", icon: ICONS.mapPin };

    switch (prefix) {
      case "WP":
        config = { color: "blue", icon: ICONS.droplets };
        break;
      case "WR":
        config = { color: "red", icon: ICONS.shieldAlert };
        break;
      case "PW":
        config = { color: "green", icon: ICONS.waves };
        break;
      case "RF":
        config = { color: "purple", icon: ICONS.cloudRain };
        break;
    }

    el.innerHTML = `
      <div class="custom-marker marker-color-${config.color}">
        ${config.icon}
      </div>
    `;
    return el;
  };

  // ฟังก์ชันสร้าง popup content
  const createPopupContent = (station: Station): string => {
    const prefix = station.id.substring(0, 2);
    let typeInfo = { label: "อื่นๆ", color: "gray", icon: ICONS.tag };

    switch (prefix) {
      case "WP":
        typeInfo = {
          label: "ท่อระบายน้ำ",
          color: "blue",
          icon: ICONS.droplets,
        };
        break;
      case "WR":
        typeInfo = {
          label: "ระดับน้ำบนถนน",
          color: "red",
          icon: ICONS.shieldAlert,
        };
        break;
      case "PW":
        typeInfo = { label: "บึง/หนองน้ำ", color: "green", icon: ICONS.waves };
        break;
      case "RF":
        typeInfo = {
          label: "ปริมาณฝน",
          color: "purple",
          icon: ICONS.cloudRain,
        };
        break;
    }

    const sensorsHtml = station.sensors
      .map(
        (sensor) => `
      <li class="sensor-item">${sensor.name}</li>
    `
      )
      .join("");

    return `
      <div class="professional-popup">
        <div class="popup-header color-${typeInfo.color}">
          <h3 class="font-bold text-base">${station.name}</h3>
          <p class="text-xs opacity-80">${station.location.area}</p>
        </div>
        
        <div class="popup-body">
          <div class="info-row">
            <div class="info-icon">${ICONS.tag}</div>
            <div class="info-text">
              <span class="label">ประเภท</span>
              <span class="value font-semibold color-text-${typeInfo.color}">${
      typeInfo.label
    }</span>
            </div>
            <span class="info-badge">${station.id}</span>
          </div>
          
          <div class="info-row">
            <div class="info-icon">${ICONS.mapPin}</div>
            <div class="info-text">
              <span class="label">พิกัด</span>
              <span class="value font-mono text-xs">${station.location.latitude.toFixed(
                6
              )}, ${station.location.longitude.toFixed(6)}</span>
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-row-header">
              <div class="info-icon">${ICONS.cpu}</div>
              <span class="label">เซนเซอร์ที่ติดตั้ง</span>
            </div>
            <ul class="sensor-list">${sensorsHtml}</ul>
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
          setSelectedStation(station);
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
      center: [102.82, 16.44], // Khon Kaen
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (map.current) {
      const handle = requestAnimationFrame(() => {
        map.current?.resize();
      });
      return () => cancelAnimationFrame(handle);
    }
  }, [sidebarWidth]);

  const switchBasemap = (styleKey: BasemapStyleKey) => {
    if (!map.current || !isLoaded) return;

    setCurrentStyle(styleKey);
    map.current.setStyle(basemaps[styleKey].style);

    map.current.once("style.load", () => addStationMarkers());
    setSwitcherOpen(false);
  };

  const flyToStation = (station: Station) => {
    if (!map.current) return;

    map.current.flyTo({
      center: [station.location.longitude, station.location.latitude],
      zoom: 16,
      duration: 2000,
      essential: true,
    });

    const marker = markersRef.current.find((m) => {
      const lngLat = m.getLngLat();
      return (
        lngLat.lat === station.location.latitude &&
        lngLat.lng === station.location.longitude
      );
    });

    if (marker && !marker.getPopup().isOpen()) {
      marker.togglePopup();
    }
  };

  // นับจำนวนสถานีแต่ละประเภท
  const getStationCounts = () => {
    const data = stationsData as StationsData;
    const counts = {
      waterLevelPipe: 0,
      waterLevelRoad: 0,
      pondWaterLevel: 0,
      rainfallMeasurement: 0,
      total: 0,
    };

    data.stationTypes.forEach((type) => {
      const count = type.stations.length;
      counts.total += count;

      if (type.type === "waterLevelPipe") counts.waterLevelPipe = count;
      else if (type.type === "waterLevelRoad") counts.waterLevelRoad = count;
      else if (type.type === "pondWaterLevel") counts.pondWaterLevel = count;
      else if (type.type === "rainfallMeasurement")
        counts.rainfallMeasurement = count;
    });

    return counts;
  };

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // < md
      setIsTablet(width >= 768 && width < 1024); // md to lg

      // ปรับ sidebar width ตามขนาดหน้าจอ
      if (width < 768) {
        // Mobile: ซ่อน sidebar by default
        isWidth(0);
        setIsCollapsed(true);
      } else if (width >= 768 && width < 1024) {
        // Tablet: ขนาดเล็กลง
        isWidth(320);
        setIsCollapsed(false);
      } else {
        // Desktop: ขนาดปกติ
        if (sidebarWidth === 0) {
          isWidth(384);
          setIsCollapsed(false);
        }
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const stationCounts = getStationCounts();

  return (
    <div className="relative w-full h-screen bg-gray-900 font-sans">
      <div ref={mapContainer} className="w-full h-full" />

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

      {/* {!isMobile &&  ( */}
        <div className="absolute top-4 right-4 z-40">
          <div className="relative">
            {/* Floating Action Button */}
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

            {/* Basemap Options Panel */}
            <div
              className={`
              absolute right-0 top-full mt-2 w-64 origin-top-right transition-all duration-300 ease-in-out
              ${
                isSwitcherOpen && isLoaded
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }
            `}
            >
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 p-3">
                <div className="flex items-center space-x-2 mb-3 px-1">
                  <MapIcon className="h-5 w-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-800">
                    เลือกรูปแบบแผนที่
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(
                    Object.entries(basemaps) as [
                      BasemapStyleKey,
                      BasemapConfig
                    ][]
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
            </div>
          </div>
        </div>
      {/* )} */}

      {/* Selected Station Info Panel */}
      {selectedStation && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md z-40">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-base text-blue-900">
                  {selectedStation.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedStation.location.area}
                </p>
              </div>
              <button
                onClick={() => setSelectedStation(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">รหัสสถานี:</span>
                <span className="font-semibold">{selectedStation.id}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">พิกัด:</span>
                <span className="font-mono text-xs">
                  {selectedStation.location.latitude.toFixed(6)},{" "}
                  {selectedStation.location.longitude.toFixed(6)}
                </span>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  เซนเซอร์:
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedStation.sensors.map((sensor, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium"
                    >
                      {sensor.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => flyToStation(selectedStation)}
              className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center shadow-sm hover:shadow-md"
            >
              <Navigation className="w-4 h-4 mr-2" />
              บินไปที่สถานี
            </button>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        /* Professional Popup Styles */
        .professional-popup {
          font-family: system-ui, -apple-system, sans-serif;
          min-width: 280px;
          border-radius: 12px;
          overflow: hidden;
          background-color: #fff;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .popup-header {
          padding: 14px 16px;
          color: white;
        }
        .popup-body {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .info-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .info-row-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .info-icon {
          color: #6b7280;
          flex-shrink: 0;
        }
        .info-text {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .info-text .label {
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        .info-text .value {
          font-size: 14px;
          color: #1f2937;
          margin-top: 2px;
        }
        .info-badge {
          font-size: 11px;
          font-weight: 600;
          background-color: #f3f4f6;
          color: #374151;
          padding: 4px 10px;
          border-radius: 9999px;
        }
        .info-section {
          border-top: 1px solid #e5e7eb;
          padding-top: 12px;
        }
        .sensor-list {
          list-style: none;
          padding-left: 28px;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sensor-item {
          font-size: 13px;
          color: #374151;
          position: relative;
        }
        .sensor-item::before {
          content: "•";
          color: #3b82f6;
          position: absolute;
          left: -16px;
          font-weight: bold;
        }

        /* Color Themes */
        .color-blue {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }
        .color-text-blue {
          color: #2563eb;
        }
        .color-red {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
        .color-text-red {
          color: #dc2626;
        }
        .color-green {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        .color-text-green {
          color: #059669;
        }
        .color-purple {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }
        .color-text-purple {
          color: #7c3aed;
        }

        /* Custom Marker Styles */
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
          border: 3px solid white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15),
            0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        .custom-marker-wrapper:hover .custom-marker {
          transform: scale(1.2);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2),
            0 4px 6px rgba(0, 0, 0, 0.15);
        }
        .marker-color-blue {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }
        .marker-color-red {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
        .marker-color-green {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        .marker-color-purple {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }
        .marker-color-gray {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        }

        /* MapLibre Popup Overrides */
        .maplibregl-popup-content {
          padding: 0;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .maplibregl-popup-tip {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default MapLibreComponent;
