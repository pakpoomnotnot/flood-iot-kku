"use client";

import React, { FC } from "react";

const RADAR_URL = "https://radartambon.pages.dev/composite";

const MapComponentRadar: FC = () => {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-xl bg-gray-900">
      <div className="relative min-h-0 flex-1">
        <iframe
          src={RADAR_URL}
          title="เรดาร์ระดับตำบล"
          className="h-full w-full border-0"
          loading="lazy"
          allowFullScreen
        />
      </div>

      {/* ที่มาอ้างอิง */}
      <div className="flex-shrink-0 border-t border-[#ead0c7] bg-white px-3 py-1.5">
        <a
          href={RADAR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-gray-400 transition-colors hover:text-[#a73824] hover:underline"
        >
          ข้อมูลเรดาร์ระดับตำบลโดย VTSC METOffice, กรมอุตุนิยมวิทยา (TMD) · เปิดในแท็บใหม่
        </a>
      </div>
    </div>
  );
};

export default MapComponentRadar;
