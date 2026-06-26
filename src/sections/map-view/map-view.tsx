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
import { RAIN_STATIONS } from "@/lib/rain-stations";

// --- 0. แก้ไข Interface ให้ตรงกับที่ WaterTable ต้องการ (Strict Number) ---
interface WaterData {
  station: string;
  location: string;
  basin: string;
  level: number;      // เปลี่ยนเป็น number
  bankLevel: number;  // เปลี่ยนเป็น number
  status: string;
  diff: number;       // เปลี่ยนเป็น number
  time: string;
}

// --- 1. ข้อมูล Metadata ---
const STATION_METADATA = [
  { id: "SNK_HOSP", name: RAIN_STATIONS.SNK_HOSP.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "KKC_MUN", name: RAIN_STATIONS.KKC_MUN.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "BKN", name: RAIN_STATIONS.BKN.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "BTS", name: RAIN_STATIONS.BTS.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "NLP", name: RAIN_STATIONS.NLP.name, location: "อ. เมือง" },
  { id: "BNK", name: RAIN_STATIONS.BNK.name, location: "ต. บ้านเป็ด อ. เมือง" },
  { id: "SIL_MUN", name: RAIN_STATIONS.SIL_MUN.name, location: "ต. ศิลา อ. เมือง" },
  { id: "UNE_MC", name: RAIN_STATIONS.UNE_MC.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "MKO_MUN", name: RAIN_STATIONS.MKO_MUN.name, location: "ต. เมืองเก่า อ. เมือง" },
  { id: "NEU", name: RAIN_STATIONS.NEU.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "UNE_SH", name: RAIN_STATIONS.UNE_SH.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "KKC_SP", name: RAIN_STATIONS.KKC_SP.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "BSV", name: RAIN_STATIONS.BSV.name, location: "ต. บ้านเป็ด อ. เมือง" },
  { id: "RMUTI", name: RAIN_STATIONS.RMUTI.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "KKC_BL", name: RAIN_STATIONS.KKC_BL.name, location: "ต. ในเมือง อ. เมือง" },
];

// Mock Data เดิม (ใส่ Type ให้ถูกต้อง)
const dataByView: Record<string, WaterData[]> = {
  ponds: [
    {
      station: "บึงแก่นนคร",
      location: "ต. บ้านเป็ด อ. เมือง",
      basin: "ลุ่มน้ำชี",
      level: 4.85,
      bankLevel: 6.0,
      status: "สูง",
      diff: 1.15,
      time: "14:30 น.",
    },
    {
      station: "สะพาน บ้านทุ่งเศรษฐี (ทางน้ำเปิด)",
      location: "ต. หนองแสง อ. หนองแสง",
      basin: "ลุ่มน้ำชี",
      level: 3.62,
      bankLevel: 5.0,
      status: "กลาง",
      diff: 1.38,
      time: "14:30 น.",
    },
    {
      station: "คุ้มสีฐาน มหาวิทยาลัยขอนแก่น (ทางน้ำเปิด)",
      location: "ต. กุดบง อ. บ้านไผ่",
      basin: "ลุ่มน้ำชี",
      level: 2.94,
      bankLevel: 4.5,
      status: "กลาง",
      diff: 1.56,
      time: "14:30 น.",
    },
    {
      station: "บึงทุ่งสร้าง",
      location: "ต. ทุ่งสร้าง อ. ชุมแพ",
      basin: "ลุ่มน้ำชี",
      level: 2.18,
      bankLevel: 4.0,
      status: "ต่ำ",
      diff: 1.82,
      time: "14:30 น.",
    },
    {
      station: "บึงหนองโคตร",
      location: "ต. ทุ่งสร้าง อ. ชุมแพ",
      basin: "ลุ่มน้ำชี",
      level: 2.18,
      bankLevel: 4.0,
      status: "ต่ำ",
      diff: 1.82,
      time: "14:30 น.",
    },
  ],
  drainage: [
    {
      station: "ประตูระบายน้ำที่ 5 (ในท่อก่อนเข้า ปตร.5)",
      location: "ต. ในเมือง อ. เมือง",
      basin: "ลุ่มน้ำชี",
      level: 1.85,
      bankLevel: 2.5,
      status: "สูง",
      diff: 0.65,
      time: "14:30 น.",
    },
    {
      station: "ถนนหมอชาญอุทิศ",
      location: "ต. ในเมือง อ. เมือง",
      basin: "ลุ่มน้ำชี",
      level: 1.42,
      bankLevel: 2.5,
      status: "กลาง",
      diff: 1.08,
      time: "14:30 น.",
    },
    {
      station: "ศูนย์วิจัยและเพาะเลี้ยงสัตว์น้ำจืด",
      location: "ต. บ้านค้อ อ. เมือง",
      basin: "ลุ่มน้ำชี",
      level: 0.98,
      bankLevel: 2.0,
      status: "กลาง",
      diff: 1.02,
      time: "14:30 น.",
    },
    {
      station: "สะพานบ้านทุ่งเศรษฐี",
      location: "ต. บ้านค้อ อ. เมือง",
      basin: "ลุ่มน้ำชี",
      level: 0.82,
      bankLevel: 2.0,
      status: "ต่ำ",
      diff: 1.18,
      time: "14:30 น.",
    },
    {
      station: "หน้าร้านจิ้มจุ่มริมคลอง",
      location: "ต. บ้านค้อ อ. เมือง",
      basin: "ลุ่มน้ำชี",
      level: 0.75,
      bankLevel: 2.0,
      status: "ต่ำ",
      diff: 1.25,
      time: "14:30 น.",
    },
    {
      station: "ซอยเทพารักษ์",
      location: "ต. ในเมือง อ. เมือง",
      basin: "ลุ่มน้ำชี",
      level: 1.23,
      bankLevel: 2.5,
      status: "กลาง",
      diff: 1.27,
      time: "14:30 น.",
    },
    {
      station: "หน้าโรงพยาบาลขอนแก่นราม",
      location: "ต. ในเมือง อ. เมือง",
      basin: "ลุ่มน้ำชี",
      level: 1.64,
      bankLevel: 2.5,
      status: "กลาง",
      diff: 0.86,
      time: "14:30 น.",
    },
  ],
  roads: [
    {
      station: "ถนนศรีจันทร์",
      location: "ต. ในเมือง อ. เมือง",
      basin: "ลุ่มน้ำชี",
      level: 0.45,
      bankLevel: 0.8,
      status: "น้ำท่วม",
      diff: 0.35,
      time: "14:30 น.",
    },
    {
      station: "ถนนมิตรภาพ",
      location: "ต. ในเมือง อ. เมือง",
      basin: "ลุ่มน้ำชี",
      level: 0.28,
      bankLevel: 0.8,
      status: "ปกติ",
      diff: 0.52,
      time: "14:30 น.",
    },
    {
      station: "ถนนหน้ามหาวิทยาลัย",
      location: "ต. ในเมือง อ. เมือง",
      basin: "ลุ่มน้ำชี",
      level: 0.15,
      bankLevel: 0.8,
      status: "ปกติ",
      diff: 0.65,
      time: "14:30 น.",
    },
  ],
};


