"use client";

import React, { useEffect, useRef, useState, FC, useMemo } from "react";
import { Layers } from "lucide-react";
import maplibregl, { Map, Marker, Popup, ScaleControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { useStation, generateMockStationData } from "@/contexts/station-context";

// ─────────────────────────────────────────────
// Static station coordinates
// ─────────────────────────────────────────────
const staticStations = [
  { no: 1,  lat: 16.466, long: 102.831, id: "SNK_HOSP", name: "โรงพยาบาลศรีนครินทร์" },
  { no: 2,  lat: 16.429, long: 102.829, id: "KKC_MUN",  name: "เทศบาลนครขอนแก่น" },
  { no: 3,  lat: 16.419, long: 102.836, id: "BKN",      name: "บึงแก่นนคร" },
  { no: 4,  lat: 16.452, long: 102.855, id: "BTS",      name: "บึงทุ่งสร้าง" },
  { no: 5,  lat: 16.43,  long: 102.877, id: "NLP",      name: "หนองเลิงเปือย" },
  { no: 6,  lat: 16.429, long: 102.805, id: "BNK",      name: "บึงหนองโคตร" },
  { no: 7,  lat: 16.473, long: 102.849, id: "SIL_MUN",  name: "เทศบาลเมืองศิลา" },
  { no: 8,  lat: 16.463, long: 102.786, id: "UNE_MC",   name: "ศูนย์อุตุนิยมวิทยาภาคตะวันออกเฉียงเหนือตอนบน" },
  { no: 9,  lat: 16.402, long: 102.788, id: "MKO_MUN",  name: "เทศบาลเมืองเก่า" },
  { no: 10, lat: 16.422, long: 102.814, id: "NEU",      name: "มหาวิทยาลัยภาคตะวันออกเฉียงเหนือ" },
  { no: 11, lat: 16.446, long: 102.832, id: "UNE_SH",   name: "บ้านพักพนักงานอุตุฯ" },
  { no: 12, lat: 16.456, long: 102.819, id: "KKC_SP",   name: "อุทยานวิทยาศาสตร์ มหาวิทยาลัยขอนแก่น" },
  { no: 13, lat: 16.436, long: 102.785, id: "BSV",      name: "หมู่บ้านสีวลี" },
  { no: 14, lat: 16.434, long: 102.861, id: "RMUTI",    name: "มหาวิทยาลัยราชมงคลอีสาน วิทยาเขตขอนแก่น" },
  { no: 15, lat: 16.442, long: 102.808, id: "KKC_BL",   name: "โรงเรียนสอนคนตาบอด" },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const getRainColor = (value: number) => {
  if (value > 90) return "#7F1D1D";
  if (value > 70) return "#DC2626";
  if (value > 50) return "#F87171";
  if (value > 35) return "#FB923C";
  if (value > 20) return "#FDE047";
  if (value > 10) return "#BEF264";
  if (value >  0) return "#86EFAC";
  return "#BFDBFE";
};

const CLOUD_RAIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`;

// ─────────────────────────────────────────────
// Types & Mock data generator
// ค่า = 0 ทั้งหมด, 28 จุด: ย้อนหลัง 24 ชม. + ปัจจุบัน + forecast 3 ชม.
// ─────────────────────────────────────────────
interface HourlyPoint {
  label: string;
  value: number | null;
  forecastValue: number | null;
  isCurrent: boolean;
  isForecast: boolean;
}

function generateMockHourly(): HourlyPoint[] {
  const now = new Date();
  const points: HourlyPoint[] = [];

  // ย้อนหลัง 24 ชม.
  for (let i = 24; i >= 1; i--) {
    const t = new Date(now.getTime() - i * 3_600_000);
    const label = `${t.getDate()}-${t.toLocaleString("en", { month: "short" })} ${t.getHours().toString().padStart(2, "0")}:00`;
    points.push({ label, value: 0, forecastValue: null, isCurrent: false, isForecast: false });
  }

  // ปัจจุบัน — จุดเชื่อมต่อ มีทั้ง value และ forecastValue
  {
    const t = new Date(now);
    const label = `${t.getDate()}-${t.toLocaleString("en", { month: "short" })} ${t.getHours().toString().padStart(2, "0")}:00`;
    points.push({ label, value: 0, forecastValue: 0, isCurrent: true, isForecast: false });
  }

  // Forecast 3 ชม.
  for (let i = 1; i <= 3; i++) {
    const t = new Date(now.getTime() + i * 3_600_000);
    const label = `${t.getDate()}-${t.toLocaleString("en", { month: "short" })} ${t.getHours().toString().padStart(2, "0")}:00`;
    points.push({ label, value: null, forecastValue: 0, isCurrent: false, isForecast: true });
  }

  return points; // รวม 28 จุด
}

// ─────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const isForecast = payload[0]?.payload?.isForecast;
  const displayValue =
    payload.find((p: any) => p.dataKey === "forecastValue" && p.value != null)?.value ??
    payload.find((p: any) => p.dataKey === "value" && p.value != null)?.value ?? 0;
  return (
    <div className="rounded-lg border border-blue-100 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700">
        {label}
        {isForecast && (
          <span className="ml-1.5 rounded-full bg-purple-100 px-1.5 py-0.5 text-purple-600 font-medium">พยากรณ์</span>
        )}
      </p>
      <p className="mt-0.5 font-bold" style={{ color: isForecast ? "#a855f7" : "#3b82f6" }}>
        {displayValue} มม.
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────
// Chart Modal
// ─────────────────────────────────────────────
interface ChartModalProps {
  station: typeof staticStations[0];
  rainValue: number;
  lastUpdate: string;
  onClose: () => void;
}

const ChartModal: FC<ChartModalProps> = ({ station, rainValue, lastUpdate, onClose }) => {
  const data = useMemo(() => generateMockHourly(), [station.id]);

  const currentLabel      = data.find((d) => d.isCurrent)?.label ?? "";
  const firstForecastLabel = data.find((d) => d.isForecast)?.label ?? "";
  const tickLabels        = data.filter((_, i) => i % 3 === 0).map((d) => d.label);

  const formatTime = (raw: string) => {
    try {
      const d = new Date(raw);
      return isNaN(d.getTime()) ? raw : d.toLocaleString("th-TH", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false,
      }).replace(",", "");
    } catch { return raw; }
  };

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
            <h2 className="text-base font-bold text-gray-800">กราฟฝน — {station.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">ID: {station.id}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-0.5 flex-shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sub-header */}
        <div className="flex flex-wrap gap-3 px-5 py-2.5 bg-blue-50/60 text-xs text-gray-500 border-b border-blue-100">
          <span>อัปเดตล่าสุด: {formatTime(lastUpdate)}</span>
          <span className="ml-auto font-semibold text-blue-700">
            ฝนสะสม 1 ชม.: {rainValue.toFixed(1)} มม.
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 pt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
            ข้อมูลย้อนหลัง 24 ชม.
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-purple-500" />
            พยากรณ์ล่วงหน้า 3 ชม.
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5" style={{ borderTop: "2px dashed #f87171", height: 0 }} />
            ปัจจุบัน
          </span>
        </div>

        {/* Chart */}
        <div className="px-4 pt-2 pb-5">
          <p className="text-[11px] font-medium text-gray-400 mb-2 uppercase tracking-wide">
            ปริมาณน้ำฝนรายชั่วโมง (มม.) — ย้อนหลัง 24 ชม. + พยากรณ์ 3 ชม.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 8, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

              <XAxis
                dataKey="label"
                ticks={tickLabels}
                tick={{ fontSize: 9, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                unit=" มม."
              />

              <Tooltip content={<CustomTooltip />} />

              {/* เส้นแดงประ = ปัจจุบัน */}
              <ReferenceLine
                x={currentLabel}
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                label={{ value: "ปัจจุบัน", position: "top", fontSize: 10, fill: "#ef4444", fontWeight: 600 }}
              />

              {/* เส้นม่วงประ = เริ่ม forecast */}
              <ReferenceLine
                x={firstForecastLabel}
                stroke="#a855f7"
                strokeWidth={1}
                strokeDasharray="3 3"
              />

              {/* กราฟเส้น historical (สีฟ้า) */}
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gradBlue)"
                dot={{ r: 3, fill: "#3b82f6", stroke: "white", strokeWidth: 1 }}
                activeDot={{ r: 5, fill: "#3b82f6", stroke: "white", strokeWidth: 1.5 }}
                connectNulls={false}
              />

              {/* กราฟเส้น forecast (สีม่วงประ) */}
              <Area
                type="monotone"
                dataKey="forecastValue"
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="5 3"
                fill="url(#gradPurple)"
                dot={{ r: 3, fill: "#a855f7", stroke: "white", strokeWidth: 1 }}
                activeDot={{ r: 5, fill: "#a855f7", stroke: "white", strokeWidth: 1.5 }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 pb-4">
          <button onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-200 transition-colors font-medium">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Basemap types
// ─────────────────────────────────────────────
interface BasemapConfig { name: string; style: string; icon: string; }
type BasemapStyleKey = "hybrid" | "topo";

// ─────────────────────────────────────────────
// Main MapComponent
// ─────────────────────────────────────────────
const MapComponent: FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map          = useRef<Map | null>(null);
  const markersRef   = useRef<Marker[]>([]);

  const [currentStyle, setCurrentStyle]   = useState<BasemapStyleKey>("topo");
  const [isLoaded, setIsLoaded]           = useState(false);
  const [isSwitcherOpen, setSwitcherOpen] = useState(false);
  const [rainData, setRainData]           = useState<Record<string, number>>({});
  const [lastUpdate, setLastUpdate]       = useState("-");

  const [chartStation, setChartStation] = useState<typeof staticStations[0] | null>(null);

  const { setSelectedStationData } = useStation();
  const API_KEY = "yYduxrRP3C81U2fRFNIU";

  const basemaps: Record<BasemapStyleKey, BasemapConfig> = {
    hybrid: { name: "Hybrid",      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${API_KEY}`,  icon: "🌍" },
    topo:   { name: "Topographic", style: `https://api.maptiler.com/maps/topo-v2/style.json?key=${API_KEY}`, icon: "🏔️" },
  };

  const fetchRainData = async () => {
    try {
      const res    = await fetch("http://10.198.110.39:3000/api/rain_1hr_2km?limit=1");
      const result = await res.json();
      if (result.status === "success" && result.data?.length > 0) {
        const latest = result.data[0];
        setLastUpdate(latest.datetime);
        const cleaned: Record<string, number> = {};
        Object.entries(latest.stations).forEach(([k, v]) => { cleaned[k.trim()] = Number(v); });
        setRainData(cleaned);
      }
    } catch (e) { console.error("Rain fetch error:", e); }
  };

  useEffect(() => { fetchRainData(); }, []);

  const createMarkerElement = (value: number): HTMLDivElement => {
    const el = document.createElement("div");
    el.className = "custom-marker-wrapper";
    const color  = getRainColor(value);
    el.innerHTML = `<div class="custom-marker" style="background:${color};border:3px solid white;">${CLOUD_RAIN_SVG}</div>`;
    return el;
  };

  const createPopupContent = (
    station: typeof staticStations[0],
    value: number,
    time: string,
  ): string => {
    const color = getRainColor(value);
    return `
      <div class="modern-popup">
        <div class="popup-close-btn" onclick="this.closest('.maplibregl-popup').remove()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <div class="popup-location-header" style="background:linear-gradient(135deg,${color}30 0%,${color}10 100%);">
          <div class="station-type-badge" style="background:${color};">
            ${CLOUD_RAIN_SVG}<span>สถานีวัดฝน</span>
          </div>
          <h3 class="location-name">${station.name}</h3>
          <div class="location-area">ID: ${station.id}</div>
        </div>
        <div class="popup-content-body">
          <div class="data-label">ปริมาณฝนสะสม 1 ชม. (ล่าสุด)</div>
          <div class="data-value-box">
            <span class="data-number" style="color:${value > 0 ? "#1F2937" : "#9CA3AF"}">${value.toFixed(1)}</span>
            <span class="data-unit">มม.</span>
          </div>
          <div class="popup-footer-row">
            <div class="data-timestamp">อัพเดท: ${time}</div>
            <button class="chart-btn" data-station-id="${station.id}" title="ดูกราฟรายชั่วโมง">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  };

  const addStationMarkers = () => {
    if (!map.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    staticStations.forEach((station) => {
      const rainValue = rainData[station.id] ?? 0;
      const el        = createMarkerElement(rainValue);
      const popup     = new Popup({ offset: 35, closeButton: false }).setHTML(
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
        const mockData = generateMockStationData({
          id: station.id, name: station.name, no: station.no,
          location: { latitude: station.lat, longitude: station.long, area: "Khon Kaen" },
          sensors: [],
        });
        setSelectedStationData(mockData);
      });

      popup.on("open", () => {
        setTimeout(() => {
          const btn = document.querySelector<HTMLButtonElement>(
            `.chart-btn[data-station-id="${station.id}"]`
          );
          if (btn) {
            btn.addEventListener("click", (e) => {
              e.stopPropagation();
              setChartStation(station);
            });
          }
        }, 50);
      });
    });
  };

  useEffect(() => { if (isLoaded && map.current) addStationMarkers(); }, [isLoaded, rainData]);

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
    map.current.on("load", () => setIsLoaded(true));
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

  const formatTime = (raw: string) => {
    try {
      const d = new Date(raw);
      return isNaN(d.getTime()) ? raw : d.toLocaleString("th-TH", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false,
      }).replace(",", "");
    } catch { return raw; }
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
          <button
            onClick={() => setSwitcherOpen(!isSwitcherOpen)}
            disabled={!isLoaded}
            className={`flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isLoaded ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Layers className="h-6 w-6 text-gray-700" />
          </button>
          {isSwitcherOpen && isLoaded && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 p-3">
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(basemaps) as [BasemapStyleKey, BasemapConfig][]).map(([key, bm]) => (
                  <button key={key} onClick={() => switchBasemap(key)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg text-xs font-medium h-20 transition-all ${
                      currentStyle === key ? "bg-blue-500 text-white ring-2 ring-blue-300" : "bg-gray-50 hover:bg-blue-100 text-gray-700"
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

      {/* ── Legend ── */}
      <div className="flex-shrink-0 bg-white border-t border-gray-300 px-3 pt-1.5 pb-2">
        <div className="flex justify-end mb-1">
          <span className="text-[10px] text-gray-500">
            เวลาข้อมูลล่าสุด:{" "}
            <span className="font-semibold text-blue-700">
              {lastUpdate === "-" ? "-" : formatTime(lastUpdate)}
            </span>
          </span>
        </div>
        <div className="flex w-full rounded-sm overflow-hidden border border-gray-300">
          {[
            { range: ">0-10",  color: "#81d4fa" },
            { range: ">10-20", color: "#d0f8ce" },
            { range: ">20-35", color: "#7cb342" },
            { range: ">35-50", color: "#fdd835" },
            { range: ">50-70", color: "#f57f17" },
            { range: ">70-90", color: "#8d6e63" },
            { range: ">90",    color: "#bf360c" },
          ].map((seg, i) => (
            <div key={i} className="flex-1 flex items-center justify-center py-2" style={{ backgroundColor: seg.color }}>
              <span className="text-[9px] font-bold text-gray-800 whitespace-nowrap">{seg.range}</span>
            </div>
          ))}
        </div>
        <div className="flex w-full mt-0.5">
          <div className="flex-[2] text-center text-[10px] font-semibold text-gray-700 border-r border-gray-300">เล็กน้อย</div>
          <div className="flex-[2] text-center text-[10px] font-semibold text-gray-700 border-r border-gray-300">ปานกลาง</div>
          <div className="flex-[2] text-center text-[10px] font-semibold text-gray-700 border-r border-gray-300">หนัก</div>
          <div className="flex-[1] text-center text-[10px] font-semibold text-gray-700">หนักมาก</div>
        </div>
      </div>

      {/* ── Chart Modal ── */}
      {chartStation && (
        <ChartModal
          station={chartStation}
          rainValue={rainData[chartStation.id] ?? 0}
          lastUpdate={lastUpdate}
          onClose={() => setChartStation(null)}
        />
      )}

      {/* ── Global styles ── */}
      <style jsx global>{`
        .modern-popup {
          font-family: system-ui, -apple-system, sans-serif;
          width: 270px; background: white;
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12); position: relative;
        }
        .popup-close-btn {
          position: absolute; top: 10px; right: 10px;
          width: 24px; height: 24px; border-radius: 50%;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 10;
        }
        .popup-close-btn svg { color: #fff; }
        .popup-location-header { padding: 16px 14px 12px; border-bottom: 1px solid #E5E7EB; }
        .station-type-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 8px; border-radius: 6px;
          color: white; font-size: 10px; font-weight: 600; margin-bottom: 8px;
        }
        .station-type-badge svg { width: 12px; height: 12px; }
        .location-name { font-size: 15px; font-weight: 700; color: #111827; margin: 0 0 4px; line-height: 1.3; }
        .location-area { font-size: 11px; color: #6B7280; font-weight: 500; }
        .popup-content-body { padding: 14px; background: #F9FAFB; }
        .data-label { font-size: 10px; color: #6B7280; margin-bottom: 8px; font-weight: 600; }
        .data-value-box {
          background: white; border: 2px solid #E5E7EB; border-radius: 10px;
          padding: 12px; display: flex; align-items: baseline; gap: 6px; margin-bottom: 10px;
        }
        .data-number { font-size: 32px; font-weight: 800; line-height: 1; }
        .data-unit { font-size: 14px; font-weight: 600; color: #6B7280; }
        .popup-footer-row { display: flex; align-items: center; justify-content: space-between; }
        .data-timestamp { font-size: 10px; color: #9CA3AF; }
        .chart-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 50%;
          background: #EFF6FF; border: 1.5px solid #BFDBFE;
          color: #3B82F6; cursor: pointer;
          transition: background 0.15s, transform 0.15s;
        }
        .chart-btn:hover { background: #DBEAFE; transform: scale(1.1); }
        .chart-btn:active { transform: scale(0.95); }
        .custom-marker-wrapper { cursor: pointer; }
        .custom-marker {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; justify-content: center; align-items: center; color: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }
        .custom-marker-wrapper:hover .custom-marker { transform: scale(1.2); }
        .maplibregl-popup-content { padding: 0; border-radius: 12px; background: transparent; box-shadow: none; }
        .maplibregl-popup-tip { display: none; }
        .maplibregl-popup-close-button { display: none; }
      `}</style>
    </div>
  );
};

export default MapComponent;