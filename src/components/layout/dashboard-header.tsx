"use client";
import React from "react";
import Image from "next/image";
import { Wifi } from "lucide-react";

export const DashboardHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#ead0c7] bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center space-y-1">
        <div className="mt-2 flex flex-col items-center">
          <div className="flex flex-row space-x-2 bg-[#fff5f2] shadow-sm w-screen justify-center">
            <div className="flex flex-row items-center gap-3">
              <Image
                src="/uni.png"
                alt="UNI Logo"
                width={60}
                height={60}
                className="object-contain drop-shadow-sm"
                priority
              />
              {/* <Separator
                orientation="vertical"
                className="h-12 bg-[#e1c2b9]"
              /> */}
              <Image
                src="/w_ch.png"
                alt="KKU Logo"
                width={35}
                height={35}
                className="object-contain drop-shadow-sm"
                priority
              />
              {/* <Separator
                orientation="vertical"
                className="h-12 bg-[#e1c2b9]"
              /> */}
              <Image
                src="/tsri.svg"
                alt="KKU Logo"
                width={35}
                height={35}
                className="object-contain drop-shadow-sm"
                priority
              />
              {/* <Separator
                orientation="vertical"
                className="h-12 bg-[#e1c2b9]"
              /> */}
              <Image
                src="/kku.png"
                alt="KKU Logo"
                width={60}
                height={60}
                className="object-contain drop-shadow-sm -ml-4"
                priority
              />
            </div>
            <div className="flex flex-col items-center px-2">
              <h1 className="text-2xl font-bold leading-tight text-[#2c120c]">
                ระบบการเตือนภัยและแนวทางการป้องกันน้ำท่วมในเขตเมืองขอนแก่น
              </h1>
              <h2 className="text-sm text-[#6f4a41]">
                Flood Warning System and Prevention Measures in Khon Kaen City
              </h2>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-row items-center justify-between border-t border-[#ead0c7] px-4 py-3 text-[#2c120c]">
          <div className="flex flex-col text-center">
            <div className="text-sm font-semibold text-[#4b1f17]">
              ปริมาณน้ำฝนสะสมสูงสุด 1 ชม.
            </div>
            <div className="text-2xl font-bold text-[#a73824]">0</div>
            <div className="text-xs text-[#8c6a61]">มม.</div>
            <div className="text-xs text-[#a73824]">เทศบาลนครขอนแก่น</div>
          </div>
          <div className="flex flex-col text-center">
            <div className="text-sm font-semibold text-[#4b1f17]">
              ปริมาณน้ำฝนสะสมสูงสุด 3 ชม.
            </div>
            <div className="text-2xl font-bold text-[#a73824]">0</div>
            <div className="text-xs text-[#8c6a61]">มม.</div>
            <div className="text-xs text-[#a73824]">บึงหนองโคตร</div>
          </div>
          <div className="flex flex-col text-center">
            <div className="text-sm font-semibold text-[#4b1f17]">
              ปริมาณน้ำฝนสะสมสูงสุด 24 ชม.
            </div>
            <div className="text-2xl font-bold text-[#a73824]">0</div>
            <div className="text-xs text-[#8c6a61]">มม.</div>
            <div className="text-xs text-[#a73824]">
              ศูนย์อุตุฯ ภาคตะวันออกเฉียงเหนือตอนบน
            </div>
          </div>
          <div className="flex flex-col text-center">
            <div className="text-sm font-semibold text-[#4b1f17]">
              อุณหภูมิในรอบสัปดาห์
            </div>
            <div className="flex flex-col text-center rounded-xl border border-[#edd9d4] bg-white px-3 py-1 shadow-sm">
              <div className="mb-1 text-[11px] font-semibold text-[#2b120d]">
                อุณหภูมิในรอบสัปดาห์
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold text-[#a73824]">33</div>
                  <div className="flex items-center gap-0.5 text-[10px] text-[#7c584e]">
                    <span>สูงสุด</span>
                    <span className="text-[#d96a4c]">▲</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold text-[#1f6f8b]">23</div>
                  <div className="flex items-center gap-0.5 text-[10px] text-[#7c584e]">
                    <span>ต่ำสุด</span>
                    <span className="text-gray-400">▼</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col text-center">
            <div className="text-sm font-semibold text-[#4b1f17]">
              ปริมาณน้ำในบึงทั้งหมด
            </div>
            <div className="text-2xl font-bold text-[#a73824]">1,617</div>
            <div className="text-xs text-[#8c6a61]">(64%) ลบ.ซม.</div>
          </div>
          <div className="flex flex-col items-center text-center rounded-xl border border-[#edd9d4] bg-[#fff8f5] px-3 py-2 shadow-sm">
            <div className="text-sm font-semibold text-[#4b1f17]">
              สถานสถานีโทรมาตร
            </div>
            <div className="text-[10px] text-[#8c6a61]">ออนไลน์</div>
            <div className="text-lg font-bold text-[#a73824]">27/29</div>
            <div className="flex items-center gap-1 text-[10px] text-green-600">
              <span className="font-medium">Telemetry Active</span>
              <Wifi className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};