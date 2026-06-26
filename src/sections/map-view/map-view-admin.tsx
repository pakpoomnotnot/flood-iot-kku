"use client";
import React, { useState, useEffect } from "react";
import MapLibreComponent from "@/components/map/map-defult";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { MainContent } from "@/components/layout/main-content";
import { StationProvider } from "@/contexts/station-context";
import WaterTable from "@/components/dashboard-chart/dashbaord-table";
// Maps
import MapComponent from "@/components/map/map_rain";
import MapComponentSwamp from "@/components/map/map_swamp";
import MapComponentDrainage from "@/components/map/map_drainage";
import MapComponentRoads from "@/components/map/map_road";
import MapComponentAnalytics from "@/components/map/map_analytics";
import MapComponentFlood from "@/components/map/map_flood_area";
import FloodDashboard from "@/components/map/map_help";
import { DashboardNavAdmin } from "@/components/layout/dashboard-nav-admin";
import { RAIN_STATIONS } from "@/lib/rain-stations";
import {
  LAKE_CONFIG,
  getPondFreeboard,
  getPondStatusThai,
  type LakeId,
} from "@/lib/lake-thresholds";
import {
  getPipeLevelStatusThai,
  getRoadLevelStatusThai,
} from "@/lib/water-level-status";
import type { TelemetryApiResponse } from "@/lib/telemetry-types";
import type { TelemetryStationResult } from "@/app/api/lib/fetchTelemetryReading";

// --- 0. Interface ---
interface WaterData {
  station:      string;
  location:     string;
  level:        number;
  bankLevel:    number;
  status:       string;
  diff:         number;
  time:         string;
  stationCode?: string;
}

interface LakeApiItem {
  lake_id:          string;
  name_th:          string;
  name_en:          string;
  location:         { lat: number; lng: number };
  status:           "ok" | "error" | "no_data";
  water_level?:     number;
  water_flow?:      number;
  water_total?:     number;
  rain_value?:      number;
  rain_daily?:      number;
  air_temp?:        number;
  air_humid?:       number;
  wind_direction_name?: string;
  date_time?:       string;
  water_volume_m3?: number;
  water_area_m2?:   number;
  capacity_pct?:    number;
  error?:           string;
}

interface LakesApiResponse {
  fetched_at: string;
  count:      number;
  lakes:      LakeApiItem[];
}

// --- 1. ประเภท Tab ฝน ---
type RainfallTab = "1hr" | "3hr" | "24hr" | "forecast_1hr" | "forecast_3hr";

const RAINFALL_TABS: { key: RainfallTab; label: string }[] = [
  { key: "1hr",          label: "ฝน 1 ชม." },
  { key: "3hr",          label: "ฝน 3 ชม." },
  { key: "24hr",         label: "ฝน 24 ชม." },
  { key: "forecast_1hr", label: "ฝนพยากรณ์ล่วงหน้า 1 ชม." },
  { key: "forecast_3hr", label: "ฝนพยากรณ์ล่วงหน้า 3 ชม." },
];

// --- 2. ข้อมูล Metadata สถานีฝน ---
const STATION_METADATA = [
  { id: "SNK_HOSP", name: RAIN_STATIONS.SNK_HOSP.name,        location: "ต. ในเมือง อ. เมือง" },
  { id: "KKC_MUN",  name: RAIN_STATIONS.KKC_MUN.name,            location: "ต. ในเมือง อ. เมือง" },
  { id: "BKN",      name: RAIN_STATIONS.BKN.name,                  location: "ต. ในเมือง อ. เมือง" },
  { id: "BTS",      name: RAIN_STATIONS.BTS.name,                 location: "ต. ในเมือง อ. เมือง" },
  { id: "NLP",      name: RAIN_STATIONS.NLP.name,                location: "อ. เมือง" },
  { id: "BNK",      name: RAIN_STATIONS.BNK.name,                  location: "ต. บ้านเป็ด อ. เมือง" },
  { id: "SIL_MUN",  name: RAIN_STATIONS.SIL_MUN.name,              location: "ต. ศิลา อ. เมือง" },
  { id: "UNE_MC",   name: RAIN_STATIONS.UNE_MC.name,          location: "ต. ในเมือง อ. เมือง" },
  { id: "MKO_MUN",  name: RAIN_STATIONS.MKO_MUN.name,              location: "ต. เมืองเก่า อ. เมือง" },
  { id: "NEU",      name: RAIN_STATIONS.NEU.name,     location: "ต. ในเมือง อ. เมือง" },
  { id: "UNE_SH",   name: RAIN_STATIONS.UNE_SH.name,          location: "ต. ในเมือง อ. เมือง" },
  { id: "KKC_SP",   name: RAIN_STATIONS.KKC_SP.name,        location: "ต. ในเมือง อ. เมือง" },
  { id: "BSV",      name: RAIN_STATIONS.BSV.name,                location: "ต. บ้านเป็ด อ. เมือง" },
  { id: "RMUTI",    name: RAIN_STATIONS.RMUTI.name,           location: "ต. ในเมือง อ. เมือง" },
  { id: "KKC_BL",   name: RAIN_STATIONS.KKC_BL.name,          location: "ต. ในเมือง อ. เมือง" },
];

