"use client";
import React, { useState } from "react";
import MapLibreComponent from "@/components/map/map-defult";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { MainContent } from "@/components/layout/main-content";
import { StationProvider } from "@/contexts/station-context";
import HospitalWaterLevelTable from "@/components/dashboard-chart/dashbaord-table";
import WaterTable from "@/components/dashboard-chart/dashbaord-table";


const data = [
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
    diff: 2.20,
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
    diff: 3.80,
    time: "22:00 น.",
  },
];


const MapView = () => {
  const [activeView, setActiveView] = useState("overview");

  return (
    <StationProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
        {/* Top Header */}
        <DashboardHeader />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Navigation Sidebar */}
          <DashboardNav activeView={activeView} onViewChange={setActiveView} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col relative overflow-hidden bg-gray-50">
            {/* Show Dashboard-focused layout when in overview, otherwise show map */}
            {activeView === "overview" ? (
              <div className="flex-1 overflow-auto">
                <MainContent
                  activeView={activeView}
                  mapComponent={
                    <div className="h-full w-full relative overflow-hidden bg-slate-900 rounded-lg border border-gray-200 shadow-lg">
                      <MapLibreComponent sidebarWidth={0} isWidth={() => {}} />
                    </div>
                  }
                />
              </div>
            ) : (
              /* Full map view for other views */
              <main className="flex flex-row w-full h-full relative overflow-hidden bg-white p-4 gap-4 ">
                <div className="w-1/2 h-full rounded-md">
                  <MapLibreComponent sidebarWidth={0} isWidth={() => {}} />
                </div>
                <div className="w-1/2 h-full">
                  <WaterTable data={data} />
                </div>
              </main>
            )}
          </div>
        </div>

        {/* Screen Size Indicator (Development only - ลบออกใน production) */}
        {process.env.NODE_ENV === "development" &&
          typeof window !== "undefined" && (
            <div className="fixed bottom-4 right-4 z-50 px-3 py-1 bg-black/70 text-white text-xs rounded-full font-mono">
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
