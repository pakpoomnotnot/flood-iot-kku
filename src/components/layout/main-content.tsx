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
    <div className="flex h-full w-full flex-row gap-3 bg-[#fff8f5] p-4">
      <div className="flex h-full w-[40%] flex-col space-y-3">
        <div className="flex h-1/2 flex-col gap-3">
          <div className="flex h-1/2 flex-col rounded-xl border border-[#f0cfc4] bg-gradient-to-br from-[#a73824]/80 to-[#f4a259]/70 shadow-sm">
            <div className="flex h-[20%] w-full items-center rounded-t-xl bg-[#a73824]/20 px-3">
              <span className="text-xs font-semibold text-white drop-shadow">
                พื้นที่เฝ้าระวังพิเศษ 48 ชั่วโมง ล่วงหน้า
              </span>
            </div>
            <div className="flex h-full items-center justify-center bg-white/60 px-3 text-center text-xs text-[#5f3a32]">
              ไม่มีพื้นที่เสี่ยงน้ำท่วมจากฝนตกสะสม
            </div>
          </div>
          <div className="flex h-1/2 flex-col rounded-xl border border-[#f3d9c9] bg-gradient-to-br from-[#b44b2d]/80 to-[#f7b267]/60 shadow-sm">
            <div className="flex h-[20%] w-full items-center rounded-t-xl bg-[#f4a259]/20 px-3">
              <span className="text-xs font-semibold text-white drop-shadow">
                พื้นที่เฝ้าระวังพิเศษ 72 ชั่วโมง ล่วงหน้า
              </span>
            </div>
            <div className="flex h-full items-center justify-center bg-white/60 px-3 text-center text-xs text-[#5f3a32]">
              ไม่มีพื้นที่เสี่ยงน้ำท่วมจากฝนตกสะสม
            </div>
          </div>
        </div>
        <div className="h-1/2 w-full overflow-hidden rounded-xl border border-[#ead0c7] bg-white shadow-sm">
          {mapComponent && <div className="h-full w-full">{mapComponent}</div>}
        </div>
      </div>
      <div className="h-full w-full">
        <div className="flex h-[30%] w-full flex-row rounded-xl border border-[#ead0c7] bg-white px-4 py-3 shadow-sm gap-2">
          <div className="flex w-1/2 h-full flex-row items-center justify-center text-sm text-[#a0938c] gap-2">
            <div className="flex flex-1  h-full  items-center justify-center rounded-lg border border-[#ead0c7] p-2 bg-white">
              <WaterVolumeWidget />
            </div>
            <div className="flex flex-1 h-full  items-center justify-center rounded-lg border border-[#ead0c7] p-2 bg-white">
              <WaterVolumeWidget2 />
            </div>
            <div className="flex flex-1  h-full items-center justify-center rounded-lg border border-[#ead0c7] p-2 bg-white">
              <WaterVolumeWidget3 />
            </div>
          </div>

          <div className="flex w-1/2 h-full flex-row items-center justify-center text-sm text-[#a0938c] gap-2">
            <div className="flex flex-1  h-full  items-center justify-center rounded-lg border border-[#ead0c7] p-2 bg-white">
              <RainfallWidget />
            </div>
            <div className="flex flex-1 h-full  items-center justify-center rounded-lg border border-[#ead0c7] p-0 bg-white">
              <div className="relative h-full w-full overflow-hidden rounded-lg border border-[#ead0c7] bg-slate-900 shadow-inner">
                <KhonKaenMap />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 h-[calc(70%-0.75rem)] rounded-xl border border-[#ead0c7] bg-white p-3 shadow-sm">
          <Dashboard />
        </div>
      </div>
    </div>
  );
};
