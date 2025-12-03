import React from "react";
// นำเข้าไอคอนสำหรับเขื่อนและน้ำ
import { FaSquareParking } from "react-icons/fa6";
import { FaWater } from "react-icons/fa";
import { LuDam } from "react-icons/lu";

const WaterVolumeWidget3 = () => {
  // ข้อมูลจำลอง
  const percentage = 82;
  const waterSource = "บึงแก่นนคร";
  const lastUpdated = "2025-11-04";

  // Component สำหรับไอคอนเขื่อน/น้ำที่เรียบง่าย
  const DamWaterIcon = () => (
    <div className="flex items-center justify-center relative w-7 h-7">
      {/* ส่วนเขื่อน (สีเทา) */}
      <FaSquareParking
        className="text-gray-600 w-5 h-5 absolute left-[-2px]"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* ส่วนน้ำ (ใช้ FaWater หรือไอคอนคลื่น) */}
      <FaWater className="text-[#00b0f0] w-4 h-4 absolute left-[6px] opacity-80" />
    </div>
  );

  return (
    // Outer container: ลด p-0 เป็น p-0
    <div className="flex w-full h-auto items-center justify-center rounded-lg border border-none p-0 bg-white">
      {/* ลด p-1 ภายในเป็น p-0.5 */}
      <div className="flex flex-col w-full text-xs items-center p-0.5">
        {/* ส่วนบน: ไอคอนและเปอร์เซ็นต์ */}
        <div className="flex flex-row items-center justify-center w-full mb-0">
          <LuDam className="w-8 h-8" />
          <span className="text-2xl font-bold text-[#00b0f0] ml-0.5">
            {" "}
            {/* ลด ml-1 เป็น ml-0.5 */}
            {percentage}%
          </span>
        </div>

        {/* ส่วนกลาง: ชื่อแหล่งน้ำ */}
        <div className="flex flex-col items-center leading-snug">
          <div className="text-xs font-semibold text-black">ปริมาณน้ำ</div>

          {/* ปรับให้เป็นบรรทัดเดียวถ้าชื่อไม่ยาวเกินไป และลดขนาด */}
          <div className="text-sm font-bold text-[#008c99] whitespace-nowrap text-center mt-0">
            {waterSource}
          </div>

          {/* ส่วนที่ถูกตัดในภาพ - ลดขนาดตัวอักษร */}
          <div className="text-[0.55rem] text-gray-500 mt-0.5 whitespace-nowrap">
            x,xxx,xxx ลบ.ม. (xx% ความจุ)
          </div>
        </div>

        {/* ส่วนล่าง: วันที่ล่าสุด */}
        <div className="text-[0.5rem] text-gray-500 mt-0.5">
          ล่าสุด {lastUpdated}
        </div>
      </div>
    </div>
  );
};

export default WaterVolumeWidget3;
