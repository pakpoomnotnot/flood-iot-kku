"use client";

import React, { useEffect, useRef, useState, FC } from "react";
import { Layers } from "lucide-react";
import maplibregl, { Map, Marker, Popup, ScaleControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useStation,
  generateMockStationData,
} from "@/contexts/station-context";
import {
  RAIN_STATIONS,
  RAIN_STATION_DISPLAY_ORDER,
} from "@/lib/rain-stations";
import {
  getRainSeverity,
  getRainLegendSegments,
  windowLabel as rainWindowLabel,
  rainUnitLabel,
  type RainSeverityWindow,
} from "@/lib/rain-severity";

const staticStations = RAIN_STATION_DISPLAY_ORDER.map((id, index) => ({
  no: index + 1,
  lat: RAIN_STATIONS[id].lat,
  long: RAIN_STATIONS[id].lon,
  id,
  name: RAIN_STATIONS[id].name,
}));

// เกณฑ์ความรุนแรงฝน — ต่างกันระหว่างรายชั่วโมง/3ชม. กับรายวัน ดู src/lib/rain-severity.ts
const getRainStatus = (value: number, window: RainSeverityWindow): string =>
  getRainSeverity(value, window).label;

const getRainColor = (value: number, window: RainSeverityWindow): string =>
  getRainSeverity(value, window).color;

const CLOUD_RAIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type RainWindow = RainSeverityWindow;

interface RainSeriesPoint {
  label: string;
  time: string;
  value: number;
}

interface RainWindowResponse {
  value: number;
  time: string | null;
  series: RainSeriesPoint[];
  error?: string;
}

// ─────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.payload?.value;
  return (
    <div className="rounded-lg border border-blue-100 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700">{label}</p>
      <p className="mt-0.5 font-bold text-blue-600">{val} มม.</p>
    </div>
  );
};

// ─────────────────────────────────────────────
// Chart Modal — ใช้ API/ตรรกะเดียวกับกราฟฝนในตาราง (dashbaord-table.tsx)
// เพื่อให้กราฟในแผนที่กับกราฟในตารางแสดงข้อมูลตรงกันเสมอ
// ─────────────────────────────────────────────
const RAIN_SOURCE_TABS: { key: "actual" | "forecast"; label: string }[] = [
  { key: "actual", label: "ข้อมูลจริง (MQTT)" },
  { key: "forecast", label: "พยากรณ์" },
];

const RAIN_WINDOW_TABS: { key: RainWindow; label: string }[] = [
  { key: "1h", label: "1 ชม." },
  { key: "3h", label: "3 ชม." },
  { key: "24h", label: "24 ชม." },
];

interface ChartModalProps {
  station: (typeof staticStations)[0];
  rainValue: number;
  lastUpdate: string;
  onClose: () => void;
}

