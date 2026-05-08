"use client";
import React from "react";
import { LuDam } from "react-icons/lu";
import { useLakeData } from "./useLakeData";

const WaterVolumeWidget3 = () => {
  const { getLake } = useLakeData();
  const lake = getLake("Lake_05");

  const ok  = lake?.status === "ok";
  const pct = ok && lake.capacity_pct   != null ? `${lake.capacity_pct.toFixed(1)}%`   : "ไม่พบข้อมูล";
  const vol = ok && lake.water_volume_m3 != null
    ? lake.water_volume_m3 >= 1_000_000
      ? `${(lake.water_volume_m3 / 1_000_000).toFixed(3)} ล้าน ลบ.ม.`
      : `${lake.water_volume_m3.toLocaleString("th-TH", { maximumFractionDigits: 0 })} ลบ.ม.`
    : "x,xxx,xxx ลบ.ม.";
  const capPct  = ok && lake.capacity_pct   != null ? `${lake.capacity_pct.toFixed(1)}%` : "xx%";
  const updated = ok && lake.date_time
    ? new Date(lake.date_time).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
    : "ไม่พบข้อมูล";

  return (
    <div className="flex w-full h-full items-center justify-center rounded-lg border border-none p-0 bg-white">
      <div className="flex flex-col w-full h-full text-xs items-center justify-center p-0 lg:p-1">
        <div className="flex flex-row items-center justify-center w-full mb-0 lg:mb-0.5">
          <LuDam className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="text-sm lg:text-base font-bold text-[#00b0f0] ml-0.5">{pct}</span>
        </div>
        <div className="flex flex-col items-center leading-tight">
          <div className="text-[0.5rem] lg:text-[0.6rem] font-semibold text-black">ปริมาณน้ํา</div>
          <div className="text-[0.6rem] lg:text-[0.7rem] font-bold text-[#008c99] whitespace-nowrap text-center mt-0">
            บึงหนองโคตร
          </div>
          <div className="text-[0.4rem] lg:text-[0.5rem] text-gray-500 mt-0 whitespace-nowrap">
            {vol} ({capPct} ความจุ)
          </div>
        </div>
        <div className="text-[0.35rem] lg:text-[0.45rem] text-gray-500 mt-0 lg:mt-0.5">
          ล่าสุด {updated}
        </div>
      </div>
    </div>
  );
};

export default WaterVolumeWidget3;