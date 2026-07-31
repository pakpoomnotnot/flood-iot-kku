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
import {
  useStation,
  generateMockStationData,
  getStationTypeFromStation
} from "@/contexts/station-context";
import { PredictionModal } from "./prediction-modal";
import { getRainSeverity } from "@/lib/rain-severity";

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

const MapLibreComponent: FC<MapProps> = ({ sidebarWidth, isWidth}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const rainDataRef = useRef<Record<string, number>>({});
  const [currentStyle, setCurrentStyle] = useState<BasemapStyleKey>("topo");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isSwitcherOpen, setSwitcherOpen] = useState<boolean>(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isResizing = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [selectedStationForPrediction, setSelectedStationForPrediction] = useState<Station | null>(null);
  
  // Use station context
  const { setSelectedStationData, getStationTypeConfig, getStationCounts, getAllStations } = useStation();

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

  // Map icon name to React component
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      droplets: ICONS.droplets,
      shieldAlert: ICONS.shieldAlert,
      waves: ICONS.waves,
      cloudRain: ICONS.cloudRain,
      tag: ICONS.tag
    };
    return iconMap[iconName] || ICONS.tag;
  };

  // ฟังก์ชันสร้าง custom marker element — เทาทั้งหมด ยกเว้นสถานีวัดฝนที่มีฝนตกอยู่ตอนนี้
  // (ใช้สีเดียวกับเกณฑ์ severity ของฝนใน rain-severity.ts ให้ตรงกับแท็บปริมาณน้ำฝน)
  const createMarkerElement = (station: Station): HTMLDivElement => {
    const el = document.createElement("div");
    el.className = "custom-marker-wrapper";

    const stationType = getStationTypeFromStation(station);
    const config = getStationTypeConfig(stationType);

    const rainValue = stationType === "rainfallMeasurement" ? rainDataRef.current[station.id] : undefined;
    const isRaining = rainValue != null && rainValue > 0;
    const markerStyle = isRaining
      ? `style="background: ${getRainSeverity(rainValue!, "1h").color};"`
      : "";

    el.innerHTML = `
      <div class="custom-marker ${isRaining ? "" : "marker-color-gray"}" ${markerStyle}>
        ${getIconComponent(config.icon)}
      </div>
    `;
    return el;
  };

  // ฟังก์ชันสร้าง minimal popup
  const createCompactPopupContent = (station: Station): string => {
    const stationType = getStationTypeFromStation(station);
    const typeInfo = getStationTypeConfig(stationType);
    return `
      <div class="mini-popup">
        <span class="mini-name">${station.name}</span>
        <span class="mini-badge">${typeInfo.label}</span>
      </div>
    `;
  };

  const addStationMarkers = () => {
    if (!map.current) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const stations = getAllStations();

    stations.forEach((station) => {
      const el = createMarkerElement(station);

      const popup = new Popup({
        offset: 40,
        closeButton: false,
        closeOnClick: true,
        className: "mini-popup-wrapper",
      }).setHTML(createCompactPopupContent(station));

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
        // Show prediction modal
        setSelectedStationForPrediction(station);
        setShowPredictionModal(true);
      });
    });
  };

  // ดึงปริมาณฝนล่าสุด (1 ชม.) มาอัปเดตสี marker สถานีวัดฝนบน minimap ให้ตรงกับสถานการณ์จริง
  useEffect(() => {
    const loadRainData = async () => {
      try {
        const res = await fetch("/api/rain/actual?window=1h");
        const json = await res.json();
        const byStation: Record<string, number> = {};
        (json.stations ?? []).forEach((s: { station_code: string; value: number }) => {
          byStation[s.station_code] = s.value;
        });
        rainDataRef.current = byStation;
        if (isLoaded) addStationMarkers();
      } catch (error) {
        console.error("Error loading rain data for minimap:", error);
      }
    };
    loadRainData();
    const interval = setInterval(loadRainData, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

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
  };

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);

      if (width < 768) {
        isWidth(0);
        setIsCollapsed(true);
      } else if (width >= 768 && width < 1024) {
        isWidth(320);
        setIsCollapsed(false);
      } else {
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

      {/* Prediction Modal */}
      <PredictionModal
        station={selectedStationForPrediction}
        isOpen={showPredictionModal}
        onClose={() => {
          setShowPredictionModal(false);
          setSelectedStationForPrediction(null);
        }}
      />

      {/* Custom Styles */}
      <style jsx global>{`
        .custom-marker-wrapper { cursor: pointer; }
        .custom-marker {
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex; justify-content: center; align-items: center;
          color: white;
          border: 3px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.15);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .custom-marker-wrapper:hover .custom-marker {
          transform: scale(1.2);
          box-shadow: 0 8px 15px rgba(0,0,0,0.2);
        }
        .marker-color-gray {
          background: linear-gradient(135deg, #6b7280, #4b5563);
        }

        /* Minimal popup */
        .mini-popup-wrapper .maplibregl-popup-content {
          padding: 6px 10px;
          border-radius: 6px;
          background: rgba(15, 23, 42, 0.88);
          backdrop-filter: blur(4px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .mini-popup-wrapper .maplibregl-popup-tip { display: none; }
        .mini-name {
          font-size: 12px;
          font-weight: 500;
          color: #f1f5f9;
          font-family: system-ui, sans-serif;
        }
        .mini-badge {
          font-size: 10px;
          font-weight: 600;
          color: #94a3b8;
          font-family: system-ui, sans-serif;
          padding: 1px 5px;
          background: rgba(255,255,255,0.1);
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
};

export default MapLibreComponent;