const ChartModal: FC<ChartModalProps> = ({
  station,
  rainValue,
  lastUpdate,
  onClose,
}) => {
  const [windowParam, setWindowParam] = useState<RainWindow>("1h");
  const canForecast = windowParam !== "24h";
  const [activeTab, setActiveTab] = useState<"actual" | "forecast">("actual");
  const [result, setResult] = useState<RainWindowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canForecast) setActiveTab("actual");
  }, [canForecast]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = activeTab === "forecast" ? "/api/rain/forecast" : "/api/rain/actual";
        const res = await fetch(
          `${endpoint}?station_code=${station.id}&window=${windowParam}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: RainWindowResponse = await res.json();
        if (json.error) throw new Error(json.error);
        setResult(json);
      } catch (e: any) {
        if (controller.signal.aborted) return;
        setError(e.message ?? "โหลดข้อมูลไม่สำเร็จ");
        setResult(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [station.id, activeTab, windowParam]);

  const formatTime = (timestamp: string) =>
    new Date(timestamp.replace(" ", "T")).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const series = result?.series ?? [];
  const tickEvery = Math.max(1, Math.ceil(series.length / 6));
  const tickLabels = series.filter((_, i) => i % tickEvery === 0).map((d) => d.label);
  const currentValue = result?.value ?? rainValue;
  const currentTimeLabel = result?.time ? formatTime(result.time) : formatTime(lastUpdate);
  const status = getRainStatus(currentValue, windowParam);
  const statusColor = getRainColor(currentValue, windowParam);
  const barColor = activeTab === "forecast" ? "#a855f7" : "#3b82f6";

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
            <h2 className="text-base font-bold text-gray-800">
              กราฟฝนสะสม — {station.name}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">ID: {station.id}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-0.5 flex-shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs: ข้อมูลจริง (MQTT) / พยากรณ์ */}
        <div className="flex w-full border-b border-gray-100">
          {RAIN_SOURCE_TABS.map((tab) => {
            const disabled = tab.key === "forecast" && !canForecast;
            return (
              <button
                key={tab.key}
                disabled={disabled}
                onClick={() => setActiveTab(tab.key)}
                title={disabled ? "ยังไม่รองรับพยากรณ์ 24 ชม." : undefined}
                className={`flex-1 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "text-blue-600 border-blue-600"
                    : disabled
                      ? "text-gray-300 border-transparent cursor-not-allowed"
                      : "text-gray-400 border-transparent hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tabs: ช่วงเวลา */}
        <div className="flex w-full border-b border-gray-100 bg-gray-50/50">
          {RAIN_WINDOW_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setWindowParam(tab.key)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                windowParam === tab.key ? "text-blue-600 font-semibold" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sub-header */}
        <div className="flex flex-wrap gap-3 px-5 py-2.5 bg-blue-50/60 text-xs text-gray-500 border-b border-blue-100">
          <span>อัปเดตล่าสุด: {currentTimeLabel}</span>
          <span
            className="ml-auto inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: statusColor }}
          >
            {status} — {currentValue.toFixed(1)} มม.
          </span>
        </div>

        {/* Chart */}
        <div className="px-4 pt-4 pb-5">
          <p className="text-[11px] font-medium text-gray-400 mb-2 uppercase tracking-wide">
            {activeTab === "forecast" ? "พยากรณ์ปริมาณฝน" : "ปริมาณฝนจริงจาก MQTT"} — มม. (
            {RAIN_WINDOW_TABS.find((t) => t.key === windowParam)?.label}/ช่อง)
          </p>
          {loading ? (
            <div className="flex h-[220px] items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
                <svg
                  className="h-6 w-6 animate-spin text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                กำลังโหลดข้อมูล...
              </div>
            </div>
          ) : error ? (
            <div className="flex h-[220px] items-center justify-center">
              <div className="flex flex-col items-center gap-1 text-sm text-red-400">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
                {error}
              </div>
            </div>
          ) : series.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">
              ไม่มีข้อมูลสถานีนี้
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart
                data={series}
                margin={{ top: 8, right: 10, left: -10, bottom: 5 }}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  strokeWidth={1.5}
                  vertical={false}
                />
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
                <Bar
                  dataKey="value"
                  name={activeTab === "forecast" ? "พยากรณ์" : "ข้อมูลจริง"}
                  fill={barColor}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={40}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex justify-end px-5 pb-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-200 transition-colors font-medium"
          >
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
interface BasemapConfig {
  name: string;
  style: string;
  icon: string;
}
type BasemapStyleKey = "hybrid" | "topo";

// ─────────────────────────────────────────────
// Main MapComponent
// ─────────────────────────────────────────────
interface MapComponentProps {
  /** ช่วงเวลาที่ใช้แสดงผลปริมาณฝน (มาจาก tab เดียวกับตารางฝน) — คุมทั้งค่า marker และเกณฑ์ legend */
  rainfallWindow?: RainWindow;
}

const MapComponent: FC<MapComponentProps> = ({ rainfallWindow = "1h" }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);

  const [currentStyle, setCurrentStyle] = useState<BasemapStyleKey>("topo");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSwitcherOpen, setSwitcherOpen] = useState(false);
  const [rainData, setRainData] = useState<Record<string, number>>({});
  const [lastUpdate, setLastUpdate] = useState("-");
  const [chartStation, setChartStation] = useState<
    (typeof staticStations)[0] | null
  >(null);

  const { setSelectedStationData } = useStation();
  const API_KEY = "yYduxrRP3C81U2fRFNIU";

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

  const fetchRainData = async () => {
    try {
      const res = await fetch(`/api/rain/actual?window=${rainfallWindow}`);
      const result: {
        stations?: { station_code: string; value: number; time: string | null }[];
      } = await res.json();
      if (result.stations && result.stations.length > 0) {
        const cleaned: Record<string, number> = {};
        let latestTime: string | null = null;
        result.stations.forEach((s) => {
          cleaned[s.station_code] = s.value;
          if (s.time && (!latestTime || s.time > latestTime)) latestTime = s.time;
        });
        if (latestTime) setLastUpdate(latestTime);
        setRainData(cleaned);
      }
    } catch (e) {
      console.error("Rain fetch error:", e);
    }
  };

  useEffect(() => {
    fetchRainData();
  }, [rainfallWindow]);

  const createMarkerElement = (value: number): HTMLDivElement => {
    const el = document.createElement("div");
    el.className = "custom-marker-wrapper";
    const color = getRainColor(value, rainfallWindow);
    el.innerHTML = `<div class="custom-marker" style="background:${color};border:3px solid white;">${CLOUD_RAIN_SVG}</div>`;
    return el;
  };

  const createPopupContent = (
    station: (typeof staticStations)[0],
    value: number,
    time: string,
  ): string => {
    const color = getRainColor(value, rainfallWindow);
    const status = getRainStatus(value, rainfallWindow);
    const timeStr =
      time === "-"
        ? "-"
        : (() => {
            try {
              return new Date(time).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              });
            } catch {
              return time;
            }
          })();

    return `
      <div class="modern-popup">
        <div class="popup-close-btn" onclick="this.closest('.maplibregl-popup').remove()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <div class="popup-location-header" style="background:linear-gradient(135deg,${color}30 0%,${color}10 100%);">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
            <div class="station-type-badge" style="background:${color};">
              ${CLOUD_RAIN_SVG}<span>สถานีวัดฝน</span>
            </div>
            <span class="rain-status-badge" style="background:${color}20;color:${color};border:1px solid ${color}40;">
              ${status}
            </span>
          </div>
          <h3 class="location-name">${station.name}</h3>
          <div class="location-area">ID: ${station.id}</div>
        </div>
        <div class="popup-content-body">
          <div class="data-label">ปริมาณน้ำฝนสะสม ${rainWindowLabel(rainfallWindow)} (ล่าสุด)</div>
          <div class="data-value-box" style="border-color:${color}40;">
            <span class="data-number" style="color:${value > 0 ? color : "#9CA3AF"}">${value.toFixed(1)}</span>
            <span class="data-unit">${rainUnitLabel(rainfallWindow)}</span>
          </div>
          <div class="popup-footer-row">
            <div class="data-timestamp">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>${timeStr}</span>
            </div>
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
      const el = createMarkerElement(rainValue);
      const popup = new Popup({ offset: 35, closeButton: false }).setHTML(
        createPopupContent(station, rainValue, lastUpdate),
      );

      const marker = new Marker({ element: el })
        .setLngLat([station.long, station.lat])
        .setPopup(popup);

      if (map.current) {
        marker.addTo(map.current);
        markersRef.current.push(marker);
      }

      el.addEventListener("click", () => {
        setSelectedStationData(
          generateMockStationData({
            id: station.id,
            name: station.name,
            no: station.no,
            location: {
              latitude: station.lat,
              longitude: station.long,
              area: "Khon Kaen",
            },
            sensors: [],
          }),
        );
      });

      popup.on("open", () => {
        setTimeout(() => {
          const btn = document.querySelector<HTMLButtonElement>(
            `.chart-btn[data-station-id="${station.id}"]`,
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

  useEffect(() => {
    if (isLoaded && map.current) addStationMarkers();
  }, [isLoaded, rainData, rainfallWindow]);

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
    map.current.on("mousedown", () => {
      if (isSwitcherOpen) setSwitcherOpen(false);
    });
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
      return isNaN(d.getTime())
        ? raw
        : d
            .toLocaleString("th-TH", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
            .replace(",", "");
    } catch {
      return raw;
    }
  };

  // เกณฑ์ legend สลับตามช่วงเวลา — รายชั่วโมง/3ชม. ใช้เกณฑ์เดิม, รายวัน (24ชม.) ใช้เกณฑ์กรมอุตุฯ
  const legendSegments = getRainLegendSegments(rainfallWindow);

  return (
    <div className="relative w-full h-full bg-gray-900 font-sans rounded-xl overflow-hidden flex flex-col">
      {/* ── Map ── */}
      <div className="relative flex-1 min-h-0">
        <div ref={mapContainer} className="w-full h-full" />

        {!isLoaded && (
          <div className="absolute inset-0 bg-slate-800/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto" />
              <p className="text-white text-lg mt-4 font-semibold">
                กำลังโหลดแผนที่...
              </p>
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
                {(
                  Object.entries(basemaps) as [BasemapStyleKey, BasemapConfig][]
                ).map(([key, bm]) => (
                  <button
                    key={key}
                    onClick={() => switchBasemap(key)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg text-xs font-medium h-20 transition-all ${
                      currentStyle === key
                        ? "bg-blue-500 text-white ring-2 ring-blue-300"
                        : "bg-gray-50 hover:bg-blue-100 text-gray-700"
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
            ปริมาณน้ำฝนสะสม {rainWindowLabel(rainfallWindow)} ({rainUnitLabel(rainfallWindow)}) — อัปเดต:{" "}
            <span className="font-semibold text-blue-700">
              {lastUpdate === "-" ? "-" : formatTime(lastUpdate)}
            </span>
          </span>
        </div>

        {/* สีแถบ */}
        <div className="flex w-full rounded-sm overflow-hidden border border-gray-300">
          {legendSegments.map((seg, i) => (
            <div
              key={i}
              className="flex-1 flex items-center justify-center py-2"
              style={{ backgroundColor: seg.color }}
            >
              <span
                className="text-[9px] font-bold whitespace-nowrap"
                style={{ color: seg.textColor }}
              >
                {seg.rangeLabel}
              </span>
            </div>
          ))}
        </div>

        {/* label */}
        <div className="flex w-full mt-0.5">
          {legendSegments.map((seg, i) => (
            <div
              key={i}
              className={`flex-1 text-center text-[10px] font-semibold text-gray-700 ${
                i < legendSegments.length - 1 ? "border-r border-gray-300" : ""
              }`}
            >
              {seg.legendLabel}
            </div>
          ))}
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
          font-family:
            system-ui,
            -apple-system,
            sans-serif;
          width: 270px;
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
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
        }
        .popup-close-btn svg {
          color: #fff;
        }
        .popup-location-header {
          padding: 16px 14px 12px;
          border-bottom: 1px solid #e5e7eb;
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
        }
        .station-type-badge svg {
          width: 12px;
          height: 12px;
        }
        .rain-status-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
        }
        .location-name {
          font-size: 15px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px;
          line-height: 1.3;
        }
        .location-area {
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
        }
        .popup-content-body {
          padding: 14px;
          background: #f9fafb;
        }
        .data-label {
          font-size: 10px;
          color: #6b7280;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .data-value-box {
          background: white;
          border: 2px solid #e5e7eb;
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
          line-height: 1;
        }
        .data-unit {
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
        }
        .popup-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .data-timestamp {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          color: #9ca3af;
        }
        .data-timestamp svg {
          color: #9ca3af;
        }
        .chart-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #eff6ff;
          border: 1.5px solid #bfdbfe;
          color: #3b82f6;
          cursor: pointer;
          transition:
            background 0.15s,
            transform 0.15s;
        }
        .chart-btn:hover {
          background: #dbeafe;
          transform: scale(1.1);
        }
        .chart-btn:active {
          transform: scale(0.95);
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
          box-shadow:
            0 4px 6px rgba(0, 0, 0, 0.15),
            0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
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

export default MapComponent;
