import React from "react";
// นำเข้าไอคอนสำหรับเขื่อนและน้ำ
import { FaSquareParking } from "react-icons/fa6";
import { FaWater } from "react-icons/fa";
import { LuDam } from "react-icons/lu";

const WaterVolumeWidget3 = () => {
  // ข้อมูลจำลอง
  const percentage =  "ไม่พบข้อมูล";
  const waterSource = "บึงหนองโคตร";
  const lastUpdated = "2025-11-04";

  // Component สำหรับไอคอนเขื่อน/น้ำที่เรียบง่าย
  const DamWaterIcon = () => (
    <div className="flex items-center justify-center relative w-5 h-5 sm:w-7 sm:h-7">
      {/* ส่วนเขื่อน (สีเทา) */}
      <FaSquareParking
        className="text-gray-600 w-4 h-4 sm:w-5 sm:h-5 absolute left-[-2px]"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* ส่วนน้ำ (ใช้ FaWater หรือไอคอนคลื่น) */}
      <FaWater className="text-[#00b0f0] w-3 h-3 sm:w-4 sm:h-4 absolute left-[4px] sm:left-[6px] opacity-80" />
    </div>
  );

  return (
    // Outer container: รองรับขนาดหน้าจอต่างๆ
    <div className="flex w-full h-full items-center justify-center rounded-lg border border-none p-0 bg-white">
      {/* Inner container: ปรับ padding ตามขนาดหน้าจอ */}
      <div className="flex flex-col w-full h-full text-xs items-center justify-center p-0 lg:p-1">
        {/* ส่วนบน: ไอคอนและเปอร์เซ็นต์ */}
        <div className="flex flex-row items-center justify-center w-full mb-0 lg:mb-0.5">
          <LuDam className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="text-sm lg:text-base font-bold text-[#00b0f0] ml-0.5">
            {percentage}
            {/* % */}
          </span>
        </div>

        {/* ส่วนกลาง: ชื่อแหล่งน้ำ */}
        <div className="flex flex-col items-center leading-tight">
          <div className="text-[0.5rem] lg:text-[0.6rem] font-semibold text-black">
            ปริมาณน้ำ
          </div>

          {/* ชื่อแหล่งน้ำ - ปรับขนาดตามหน้าจอ */}
          <div className="text-[0.6rem] lg:text-[0.7rem] font-bold text-[#008c99] whitespace-nowrap text-center mt-0">
            {waterSource}
          </div>

          {/* ข้อมูลปริมาณน้ำ - ปรับขนาดให้เล็กลงบนมือถือ */}
          <div className="text-[0.4rem] lg:text-[0.5rem] text-gray-500 mt-0 whitespace-nowrap">
            x,xxx,xxx ลบ.ม. (xx% ความจุ)
          </div>
        </div>

        {/* ส่วนล่าง: วันที่ล่าสุด */}
        <div className="text-[0.35rem] lg:text-[0.45rem] text-gray-500 mt-0 lg:mt-0.5">
          ล่าสุด {lastUpdated}
        </div>
      </div>
    </div>
  );
};

export default WaterVolumeWidget3;