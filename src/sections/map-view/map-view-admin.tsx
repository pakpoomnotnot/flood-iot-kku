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
  { id: "SNK_HOSP", name: "โรงพยาบาลศรีนครินทร์",        location: "ต. ในเมือง อ. เมือง" },
  { id: "KKC_MUN",  name: "เทศบาลนครขอนแก่น",            location: "ต. ในเมือง อ. เมือง" },
  { id: "BKN",      name: "บึงแก่นนคร",                  location: "ต. ในเมือง อ. เมือง" },
  { id: "BTS",      name: "บึงทุ่งสร้าง",                 location: "ต. ในเมือง อ. เมือง" },
  { id: "NLP",      name: "หนองเลิงเปือย",                location: "อ. เมือง" },
  { id: "BNK",      name: "บึงหนองโคตร",                  location: "ต. บ้านเป็ด อ. เมือง" },
  { id: "SIL_MUN",  name: "เทศบาลเมืองศิลา",              location: "ต. ศิลา อ. เมือง" },
  { id: "UNE_MC",   name: "ศูนย์อุตุนิยมวิทยาฯ",          location: "ต. ในเมือง อ. เมือง" },
  { id: "MKO_MUN",  name: "เทศบาลเมืองเก่า",              location: "ต. เมืองเก่า อ. เมือง" },
  { id: "NEU",      name: "ม.ภาคตะวันออกเฉียงเหนือ",     location: "ต. ในเมือง อ. เมือง" },
  { id: "UNE_SH",   name: "บ้านพักพนักงานอุตุฯ",          location: "ต. ในเมือง อ. เมือง" },
  { id: "KKC_SP",   name: "อุทยานวิทยาศาสตร์ มข.",        location: "ต. ในเมือง อ. เมือง" },
  { id: "BSV",      name: "หมู่บ้านสีวลี",                location: "ต. บ้านเป็ด อ. เมือง" },
  { id: "RMUTI",    name: "มทร.อีสาน ขอนแก่น",           location: "ต. ในเมือง อ. เมือง" },
  { id: "KKC_BL",   name: "โรงเรียนสอนคนตาบอด",          location: "ต. ในเมือง อ. เมือง" },
];

// --- 3. Metadata บึง (maxLevel = ระดับขอบบึง ม.รทก.) ---
const LAKE_META = [
  { lakeId: "Lake_03", name: "บึงแก่นนคร",    location: "ต. ในเมือง อ. เมือง",  maxLevel: 152.0 },
  { lakeId: "Lake_02", name: "บึงทุ่งสร้าง",  location: "ต. ในเมือง อ. เมือง",  maxLevel: 150.0 },
  { lakeId: "Lake_05", name: "บึงหนองโคตร",   location: "ต. บ้านเป็ด อ. เมือง", maxLevel: 155.0 },
  { lakeId: "Lake_06", name: "หนองเลิงเปือย", location: "อ. เมือง",              maxLevel: 151.5 },
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

// --- 5. Mock Data สำหรับ drainage และ roads ---
const dataByView: Record<string, WaterData[]> = {
  drainage: [
    { station: "ประตูระบายน้ำที่ 5 (ในท่อก่อนเข้า ปตร.5)", location: "ต. ในเมือง อ. เมือง", level: 0, bankLevel: 0, status: "ปกติ", diff: 0, time: "14:30 น." },
    { station: "ถนนหมอชาญอุทิศ",                           location: "ต. ในเมือง อ. เมือง", level: 0, bankLevel: 0, status: "ปกติ", diff: 0, time: "14:30 น." },
    { station: "ศูนย์วิจัยและเพาะเลี้ยงสัตว์น้ำจืด",       location: "ต. บ้านค้อ อ. เมือง", level: 0, bankLevel: 0, status: "ปกติ", diff: 0, time: "14:30 น." },
    { station: "สะพานบ้านทุ่งเศรษฐี",                      location: "ต. บ้านค้อ อ. เมือง", level: 0, bankLevel: 0, status: "ปกติ", diff: 0, time: "14:30 น." },
    { station: "หน้าร้านจิ้มจุ่มริมคลอง",                  location: "ต. บ้านค้อ อ. เมือง", level: 0, bankLevel: 0, status: "ปกติ", diff: 0, time: "14:30 น." },
    { station: "ซอยเทพารักษ์",                             location: "ต. ในเมือง อ. เมือง", level: 0, bankLevel: 0, status: "ปกติ", diff: 0, time: "14:30 น." },
    { station: "หน้าโรงพยาบาลขอนแก่นราม",                  location: "ต. ในเมือง อ. เมือง", level: 0, bankLevel: 0, status: "ปกติ", diff: 0, time: "14:30 น." },
  ],
  roads: [
    { station: "ถนนศรีจันทร์",         location: "ต. ในเมือง อ. เมือง", level: 0, bankLevel: 0, status: "ปกติ", diff: 0, time: "14:30 น." },
    { station: "ถนนมิตรภาพ",           location: "ต. ในเมือง อ. เมือง", level: 0, bankLevel: 0, status: "ปกติ", diff: 0, time: "14:30 น." },
    { station: "ถนนหน้ามหาวิทยาลัย",  location: "ต. ในเมือง อ. เมือง", level: 0, bankLevel: 0, status: "ปกติ", diff: 0, time: "14:30 น." },
  ],
};

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

  useEffect(() => {
    fetchRainData();
    fetchLakesData();
    // refresh บึงทุก 15 นาที
    const interval = setInterval(fetchLakesData, 15 * 60 * 1000);
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
      const waterLevel = lake?.water_level ?? 0;
      const freeboard  = parseFloat((meta.maxLevel - waterLevel).toFixed(2));

      // status จาก freeboard ตาม LAKE_THRESHOLDS
      let status = "ปกติ";
      if      (freeboard < 0.5)  status = "วิกฤต";
      else if (freeboard < 1.0)  status = "เตือนภัย";
      else if (freeboard < 1.5)  status = "เฝ้าระวัง";

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
        level:       waterLevel,        // ระดับน้ำ ม.รทก.
        bankLevel:   meta.maxLevel,     // ระดับขอบบึง ม.รทก.
        diff:        freeboard,         // freeboard (ระยะห่างจากขอบ)
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
      case "drainage": return dataByView.drainage ?? [];
      case "roads":    return dataByView.roads ?? [];
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