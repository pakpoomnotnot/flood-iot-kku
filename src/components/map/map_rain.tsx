"use client";

import React, { useEffect, useRef, useState, FC } from "react";
import {
  Map as MapIcon,
  Layers,
  Droplets,
  CloudRain,
  ShieldAlert,
  Waves,
  MapPin,
} from "lucide-react";
import maplibregl, { Map, Marker, Popup, ScaleControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useStation, generateMockStationData } from "@/contexts/station-context";

// --- 1. ข้อมูลพิกัดคงที่ (Static Coordinates) ---
// เราต้องใช้พิกัดเหล่านี้เพราะ API ส่งมาแค่ ID กับ ค่าฝน ไม่ได้ส่ง Lat/Long มาด้วย
const staticStations = [
  { no: 1, lat: 16.466, long: 102.831, id: "SNK_HOSP", name: "โรงพยาบาลศรีนครินทร์" },
  { no: 2, lat: 16.429, long: 102.829, id: "KKC_MUN", name: "เทศบาลนครขอนแก่น" },
  { no: 3, lat: 16.419, long: 102.836, id: "BKN", name: "บึงแก่นนคร" },
  { no: 4, lat: 16.452, long: 102.855, id: "BTS", name: "บึงทุ่งสร้าง" },
  { no: 5, lat: 16.43, long: 102.877, id: "NLP", name: "หนองเลิงเปือย" },
  { no: 6, lat: 16.429, long: 102.805, id: "BNK", name: "บึงหนองโคตร" },
  { no: 7, lat: 16.473, long: 102.849, id: "SIL_MUN", name: "เทศบาลเมืองศิลา" },
  { no: 8, lat: 16.463, long: 102.786, id: "UNE_MC", name: "ศูนย์อุตุนิยมวิทยาภาคตะวันออกเฉียงเหนือตอนบน" },
  { no: 9, lat: 16.402, long: 102.788, id: "MKO_MUN", name: "เทศบาลเมืองเก่า" },
  { no: 10, lat: 16.422, long: 102.814, id: "NEU", name: "มหาวิทยาลัยภาคตะวันออกเฉียงเหนือ" },
  { no: 11, lat: 16.446, long: 102.832, id: "UNE_SH", name: "บ้านพักพนักงานอุตุฯ" },
  { no: 12, lat: 16.456, long: 102.819, id: "KKC_SP", name: "อุทยานวิทยาศาสตร์ มหาวิทยาลัยขอนแก่น" },
  { no: 13, lat: 16.436, long: 102.785, id: "BSV", name: "หมู่บ้านสีวลี" },
  { no: 14, lat: 16.434, long: 102.861, id: "RMUTI", name: "มหาวิทยาลัยราชมงคลอีสาน วิทยาเขตขอนแก่น" },
  { no: 15, lat: 16.442, long: 102.808, id: "KKC_BL", name: "โรงเรียนสอนคนตาบอด" },
];

// --- 2. Helper สำหรับเลือกสีตามปริมาณฝน ---
const getRainColor = (value: number) => {
  if (value > 90) return "#DC2626"; // แดงเข้ม
  if (value > 70) return "#F87171"; // แดงอ่อน
  if (value > 50) return "#FB923C"; // ส้ม
  if (value > 35) return "#FDE047"; // เหลือง
  if (value > 20) return "#BEF264"; // เขียวอ่อนเหลือง
  if (value > 10) return "#86EFAC"; // เขียว
  return "#BFDBFE"; // ฟ้า (0-10) หรือค่า Default
};

