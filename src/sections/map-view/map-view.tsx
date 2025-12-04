"use client";
import React, { useState } from "react";
import MapLibreComponent from "@/components/map/map-defult";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { MainContent } from "@/components/layout/main-content";
import { StationProvider } from "@/contexts/station-context";
import WaterTable from "@/components/dashboard-chart/dashbaord-table";
import MapComponent from "@/components/map/map_rain";
import MapComponentSwamp from "@/components/map/map_swamp";
import MapComponentDrainage from "@/components/map/map_drainage";
import MapComponentRoads from "@/components/map/map_road";
import MapComponentAnalytics from "@/components/map/map_analytics";

// ข้อมูลสำหรับแต่ละ tab
const dataByView = {
  rainfall: [
    {
      station: "บ้านท่างบางเลื่อน",
      location: "ต. ชนบท อ. ชนบท",
      basin: "ลุ่มน้ำชี",
      level: 161.34,
      bankLevel: 162.1,
      status: "น้ำมาก",
      diff: 0.76,
      time: "22:00 น.",
    },
    {
      station: "ชุมแพ",
      location: "ต. ชุมแพ อ. ชุมแพ",
      basin: "ลุ่มน้ำชี",
      level: 160.79,
      bankLevel: 161.58,
      status: "น้ำมาก",
      diff: 0.79,
      time: "23:00 น.",
    },
    {
      station: "สะพานข้ามลำน้ำเชิญ (มิตรผลหนองเรือ)",
      location: "ต. หนองเรือ อ. หนองเรือ",
      basin: "ลุ่มน้ำชี",
      level: 181.85,
      bankLevel: 182.86,
      status: "น้ำมาก",
      diff: 1.01,
      time: "23:00 น.",
    },
    {
      station: "เมืองขอนแก่น",
      location: "ต. ท่าพระ อ. เมืองขอนแก่น",
      basin: "ลุ่มน้ำชี",
      level: 150.43,
      bankLevel: 153.04,
      status: "น้ำมาก",
      diff: 2.61,
      time: "23:00 น.",
    },
    {
      station: "ลำน้ำเชิญ (ท้ายฝายโครงการชลประทานน้ำเชิญ)",
      location: "ต. ชุมแพ อ. ชุมแพ",
      basin: "ลุ่มน้ำชี",
      level: 218.97,
      bankLevel: 221.17,
      status: "น้ำมาก",
      diff: 2.2,
      time: "22:00 น.",
    },
    {
      station: "บ้านดงกว้าง",
      location: "ต. ท่าพระ อ. เมืองขอนแก่น",
      basin: "ลุ่มน้ำชี",
      level: 149.58,
      bankLevel: 152.3,
      status: "น้ำมาก",
      diff: 2.72,
      time: "22:00 น.",
    },
    {
      station: "แม่ข่าชี บ้านหันกอง",
      location: "ต. บ้านโต้น อ. พระยืน",
      basin: "ลุ่มน้ำชี",
      level: 151.44,
      bankLevel: 155.24,
      status: "น้ำปกติ",
      diff: 3.8,
      time: "22:00 น.",
    },
  ],
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

  // เลือกข้อมูลตาม activeView
  const getCurrentData = () => {
    switch (activeView) {
      case "rainfall":
        return dataByView.rainfall;
      case "ponds":
        return dataByView.ponds;
      case "drainage":
        return dataByView.drainage;
      case "roads":
        return dataByView.roads;
      default:
        return [];
    }
  };

  // กำหนด MapComponent ที่จะใช้ตาม activeView
  const getMapComponent = () => {
    switch (activeView) {
      case "rainfall":
        return <MapComponent />; // แสดงเฉพาะสถานีฝน (RF)
      case "ponds":
        return <MapComponentSwamp />; // แสดงเฉพาะบึง/หนอง (PW)
      case "drainage":
        return <MapComponentDrainage />; // แสดงเฉพาะท่อระบาย (WP)
      case "roads":
        return <MapComponentRoads />; // แสดงเฉพาะถนน (WR)
      case "analysis":
        return <MapComponentAnalytics />;
      default:
        return <MapComponent />; // default component
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
            ) : activeView === "analysis" ? (
              <main className="flex h-full w-full flex-row gap-4 overflow-hidden bg-white p-4">
                <div className="h-full w-full rounded-xl border border-[#ead0c7] bg-slate-900 shadow-inner">
                  {getMapComponent()}
                </div>
              </main>
            ) : (
              <main className="flex h-full w-full flex-row gap-4 overflow-hidden bg-white p-4">
                <div className="h-full w-1/2 rounded-xl border border-[#ead0c7] bg-slate-900 shadow-inner">
                  {getMapComponent()}
                </div>
                <div className="h-full w-1/2 rounded-xl border border-[#ead0c7] bg-white shadow-sm">
                  <WaterTable data={getCurrentData()} />
                </div>
              </main>
            )}
          </div>
        </div>

        {process.env.NODE_ENV === "development" &&
          typeof window !== "undefined" && (
            <div className="fixed bottom-4 right-4 z-50 rounded-full bg-black/70 px-3 py-1 font-mono text-xs text-white">
              <span className="sm:hidden">XS</span>
              <span className="hidden sm:inline md:hidden">SM</span>
              <span className="hidden md:inline lg:hidden">MD</span>
              <span className="hidden lg:inline xl:hidden">LG</span>
              <span className="hidden xl:inline 2xl:hidden">XL</span>
              <span className="hidden 2xl:inline">2XL</span>
              <span className="ml-2">{window.innerWidth}px</span>
            </div>
          )}
      </div>
    </StationProvider>
  );
};

export default MapView;
