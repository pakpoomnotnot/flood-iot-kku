import React from 'react';
// นำเข้าไอคอน CloudRainFill จาก Bootstrap Icons ใน React Icons
import { BsCloudRainFill } from 'react-icons/bs';

const RainfallWidget = () => {
  // ข้อมูลจำลองสำหรับแสดงผล
  const data = [
    { name: 'เทศบาลนคร', value: '2' },
    { name: 'บึงแก่นนคร', value: '1.6' },
    { name: 'บึงทุ่งสร้าง', value: '0.8' },
  ];

  return (
    // ลด p-2 เป็น p-1 และปรับ h-full เป็น h-auto เพื่อความกะทัดรัด 
    <div className="flex w-full h-auto items-center justify-center rounded-lg border border-none p-1 bg-white">
      <div className="flex flex-col w-full text-xs">
        
        {/* ส่วนหัว: ไอคอนและข้อความ */}
        <div className="flex flex-row items-start mb-1 pt-1"> 
          {/* ใช้ React Icon และลดขนาดจาก w-8 h-8 เป็น w-7 h-7 */}
          <BsCloudRainFill 
            className="w-7 h-7 mr-2" // ใช้สีน้ำเงินเข้มแทน #1d4ed8
          />
          <div className="flex flex-col text-sm font-semibold text-black leading-tight">
            <div className="whitespace-nowrap">ฝนสะสม 1 ชม. ที่ผ่านมา</div>
          </div>
        </div>
        
        <hr className="border-t border-[#f0f0f0] my-1" /> {/* ลด my-2 เป็น my-1 */}
        
        {/* ข้อมูลปริมาณฝน */}
        {data.map((item, index) => (
          <React.Fragment key={index}>
            {/* ลด py-1 เป็น py-0.5 */}
            <div className="flex flex-row items-center justify-between py-0.5"> 
              {/* ลด text-sm เป็น text-xs เพื่อลดความสูง */}
              <div className="text-black font-medium text-xs">{item.name}</div>
              {/* ปรับขนาดตัวอักษรและ padding ของค่าฝน */}
              <div className="bg-[#e0f2fe] text-[#0369a1] text-[0.65rem] font-bold px-1.5 py-[1px] rounded-md">
                {item.value}
              </div>
            </div>
            {/* Divider ระหว่างรายการ ยกเว้นรายการสุดท้าย */}
            {index < data.length - 1 && (
              <hr className="border-t border-[#f0f0f0] my-1" />
            )}
          </React.Fragment>
        ))}
        
      </div>
    </div>
  );
};

export default RainfallWidget;