// --- SVG Icons ---
const ICONS = {
  droplets: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
  shieldAlert: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
  waves: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`,
  cloudRain: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
};

interface BasemapConfig {
  name: string;
  style: string;
  icon: string;
}
type BasemapStyleKey = "hybrid" | "topo";

const MapComponent: FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [currentStyle, setCurrentStyle] = useState<BasemapStyleKey>("topo");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isSwitcherOpen, setSwitcherOpen] = useState<boolean>(false);
  
  // State สำหรับเก็บข้อมูลจาก API
  const [rainData, setRainData] = useState<Record<string, number>>({});
  const [lastUpdate, setLastUpdate] = useState<string>("-");

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

  // --- 3. ฟังก์ชันดึงข้อมูล API ---
  const fetchRainData = async () => {
    try {
      // ในการใช้งานจริง ถ้าติด CORS อาจต้องตั้งค่า Proxy ใน next.config.js หรือ Backend
      const response = await fetch("http://localhost:3000/api/rain_1hr_2km?limit=1");
      const result = await response.json();

      if (result.status === "success" && result.data && result.data.length > 0) {
        const latestData = result.data[0];
        setLastUpdate(latestData.datetime);

        // Clean keys: บางที API ส่ง \r ติดมากับ key เช่น "KKC_BL\r"
        const cleanedStations: Record<string, number> = {};
        Object.entries(latestData.stations).forEach(([key, value]) => {
          const cleanKey = key.trim(); // ลบ \r หรือ space
          cleanedStations[cleanKey] = Number(value);
        });

        setRainData(cleanedStations);
      }
    } catch (error) {
      console.error("Error fetching rain data:", error);
    }
  };

  // เรียก Fetch เมื่อ Component Mount
  useEffect(() => {
    fetchRainData();
    // ถ้าต้องการให้ Auto refresh ทุก 5 นาที ให้ Uncomment บรรทัดล่าง
    // const interval = setInterval(fetchRainData, 300000);
    // return () => clearInterval(interval);
  }, []);


  // Create Custom Marker Element (Dynamic Color)
  const createMarkerElement = (value: number): HTMLDivElement => {
    const el = document.createElement("div");
    el.className = "custom-marker-wrapper";
    
    // เลือกสีตามค่าฝน
    const color = getRainColor(value);

    el.innerHTML = `
      <div class="custom-marker" style="background: ${color}; border: 3px solid white;">
        ${ICONS.cloudRain}
      </div>
    `;
    return el;
  };

  // Create Popup Content (Real Data)
  const createPopupContent = (station: typeof staticStations[0], value: number, time: string): string => {
    const color = getRainColor(value);
    
    return `
      <div class="modern-popup">
        <div class="popup-close-btn" onclick="this.closest('.maplibregl-popup').remove()">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </div>
        
        <div class="popup-location-header" style="background: linear-gradient(135deg, ${color}30 0%, ${color}10 100%);">
          <div class="station-type-badge" style="background: ${color};">
            ${ICONS.cloudRain}
            <span>สถานีวัดฝน</span>
          </div>
          <h3 class="location-name">${station.name}</h3>
          <div class="location-area">ID: ${station.id}</div>
        </div>
        
        <div class="popup-content-body">
          <div class="data-label">ปริมาณฝน (ล่าสุด)</div>
          <div class="data-value-box">
            <span class="data-number" style="color:${value > 0 ? '#1F2937' : '#9CA3AF'}">${value.toFixed(1)}</span>
            <span class="data-unit">มม.</span>
          </div>
          <div class="data-timestamp">
             <span>อัพเดท: ${time}</span>
          </div>
        </div>
      </div>
    `;
  };

  // Add Markers to Map
  const addStationMarkers = () => {
    if (!map.current) return;
    
    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    staticStations.forEach((station) => {
      // ดึงค่าฝนจาก State ที่เรา Fetch มา
      // ถ้าไม่มีข้อมูลให้เป็น 0
      const rainValue = rainData[station.id] ?? 0;

      const el = createMarkerElement(rainValue);
      const popup = new Popup({ offset: 35, closeButton: false }).setHTML(
        createPopupContent(station, rainValue, lastUpdate)
      );

      const marker = new Marker({ element: el })
        .setLngLat([station.long, station.lat])
        .setPopup(popup);

      if (map.current) {
        marker.addTo(map.current);
        markersRef.current.push(marker);
      }

      el.addEventListener("click", () => {
        // Mock data context (หรือจะส่งค่าจริงไปก็ได้ถ้า Context รองรับ)
        const mockData = generateMockStationData({
            id: station.id,
            name: station.name,
            no: station.no,
            location: { latitude: station.lat, longitude: station.long, area: "Khon Kaen" },
            sensors: []
        });
        setSelectedStationData(mockData);
      });
    });
  };

  // Re-render markers when rainData changes or map loads
  useEffect(() => {
    if (isLoaded && map.current) {
      addStationMarkers();
    }
  }, [isLoaded, rainData]); // Dependency: ทำงานเมื่อ rainData เปลี่ยน

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

      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-800 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-white text-lg mt-4 font-semibold">กำลังโหลดแผนที่...</p>
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
          >
            <Layers className="h-6 w-6 text-gray-700" />
          </button>

          {isSwitcherOpen && isLoaded && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 p-3">
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(basemaps) as [BasemapStyleKey, BasemapConfig][]).map(([key, basemap]) => (
                  <button
                    key={key}
                    onClick={() => switchBasemap(key)}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 
                      text-xs font-medium h-20
                      ${currentStyle === key ? "bg-blue-500 text-white shadow-md ring-2 ring-blue-300" : "bg-gray-50/50 hover:bg-blue-100/80 text-gray-700 hover:shadow-sm"}
                    `}
                  >
                    <span className="text-2xl mb-1">{basemap.icon}</span>
                    <span className="text-center leading-tight">{basemap.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-40 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs border border-gray-200">
        <div className="border-t border-gray-200 pt-0">
          <h3 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1">
            <Droplets className="h-3.5 w-3.5" />
            ระดับปริมาณฝน (มม.)
          </h3>
          <div className="flex gap-0.5 mb-1.5 rounded overflow-hidden shadow-sm">
            {[
              { range: "0-10", display: "0-10", color: "#BFDBFE" },
              { range: "10-20", display: ">10-20", color: "#86EFAC" },
              { range: "20-35", display: ">20-35", color: "#BEF264" },
              { range: "35-50", display: ">35-50", color: "#FDE047" },
              { range: "50-70", display: ">50-70", color: "#FB923C" },
              { range: "70-90", display: ">70-90", color: "#F87171" },
              { range: ">90", display: ">90", color: "#DC2626" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex-1 h-7 flex items-center justify-center"
                style={{ backgroundColor: item.color }}
                title={item.range + " มม."}
              >
                <span className="text-[8px] font-bold text-gray-800 leading-tight text-center">
                  {item.display}
                </span>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-gray-500 text-right mt-1">
            เวลาข้อมูลล่าสุด: <span className="font-semibold text-blue-600">{lastUpdate}</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
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
          z-index: 10;
        }
        .popup-close-btn svg { color: #fff; }
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
        }
        .station-type-badge svg { width: 12px; height: 12px; }
        .location-name {
          font-size: 15px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px 0;
          line-height: 1.3;
        }
        .location-area { font-size: 11px; color: #6B7280; font-weight: 500; }
        .popup-content-body { padding: 14px; background: #F9FAFB; }
        .data-label { font-size: 10px; color: #6B7280; margin-bottom: 8px; font-weight: 600; }
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
        .data-number { font-size: 32px; font-weight: 800; line-height: 1; }
        .data-unit { font-size: 14px; font-weight: 600; color: #6B7280; }
        .data-timestamp { display: flex; align-items: center; gap: 5px; font-size: 10px; color: #9CA3AF; }
        .custom-marker-wrapper { cursor: pointer; }
        .custom-marker {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        .custom-marker-wrapper:hover .custom-marker {
          transform: scale(1.2);
        }
        .maplibregl-popup-content {
          padding: 0;
          border-radius: 12px;
          background: transparent;
          box-shadow: none;
        }
        .maplibregl-popup-tip { display: none; }
        .maplibregl-popup-close-button { display: none; }
      `}</style>
    </div>
  );
};

export default MapComponent;