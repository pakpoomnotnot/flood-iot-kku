"use client";
import React from 'react';
import Image from 'next/image';
import { Thermometer, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const DashboardHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm z-50 sticky top-0">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Title and Logos */}
          <div className="flex items-center gap-3">
            {/* KKU Logo */}
            <div className="flex items-center">
              <Image
                src="/kku.png"
                alt="KKU Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            
            {/* Logos */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">วช.</span>
              </div>
              <div className="text-xs font-semibold text-gray-700">NRCT</div>
            </div>
            
            {/* Main Title */}
            <div className="border-l border-gray-300 pl-3">
              <h1 className="text-xs font-bold text-gray-900 leading-tight">
                ระบบการเตือนภัยและแนวทางการป้องกันน้ำท่วมในเขตเมืองขอนแก่น
                <br />
                <span className="text-[10px] text-gray-600 font-normal">
                  Flood Warning System and Prevention Measures in Khon Kaen City
                </span>
              </h1>
            </div>
          </div>

          {/* Right: Statistics */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Max Rainfall 1hr */}
            <div className="text-[10px] min-w-0">
              <div className="text-gray-500 mb-0.5 whitespace-nowrap">ปริมาณฝนสะสมสูงสุด 1 ชั่วโมง</div>
              <div className="font-semibold text-gray-900 truncate">เทศบาลนครขอนแก่น</div>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Max Rainfall 3hr */}
            <div className="text-[10px] min-w-0">
              <div className="text-gray-500 mb-0.5 whitespace-nowrap">ปริมาณฝนสะสมสูงสุด 3 ชั่วโมง</div>
              <div className="font-semibold text-gray-900 truncate">บึงหนองโคตร</div>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Max Rainfall 24hr */}
            <div className="text-[10px] min-w-0">
              <div className="text-gray-500 mb-0.5 whitespace-nowrap">ปริมาณฝนสะสมสูงสุด 24 ชั่วโมง</div>
              <div className="font-semibold text-gray-900 truncate">ศูนย์อุตุฯ ภาคตะวันออกเฉียงเหนือตอนบน</div>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Temperature */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded">
              <Thermometer className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
              <div className="text-[10px]">
                <div className="text-gray-500 mb-0.5 whitespace-nowrap">อุณหภูมิในรอบสัปดาห์</div>
                <div className="font-semibold text-gray-900 whitespace-nowrap">
                  สูงสุด 33 <span className="text-gray-500">ต่ำสุด 23</span>
                </div>
              </div>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Khon Kaen Province */}
            <div className="px-2 py-1 bg-blue-50 rounded border border-blue-100">
              <div className="text-[10px]">
                <div className="text-blue-700 font-semibold mb-0.5 whitespace-nowrap">จังหวัดขอนแก่น</div>
                <div className="text-gray-900 font-bold whitespace-nowrap">
                  ปริมาณน้ำในบึงทั้งหมด <span className="text-blue-600">1,617 (64%)</span>
                </div>
              </div>
            </div>

            {/* Telemetry Status */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded border border-green-100">
              <Wifi className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
              <div className="text-[10px]">
                <div className="text-gray-500 mb-1 whitespace-nowrap">สถานสถานีโทรมาตร</div>
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-white border-gray-200">
                    พร้อมใช้ 93%
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-white border-gray-200">
                    ออนไลน์ 27/29
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-green-100 text-green-700 border-green-200">
                    Telemetry Active
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