// --- 3. Metadata บึง ---
const LAKE_META: { lakeId: LakeId; name: string; location: string }[] = [
  { lakeId: "Lake_03", name: "บึงแก่นนคร",    location: "ต. ในเมือง อ. เมือง" },
  { lakeId: "Lake_02", name: "บึงทุ่งสร้าง",  location: "ต. ในเมือง อ. เมือง" },
  { lakeId: "Lake_05", name: "บึงหนองโคตร",   location: "ต. บ้านเป็ด อ. เมือง" },
  { lakeId: "Lake_06", name: "หนองเลิงเปือย", location: "อ. เมือง" },
];

// --- 4. Mock Data สำหรับแต่ละ Tab ฝน ---
const getRainfallMockData = (_tab: RainfallTab): WaterData[] => {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")} น.`;

  return STATION_METADATA.map((meta) => ({
    station:     meta.name,
    location:    meta.location,
    level:       0,
    bankLevel:   0,
    diff:        0,
    status:      "ไม่มีฝน",
    time:        timeStr,
    stationCode: meta.id,
  }));
};

// --- 5. Helper แปลง telemetry → WaterData ---
const telemetryToWaterData = (
  stations: TelemetryStationResult[],
  getStatus: (levelM: number | undefined) => string,
): WaterData[] =>
  stations.map((station) => {
    const levelM = station.status === "ok" ? station.water_level_m : undefined;
    const timeDisplay = (() => {
      if (!station.date_time) return "—";
      const d = new Date(station.date_time.replace(" ", "T"));
      if (isNaN(d.getTime())) return "—";
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} น.`;
    })();

    return {
      station: station.name_th,
      location: station.location.area,
      level: levelM ?? 0,
      bankLevel: 0,
      diff: 0,
      status: getStatus(levelM),
      time: timeDisplay,
      stationCode: station.map_id ?? station.station_id,
    };
  });

// ============================================================
// Component: RainfallTabBar
// ============================================================
const RainfallTabBar = ({
  activeTab,
  onTabChange,
}: {
  activeTab: RainfallTab;
  onTabChange: (tab: RainfallTab) => void;
}) => (
  <div className="flex w-full border-b border-gray-200 bg-white">
    {RAINFALL_TABS.map((tab) => (
      <button
        key={tab.key}
        onClick={() => onTabChange(tab.key)}
        className={`
          relative flex-1 px-2 py-3 text-xs font-medium transition-all duration-200
          whitespace-nowrap overflow-hidden text-ellipsis
          ${
            activeTab === tab.key
              ? "text-[#A73B24] border-b-2 border-[#A73B24]"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent"
          }
        `}
        title={tab.label}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

// ============================================================
// Main Component: MapViewAdmin
// ============================================================
const MapViewAdmin = () => {
  const [activeView, setActiveView]             = useState("overview");
  const [showTable, setShowTable]               = useState(false);
  const [realRainfallData, setRealRainfallData] = useState<WaterData[]>([]);
  const [rainfallTab, setRainfallTab]           = useState<RainfallTab>("1hr");
  const [lakesData, setLakesData]               = useState<LakeApiItem[]>([]);
  const [pipeData, setPipeData]                 = useState<TelemetryStationResult[]>([]);
  const [roadData, setRoadData]                 = useState<TelemetryStationResult[]>([]);

  // --- ดึงข้อมูลฝน 1hr ---
  const fetchRainData = async () => {
    try {
      const response = await fetch("http://10.198.110.39:3000/api/rain_1hr_2km?limit=1");
      const result   = await response.json();

      if (result.status === "success" && result.data && result.data.length > 0) {
        const latestData = result.data[0];
        const dateObj    = new Date(latestData.datetime);
        const timeStr    = `${dateObj.getHours().toString().padStart(2, "0")}:${dateObj
          .getMinutes()
          .toString()
          .padStart(2, "0")} น.`;

        const rainValues: Record<string, number> = {};
        Object.entries(latestData.stations).forEach(([key, value]) => {
          rainValues[key.trim()] = Number(value);
        });

        const formattedData: WaterData[] = STATION_METADATA.map((meta) => {
          const value = rainValues[meta.id] ?? 0;
          let statusText = "ไม่มีฝน";
          if (value > 90)      statusText = "หนักมาก";
          else if (value > 35) statusText = "หนัก";
          else if (value > 10) statusText = "ปานกลาง";
          else if (value > 0)  statusText = "เล็กน้อย";

          return {
            station:     meta.name,
            location:    meta.location,
            level:       Number(value.toFixed(1)),
            bankLevel:   0,
            diff:        0,
            status:      statusText,
            time:        timeStr,
            stationCode: meta.id,
          };
        });

        setRealRainfallData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching rain data:", error);
    }
  };

  // --- ดึงข้อมูลบึง ---
  const fetchLakesData = async () => {
    try {
      const res  = await fetch("/api/lake");
      if (!res.ok) throw new Error(`API ตอบกลับ ${res.status}`);
      const json: LakesApiResponse = await res.json();
      setLakesData(json.lakes ?? []);
    } catch (error) {
      console.error("Error fetching lake data:", error);
    }
  };

  const fetchPipeData = async () => {
    try {
      const res = await fetch("/api/water/pipe");
      if (!res.ok) throw new Error(`API ตอบกลับ ${res.status}`);
      const json: TelemetryApiResponse = await res.json();
      setPipeData(json.stations ?? []);
    } catch (error) {
      console.error("Error fetching pipe data:", error);
    }
  };

  const fetchRoadData = async () => {
    try {
      const res = await fetch("/api/water/road");
      if (!res.ok) throw new Error(`API ตอบกลับ ${res.status}`);
      const json: TelemetryApiResponse = await res.json();
      setRoadData(json.stations ?? []);
    } catch (error) {
      console.error("Error fetching road data:", error);
    }
  };

  useEffect(() => {
    fetchRainData();
    fetchLakesData();
    fetchPipeData();
    fetchRoadData();
    const interval = setInterval(() => {
      fetchLakesData();
      fetchPipeData();
      fetchRoadData();
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // --- แปลงข้อมูลบึง → WaterData ---
  const getLakesTableData = (): WaterData[] => {
    const now     = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")} น.`;

    return LAKE_META.map((meta) => {
      const lake       = lakesData.find((l) => l.lake_id === meta.lakeId);
      const waterLevel = lake?.water_level;
      const cfg        = LAKE_CONFIG[meta.lakeId];
      const freeboard  = getPondFreeboard(meta.lakeId, waterLevel) ?? 0;
      const status     = getPondStatusThai(meta.lakeId, waterLevel);

      // ใช้เวลาจาก API ถ้ามี
      let timeDisplay = timeStr;
      if (lake?.date_time) {
        const d = new Date(lake.date_time);
        if (!isNaN(d.getTime())) {
          timeDisplay = `${d.getHours().toString().padStart(2, "0")}:${d
            .getMinutes()
            .toString()
            .padStart(2, "0")} น.`;
        }
      }

      return {
        station:     meta.name,
        location:    meta.location,
        level:       waterLevel ?? 0,
        bankLevel:   cfg.maxLevel,
        diff:        freeboard,
        status,
        time:        timeDisplay,
        stationCode: meta.lakeId,       // ใช้ lake_id เป็น stationCode
      };
    });
  };

  // --- คืนข้อมูลตาม view ปัจจุบัน ---
  const getCurrentData = (): WaterData[] => {
    switch (activeView) {
      case "rainfall":
        if (rainfallTab === "1hr" && realRainfallData.length > 0) return realRainfallData;
        return getRainfallMockData(rainfallTab);
      case "ponds":    return getLakesTableData();
      case "drainage": return telemetryToWaterData(pipeData, getPipeLevelStatusThai);
      case "roads":    return telemetryToWaterData(roadData, getRoadLevelStatusThai);
      default:         return [];
    }
  };

  // --- mode ของตาราง ---
  const getTableMode = (): "rainfall" | "pond" | "default" => {
    if (activeView === "rainfall") return "rainfall";
    if (activeView === "ponds")    return "pond";
    return "default";
  };

  const getMapComponent = () => {
    switch (activeView) {
      case "rainfall":        return <MapComponent />;
      case "ponds":           return <MapComponentSwamp />;
      case "drainage":        return <MapComponentDrainage />;
      case "roads":           return <MapComponentRoads />;
      case "analysis":        return <MapComponentAnalytics />;
      case "mapflood":        return <MapComponentFlood />;
      case "alertanoncement": return <FloodDashboard />;
      default:                return <MapComponent />;
    }
  };

  return (
    <StationProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-[#f8f5f3]">
        <DashboardHeader />

        <div className="flex flex-1 overflow-hidden">
          <DashboardNavAdmin activeView={activeView} onViewChange={setActiveView} />

          <div className="relative flex flex-1 flex-col overflow-hidden bg-[#fffaf7]">
            {activeView === "overview" ? (
              <div className="flex-1 overflow-auto">
                <MainContent
                  activeView={activeView}
                  mapComponent={
                    <div className="relative h-full w-full overflow-hidden rounded-lg border border-[#ead0c7] bg-slate-900 shadow-inner">
                      <MapLibreComponent sidebarWidth={0} isWidth={() => {}} />
                    </div>
                  }
                />
              </div>

            ) : activeView === "analysis" || activeView === "mapflood" || activeView === "alertanoncement" ? (
              <main className="flex h-full w-full flex-col overflow-hidden bg-white p-2 sm:p-4">
                <div className="h-full w-full rounded-xl border border-[#ead0c7] bg-slate-900 shadow-inner">
                  {getMapComponent()}
                </div>
              </main>

            ) : (
              <main className="flex h-full w-full flex-col overflow-hidden bg-white p-2 sm:p-4 lg:flex-row lg:gap-4">
                {/* ปุ่มสลับแผนที่/ตาราง (มือถือ) */}
                <div className="mb-2 flex gap-2 lg:hidden">
                  <button
                    onClick={() => setShowTable(false)}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      !showTable ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    แผนที่
                  </button>
                  <button
                    onClick={() => setShowTable(true)}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      showTable ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    ตารางข้อมูล
                  </button>
                </div>

                {/* แผนที่ */}
                <div
                  className={`h-[100vh] w-full rounded-xl border border-[#ead0c7] bg-slate-900 shadow-inner lg:h-full lg:w-1/2 ${
                    showTable ? "hidden lg:block" : "block"
                  }`}
                >
                  {getMapComponent()}
                </div>

                {/* ตาราง */}
                <div
                  className={`flex h-[50vh] w-full flex-col overflow-hidden rounded-xl border border-[#ead0c7] bg-white shadow-sm lg:h-full lg:w-1/2 ${
                    !showTable ? "hidden lg:flex" : "flex"
                  }`}
                >
                  {/* Tab Bar เฉพาะ rainfall */}
                  {activeView === "rainfall" && (
                    <RainfallTabBar
                      activeTab={rainfallTab}
                      onTabChange={setRainfallTab}
                    />
                  )}

                  <div className="min-h-0 flex-1 overflow-auto">
                    <WaterTable
                      data={getCurrentData()}
                      mode={getTableMode()}
                    />
                  </div>
                </div>
              </main>
            )}
          </div>
        </div>
      </div>
    </StationProvider>
  );
};

export default MapViewAdmin;