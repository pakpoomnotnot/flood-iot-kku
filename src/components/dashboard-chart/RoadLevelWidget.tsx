"use client";

import React, { useMemo } from "react";
import { ShieldAlert } from "lucide-react";
import { useTelemetryStations } from "./water_value/useTelemetryStations";
import { getRoadLevelStatusThai } from "@/lib/water-level-status";

const RoadLevelWidget = () => {
  const { stations, isLoading } = useTelemetryStations("road");

  const topLevels = useMemo(() => {
    return stations
      .filter((s) => s.status === "ok" && s.water_level_m != null)
      .sort((a, b) => (b.water_level_m ?? 0) - (a.water_level_m ?? 0))
      .slice(0, 3);
  }, [stations]);

  const hasData = topLevels.length > 0;
  const hasFlood = topLevels.some((s) => (s.water_level_m ?? 0) > 0);

  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg border border-none bg-white p-0.5 lg:p-1">
      <div className="flex w-full flex-col text-xs">
        <div className="mb-0.5 flex flex-row items-start pt-0.5 lg:mb-1 lg:pt-1">
          <ShieldAlert className="mr-1 h-4 w-4 text-[#EF4444] lg:mr-2 lg:h-7 lg:w-7" />
          <div className="flex flex-col text-[0.6rem] font-semibold leading-tight text-black lg:text-sm">
            <div className="whitespace-nowrap">ระดับน้ำบนถนน (สูงสุด)</div>
          </div>
        </div>

        <hr className="my-0.5 border-t border-[#f0f0f0] lg:my-1" />

        {isLoading && (
          <div className="flex items-center justify-center py-4 text-[0.55rem] text-gray-500 lg:text-xs">
            กำลังโหลดข้อมูล...
          </div>
        )}

        {!isLoading && !hasData && (
          <div className="flex items-center justify-center py-4 text-[0.55rem] font-medium text-gray-600 lg:text-xs">
            ไม่พบข้อมูลสถานี
          </div>
        )}

        {!isLoading && hasData && !hasFlood && (
          <div className="flex items-center justify-center py-4 text-[0.55rem] font-medium text-emerald-700 lg:text-xs">
            ทุกสถานี — ไม่มีน้ำท่วมถนน
          </div>
        )}

        {!isLoading &&
          hasData &&
          topLevels
            .filter((s) => (s.water_level_m ?? 0) > 0)
            .map((item, index, arr) => (
              <React.Fragment key={item.station_id}>
                <div className="flex flex-row items-center justify-between py-0 lg:py-0.5">
                  <div className="max-w-[65%] truncate text-[0.55rem] font-medium text-black lg:text-xs">
                    {item.name_th}
                  </div>
                  <div className="rounded-md bg-[#fee2e2] px-1 py-[0.5px] text-[0.5rem] font-bold text-[#b91c1c] lg:px-1.5 lg:text-[0.65rem]">
                    {item.water_level_m!.toFixed(2)} ม.
                  </div>
                </div>
                <div className="text-[0.45rem] text-gray-500 lg:text-[0.55rem]">
                  {getRoadLevelStatusThai(item.water_level_m)}
                </div>
                {index < arr.length - 1 && (
                  <hr className="my-0.5 border-t border-[#f0f0f0] lg:my-1" />
                )}
              </React.Fragment>
            ))}
      </div>
    </div>
  );
};

export default RoadLevelWidget;
