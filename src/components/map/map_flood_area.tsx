"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState, FC } from "react";
import {
  Map as MapIcon,
  Layers,
  Eye,
  EyeOff,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import maplibregl, { Map, ScaleControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FloodMapDayGroup, FloodMapFrame } from "@/lib/flood-map-catalog";
import {
  geotiffToImageOverlay,
  type FloodImageOverlay,
} from "@/lib/flood-geotiff-render";

const FLOOD_SOURCE_ID = "flood-image-source";
const FLOOD_LAYER_ID = "flood-image-layer";

interface BasemapConfig {
  name: string;
  style: string;
  icon: string;
}
type BasemapStyleKey = "hybrid" | "topo";

const LEGEND_SEGMENTS = [
  { range: "0-0.11", color: "#81d4fa" },
  { range: ">0.11-0.23", color: "#d0f8ce" },
  { range: ">0.23-0.34", color: "#7cb342" },
  { range: ">0.34-0.46", color: "#fdd835" },
  { range: ">0.46-0.57", color: "#f57f17" },
  { range: ">0.57-0.69", color: "#8d6e63" },
  { range: ">0.69", color: "#bf360c" },
];

const LEVEL_LABELS = [
  { label: "ปลอดภัย", span: 1 },
  { label: "ระวัง", span: 2 },
  { label: "อันตราย", span: 1 },
  { label: "วิกฤต", span: 1 },
];

const MapComponentFlood: FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);
  const overlayCache = useRef<globalThis.Map<string, FloodImageOverlay>>(
    new globalThis.Map(),
  );
  const hasFitBounds = useRef(false);

  const [currentStyle, setCurrentStyle] = useState<BasemapStyleKey>("topo");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSwitcherOpen, setSwitcherOpen] = useState(false);
  const [showFloodLayer, setShowFloodLayer] = useState(true);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [dayGroups, setDayGroups] = useState<FloodMapDayGroup[]>([]);
  const [flatIndex, setFlatIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [framesLoading, setFramesLoading] = useState(true);
  const [frameRendering, setFrameRendering] = useState(false);

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

  const totalFrames = useMemo(
    () => dayGroups.reduce((sum, g) => sum + g.frames.length, 0),
    [dayGroups],
  );

  const flatToIndices = useCallback(
    (flat: number) => {
      let remaining = flat;
      for (let d = 0; d < dayGroups.length; d++) {
        const len = dayGroups[d].frames.length;
        if (remaining < len) return { dayIndex: d, hourIndex: remaining };
        remaining -= len;
      }
      const lastDay = Math.max(0, dayGroups.length - 1);
      const lastHour = Math.max(0, (dayGroups[lastDay]?.frames.length ?? 1) - 1);
      return { dayIndex: lastDay, hourIndex: lastHour };
    },
    [dayGroups],
  );

  const indicesToFlat = useCallback(
    (dayIndex: number, hourIndex: number) => {
      let flat = 0;
      for (let i = 0; i < dayIndex; i++) flat += dayGroups[i]?.frames.length ?? 0;
      return flat + hourIndex;
    },
    [dayGroups],
  );

  const { dayIndex, hourIndex } = flatToIndices(flatIndex);
  const currentDay = dayGroups[dayIndex] ?? null;
  const currentFrame: FloodMapFrame | null = currentDay?.frames[hourIndex] ?? null;

  const removeFloodLayer = useCallback(() => {
    if (!map.current) return;
    if (map.current.getLayer(FLOOD_LAYER_ID)) map.current.removeLayer(FLOOD_LAYER_ID);
    if (map.current.getSource(FLOOD_SOURCE_ID)) map.current.removeSource(FLOOD_SOURCE_ID);
  }, []);

  const loadOverlay = useCallback(async (frame: FloodMapFrame): Promise<FloodImageOverlay> => {
    const cached = overlayCache.current.get(frame.proxyPath);
    if (cached) return cached;

    const res = await fetch(
      `/api/flood-maps/cog?path=${encodeURIComponent(frame.proxyPath)}`,
    );
    if (!res.ok) {
      throw new Error(`โหลดไฟล์ไม่สำเร็จ (${res.status})`);
    }

    const overlay = await geotiffToImageOverlay(await res.arrayBuffer());
    overlayCache.current.set(frame.proxyPath, overlay);
    return overlay;
  }, []);

  const showFloodFrame = useCallback(
    async (frame: FloodMapFrame) => {
      if (!map.current || !isLoaded) return;

      setFrameRendering(true);
      setLoadError(null);

      try {
        const overlay = await loadOverlay(frame);
        removeFloodLayer();

        map.current.addSource(FLOOD_SOURCE_ID, {
          type: "image",
          url: overlay.dataUrl,
          coordinates: overlay.coordinates,
        });

        map.current.addLayer({
          id: FLOOD_LAYER_ID,
          type: "raster",
          source: FLOOD_SOURCE_ID,
          paint: { "raster-opacity": 0.85, "raster-fade-duration": 0 },
        });

        if (!showFloodLayer) {
          map.current.setLayoutProperty(FLOOD_LAYER_ID, "visibility", "none");
        }

        if (!hasFitBounds.current) {
          const { west, south, east, north } = overlay.bounds;
          map.current.fitBounds(
            [
              [west, south],
              [east, north],
            ],
            { padding: 48, duration: 800 },
          );
          hasFitBounds.current = true;
        }
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "แสดงผลแผนที่ไม่สำเร็จ");
      } finally {
        setFrameRendering(false);
      }
    },
    [isLoaded, loadOverlay, removeFloodLayer, showFloodLayer],
  );

  useEffect(() => {
    const loadFrames = async () => {
      setFramesLoading(true);
      setLoadError(null);
      try {
        const res = await fetch("/api/flood-maps/timeseries?days=7");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
        const groups: FloodMapDayGroup[] = json.dayGroups ?? [];
        setDayGroups(groups);
        const total = groups.reduce((sum, g) => sum + g.frames.length, 0);
        setFlatIndex(Math.max(0, total - 1));
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setFramesLoading(false);
      }
    };

    loadFrames();
  }, []);

  useEffect(() => {
    if (!currentFrame || !isLoaded) return;
    showFloodFrame(currentFrame);
  }, [currentFrame, isLoaded, showFloodFrame]);

  useEffect(() => {
    if (!isPlaying || totalFrames <= 1) return;
    const timer = setInterval(() => {
      setFlatIndex((i) => (i + 1) % totalFrames);
    }, 1200);
    return () => clearInterval(timer);
  }, [isPlaying, totalFrames]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new Map({
      container: mapContainer.current,
      style: basemaps[currentStyle].style,
      center: [102.835, 16.432],
      zoom: 11,
      attributionControl: false,
    });

    map.current.addControl(new ScaleControl(), "bottom-left");
    map.current.on("load", () => setIsLoaded(true));
    map.current.on("mousedown", () => {
      if (isSwitcherOpen) setSwitcherOpen(false);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const switchBasemap = (styleKey: BasemapStyleKey) => {
    if (!map.current || !isLoaded) return;
    setCurrentStyle(styleKey);
    map.current.setStyle(basemaps[styleKey].style);
    map.current.once("style.load", () => {
      if (currentFrame) showFloodFrame(currentFrame);
      if (!showFloodLayer && map.current?.getLayer(FLOOD_LAYER_ID)) {
        map.current.setLayoutProperty(FLOOD_LAYER_ID, "visibility", "none");
      }
    });
    setSwitcherOpen(false);
  };

  const toggleFloodLayer = () => {
    if (!map.current?.getLayer(FLOOD_LAYER_ID)) return;
    const next = !showFloodLayer;
    map.current.setLayoutProperty(
      FLOOD_LAYER_ID,
      "visibility",
      next ? "visible" : "none",
    );
    setShowFloodLayer(next);
  };

  const selectDay = (index: number) => {
    setIsPlaying(false);
    const group = dayGroups[index];
    if (!group) return;
    setFlatIndex(indicesToFlat(index, group.frames.length - 1));
  };

  const selectHour = (index: number) => {
    setIsPlaying(false);
    setFlatIndex(indicesToFlat(dayIndex, index));
  };

  const stepFrame = (delta: number) => {
    if (totalFrames <= 1) return;
    setIsPlaying(false);
    setFlatIndex((i) => {
      const next = i + delta;
      if (next < 0) return totalFrames - 1;
      if (next >= totalFrames) return 0;
      return next;
    });
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-xl bg-gray-900 font-sans">
      <div className="relative min-h-0 flex-1">
        <div ref={mapContainer} className="h-full w-full" />

        {(!isLoaded || framesLoading) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-800/60 backdrop-blur-sm">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-400" />
              <p className="mt-4 text-lg font-semibold text-white">
                {framesLoading ? "กำลังโหลดรายการแผนที่..." : "กำลังโหลดแผนที่..."}
              </p>
            </div>
          </div>
        )}

        {frameRendering && isLoaded && !framesLoading && (
          <div className="absolute left-4 top-4 z-40 rounded-lg bg-white/90 px-3 py-2 text-xs text-blue-700 shadow">
            กำลังประมวลผลภาพ...
          </div>
        )}

        {loadError && (
          <div className="absolute left-4 top-4 z-40 max-w-sm rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 shadow">
            {loadError}
          </div>
        )}

        <div className="absolute right-4 top-4 z-40">
          <div className="relative">
            <button
              onClick={() => setSwitcherOpen(!isSwitcherOpen)}
              disabled={!isLoaded}
              className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:bg-gray-100 ${
                !isLoaded ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <Layers className="h-6 w-6 text-gray-700" />
            </button>
            {isSwitcherOpen && isLoaded && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-gray-200/50 bg-white/90 p-3 shadow-2xl backdrop-blur-md">
                <div className="mb-3 flex items-center space-x-2 px-1">
                  <MapIcon className="h-5 w-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-800">เลือกรูปแบบแผนที่</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(basemaps) as [BasemapStyleKey, BasemapConfig][]).map(
                    ([key, bm]) => (
                      <button
                        key={key}
                        onClick={() => switchBasemap(key)}
                        className={`flex h-20 flex-col items-center justify-center rounded-lg p-3 text-xs font-medium transition-all ${
                          currentStyle === key
                            ? "bg-[#a73824] text-white shadow-md ring-2 ring-[#d9b4aa]"
                            : "bg-gray-50/50 text-gray-700 hover:bg-[#f3e9e4]/80"
                        }`}
                      >
                        <span className="mb-1 text-2xl">{bm.icon}</span>
                        <span>{bm.name}</span>
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute right-4 top-20 z-40">
          <button
            onClick={toggleFloodLayer}
            disabled={!isLoaded || !currentFrame}
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:bg-gray-100 ${
              showFloodLayer ? "ring-2 ring-[#a73824]/60" : ""
            } ${!isLoaded ? "cursor-not-allowed opacity-50" : ""}`}
            title={showFloodLayer ? "ซ่อนชั้นข้อมูลน้ำท่วม" : "แสดงชั้นข้อมูลน้ำท่วม"}
          >
            {showFloodLayer ? (
              <Eye className="h-6 w-6 text-[#a73824]" />
            ) : (
              <EyeOff className="h-6 w-6 text-gray-500" />
            )}
          </button>
        </div>

        <div className="absolute bottom-3 left-1/2 z-40 w-[min(340px,calc(100%-1.5rem))] -translate-x-1/2">
          <div className="overflow-hidden rounded-xl border border-[#eadbd4]/70 bg-white/95 shadow-2xl backdrop-blur-md">
            {/* แถบหัว — แสดงตลอด กดเพื่อย่อ/ขยายแผงเลือกวัน-เวลา */}
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <div className="min-w-0">
                <div className="text-[10px] font-medium text-gray-500">
                  พื้นที่เสี่ยงน้ำท่วม — 7 วันย้อนหลัง
                </div>
                <div className="truncate text-sm font-bold text-gray-800">
                  {currentFrame?.displayLabel ?? "—"}
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1.5">
                <button
                  onClick={() => setIsPlaying((p) => !p)}
                  disabled={totalFrames <= 1}
                  className="rounded-lg bg-[#a73824] p-1.5 text-white hover:bg-[#8f2e1c] disabled:opacity-40"
                  title={isPlaying ? "หยุด" : "เล่นอัตโนมัติ"}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => setPanelExpanded((v) => !v)}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                  title={panelExpanded ? "ย่อแผงเลือกวัน-เวลา" : "ขยายแผงเลือกวัน-เวลา"}
                >
                  {panelExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronUp className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {panelExpanded && (
              <div className="border-t border-[#eadbd4]/60 px-3 pb-2 pt-1.5">
                {/* แถบเลือกวัน */}
                <div className="mb-1.5 flex items-end justify-center gap-1">
                  {dayGroups.map((group, i) => {
                    const isActive = dayIndex === i;
                    const dayNum = group.dayKey.slice(6, 8);
                    return (
                      <button
                        key={group.dayKey}
                        type="button"
                        onClick={() => selectDay(i)}
                        disabled={!isLoaded}
                        className="group flex flex-col items-center gap-0.5 disabled:opacity-40"
                        title={group.dayLabel}
                      >
                        <div
                          className={`w-2.5 rounded-sm transition-all duration-200 ${
                            isActive
                              ? "h-5 bg-[#a73824] shadow-sm"
                              : "h-2.5 bg-[#e8cec6] group-hover:h-3.5 group-hover:bg-[#d9b4aa]"
                          }`}
                        />
                        <span
                          className={`text-[8px] leading-none ${
                            isActive ? "font-bold text-[#a73824]" : "text-gray-400"
                          }`}
                        >
                          {parseInt(dayNum, 10)}
                        </span>
                        <span
                          className={`text-[7px] leading-none ${
                            isActive ? "text-[#c06652]" : "text-gray-300"
                          }`}
                        >
                          {group.weekday}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* แถบเลือกช่วงเวลา (ทุก 3 ชม.) */}
                {currentDay && currentDay.frames.length > 0 && (
                  <div className="border-t border-gray-100 pt-1.5">
                    <div className="mb-1 text-center text-[9px] text-gray-400">
                      ช่วงเวลา — {currentDay.dayLabel}
                    </div>
                    <div className="flex items-end justify-center gap-0.5">
                      {currentDay.frames.map((frame, i) => {
                        const isActive = hourIndex === i;
                        return (
                          <button
                            key={frame.id}
                            type="button"
                            onClick={() => selectHour(i)}
                            disabled={!isLoaded}
                            className="group flex flex-col items-center gap-0.5 disabled:opacity-40"
                            title={frame.displayLabel}
                          >
                            <div
                              className={`w-1.5 rounded-sm transition-all duration-200 ${
                                isActive
                                  ? "h-4 bg-[#d96a4c] shadow-sm"
                                  : "h-2 bg-[#f0dcd3] group-hover:h-3 group-hover:bg-[#d9b4aa]"
                              }`}
                            />
                            <span
                              className={`text-[7px] leading-none ${
                                isActive ? "font-bold text-[#d96a4c]" : "text-gray-400"
                              }`}
                            >
                              {frame.timeLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {totalFrames > 1 && (
                  <div className="mt-1.5 flex items-center justify-center gap-2">
                    <button
                      onClick={() => stepFrame(-1)}
                      className="rounded p-1 text-gray-500 hover:bg-gray-100"
                      title="ก่อนหน้า"
                    >
                      <SkipBack className="h-3 w-3" />
                    </button>
                    <span className="text-[10px] text-gray-400">
                      {flatIndex + 1} / {totalFrames}
                    </span>
                    <button
                      onClick={() => stepFrame(1)}
                      className="rounded p-1 text-gray-500 hover:bg-gray-100"
                      title="ถัดไป"
                    >
                      <SkipForward className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-gray-300 bg-white px-3 pb-2 pt-1.5">
        <div className="flex w-full overflow-hidden rounded-sm border border-gray-300">
          {LEGEND_SEGMENTS.map((seg, i) => (
            <div
              key={i}
              className="flex flex-1 items-center justify-center py-2"
              style={{ backgroundColor: seg.color }}
            >
              <span className="whitespace-nowrap text-[9px] font-bold text-gray-800">
                {seg.range} ม.
              </span>
            </div>
          ))}
        </div>
        <div className="mt-0.5 flex w-full">
          {LEVEL_LABELS.map((l, i) => (
            <div
              key={i}
              className={`text-center text-[10px] font-semibold text-gray-700 ${
                i < LEVEL_LABELS.length - 1 ? "border-r border-gray-300" : ""
              }`}
              style={{ flex: l.span }}
            >
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapComponentFlood;