const MapView = () => {
  const [activeView, setActiveView] = useState("overview");
  const [showTable, setShowTable] = useState(false);
  const [realRainfallData, setRealRainfallData] = useState<WaterData[]>([]);

  const fetchRainData = async () => {
    try {
      const response = await fetch("http://10.198.110.39:3000/api/rain_1hr_2km?limit=1");
      const result = await response.json();

      if (result.status === "success" && result.data && result.data.length > 0) {
        const latestData = result.data[0];
        
        const dateObj = new Date(latestData.datetime);
        const timeStr = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')} น.`;
        
        const rainValues: Record<string, number> = {}; 
        Object.entries(latestData.stations).forEach(([key, value]) => {
          rainValues[key.trim()] = Number(value);
        });

        const formattedData: WaterData[] = STATION_METADATA.map((meta) => {
          const value = rainValues[meta.id] ?? 0;
          
          let statusText = "ไม่มีฝน";
          if (value > 90) statusText = "หนักมาก";
          else if (value > 35) statusText = "หนัก";
          else if (value > 10) statusText = "ปานกลาง";
          else if (value > 0) statusText = "เล็กน้อย";

          return {
            station: meta.name,
            location: meta.location,
            basin: "ลุ่มน้ำชี",
            // แก้ไขตรงนี้: แปลงเป็น Number แทน String
            level: Number(value.toFixed(1)), 
            // แก้ไขตรงนี้: ใส่เลข 0 แทน "-" เพื่อให้ Type ตรงกับ WaterTable
            bankLevel: 0, 
            diff: 0,
            status: statusText,
            time: timeStr,
          };
        });

        setRealRainfallData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching rain data for table:", error);
    }
  };

  useEffect(() => {
    fetchRainData();
  }, []);

  // กำหนด Type Return ให้ชัดเจน
  const getCurrentData = (): WaterData[] => {
    switch (activeView) {
      case "rainfall":
        return realRainfallData;
      case "ponds":
        return dataByView.ponds || [];
      case "drainage":
        return dataByView.drainage || [];
      case "roads":
        return dataByView.roads || [];
      default:
        return [];
    }
  };

  const getMapComponent = () => {
    switch (activeView) {
      case "rainfall": return <MapComponent />;
      case "ponds": return <MapComponentSwamp />;
      case "drainage": return <MapComponentDrainage />;
      case "roads": return <MapComponentRoads />;
      case "analysis": return <MapComponentAnalytics />;
      case "mapflood": return <MapComponentFlood />;
      case "alertanoncement": return <FloodDashboard />
      default: return <MapComponent />;
    }
  };

  return (
    <StationProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-[#f8f5f3]">
        <DashboardHeader />

        <div className="flex flex-1 overflow-hidden">
          <DashboardNav activeView={activeView} onViewChange={setActiveView} />

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
                <div className="mb-2 flex gap-2 lg:hidden">
                  <button
                    onClick={() => setShowTable(false)}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${!showTable ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                  >
                    แผนที่
                  </button>
                  <button
                    onClick={() => setShowTable(true)}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${showTable ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                  >
                    ตารางข้อมูล
                  </button>
                </div>

                <div className={`h-[100vh] w-full rounded-xl border border-[#ead0c7] bg-slate-900 shadow-inner lg:h-full lg:w-1/2 ${showTable ? "hidden lg:block" : "block"}`}>
                  {getMapComponent()}
                </div>

                <div className={`h-[50vh] w-full rounded-xl border border-[#ead0c7] bg-white shadow-sm lg:h-full lg:w-1/2 ${!showTable ? "hidden lg:block" : "block"}`}>
                  <WaterTable data={getCurrentData()} />
                </div>
              </main>
            )}
          </div>
        </div>
      </div>
    </StationProvider>
  );
};

export default MapView;