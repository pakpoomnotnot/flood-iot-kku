"use client";
import React from "react";
import Dashboard from "../dashboard-chart/dashboard-chart";
import MapLibreComponent from "../map/map-defult";
import RainfallWidget from "../dashboard-chart/RainfallWidget";
import WaterVolumeWidget from "../dashboard-chart/water_value/WaterVolumeWidget";
import WaterVolumeWidget2 from "../dashboard-chart/water_value/WaterVolumeWidget2";
import WaterVolumeWidget3 from "../dashboard-chart/water_value/WaterVolumeWidget3";
import KhonKaenMap from "../map/khonkaen_map";

interface MainContentProps {
  activeView: string;
  mapComponent?: React.ReactNode;
}

export const MainContent: React.FC<MainContentProps> = ({
  activeView: _activeView,
  mapComponent,
}) => {
  return (
    <div className="flex h-full w-full flex-col gap-3 bg-[#fff8f5] p-3 overflow-auto lg:flex-row lg:p-4 lg:overflow-hidden">
      
      {/* Section 1: Alert Cards + Map (ซ้าย) */}
      <div className="flex flex-col gap-3 lg:h-full lg:w-[30%]">
        {/* Container สำหรับ Alert Cards */}
        <div className="flex flex-col gap-3 lg:h-1/2">
          {/* 48 Hour Alert */}
          <div className="flex flex-col rounded-xl border border-[#f0cfc4] bg-gradient-to-br from-[#a73824]/80 to-[#f4a259]/70 shadow-sm lg:h-1/2">
            <div className="flex w-full items-center rounded-t-xl bg-[#a73824]/20 px-3 py-2.5 lg:h-[20%]">
              <span className="text-xs font-semibold text-white drop-shadow">
                พื้นที่เฝ้าระวังพิเศษ 48 ชั่วโมง ล่วงหน้า
              </span>
            </div>
            <div className="flex min-h-[70px] items-center justify-center bg-white/60 px-3 py-3 text-center text-xs text-[#5f3a32] lg:h-full lg:min-h-0">
              ไม่มีพื้นที่เสี่ยงน้ำท่วมจากฝนตกสะสม
            </div>
          </div>

          {/* 72 Hour Alert */}
          <div className="flex flex-col rounded-xl border border-[#f3d9c9] bg-gradient-to-br from-[#b44b2d]/80 to-[#f7b267]/60 shadow-sm lg:h-1/2">
            <div className="flex w-full items-center rounded-t-xl bg-[#f4a259]/20 px-3 py-2.5 lg:h-[20%]">
              <span className="text-xs font-semibold text-white drop-shadow">
                พื้นที่เฝ้าระวังพิเศษ 72 ชั่วโมง ล่วงหน้า
              </span>
            </div>
            <div className="flex min-h-[70px] items-center justify-center bg-white/60 px-3 py-3 text-center text-xs text-[#5f3a32] lg:h-full lg:min-h-0">
              ไม่มีพื้นที่เสี่ยงน้ำท่วมจากฝนตกสะสม
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="h-[280px] w-full overflow-hidden rounded-xl border border-[#ead0c7] bg-white shadow-sm lg:h-1/2">
          {mapComponent && <div className="h-full w-full">{mapComponent}</div>}
        </div>
      </div>

      {/* Section 2: Widgets + Dashboard (ขวา) */}
      <div className="flex flex-col gap-3 lg:h-full lg:flex-1">
        {/* All Widgets */}
        <div className="flex flex-col gap-2 rounded-xl border border-[#ead0c7] bg-white p-3 shadow-sm lg:h-[30%] lg:flex-row lg:px-4 lg:py-3">
          {/* Left Column: 3 Water Widgets */}
          <div className="flex flex-row gap-2 lg:h-full lg:w-1/2">
            <div className="flex h-[110px] flex-1 items-center justify-center rounded-lg border border-[#ead0c7] bg-white p-2 lg:h-full">
              <WaterVolumeWidget />
            </div>
            <div className="flex h-[110px] flex-1 items-center justify-center rounded-lg border border-[#ead0c7] bg-white p-2 lg:h-full">
              <WaterVolumeWidget2 />
            </div>
            <div className="flex h-[110px] flex-1 items-center justify-center rounded-lg border border-[#ead0c7] bg-white p-2 lg:h-full">
              <WaterVolumeWidget3 />
            </div>
          </div>

          {/* Right Column: Rainfall + Khon Kaen Map */}
          <div className="flex flex-row gap-2 lg:h-full lg:w-1/2">
            <div className="flex h-[110px] flex-1 items-center justify-center rounded-lg border border-[#ead0c7] bg-white p-2 lg:h-full">
              <RainfallWidget />
            </div>
            <div className="flex h-[110px] flex-1 items-center justify-center rounded-lg border border-[#ead0c7] bg-white p-0 lg:h-full">
              <div className="relative h-full w-full overflow-hidden rounded-lg border border-[#ead0c7] bg-slate-900 shadow-inner">
                <KhonKaenMap />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Section */}
        <div className="min-h-[700px] rounded-xl border border-[#ead0c7] bg-white p-3 shadow-sm lg:h-[calc(70%-0.75rem)] lg:min-h-0">
          <Dashboard />
        </div>
      </div>
    </div>
  );
};