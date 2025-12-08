"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Waves,
  ArrowUp,
  MapPin,
  Megaphone,
  PhoneCall,
  ShieldAlert,
  Info,
  ChevronRight,
  Clock,
  LayoutDashboard,
  AlertOctagon,
  Activity
} from "lucide-react";

// --- Mock Data ---
const floodSituation = {
  announcementNo: "12/2568",
  date: "18 ธ.ค. 68",
  time: "15:00 น.",
  severityLevel: "CRITICAL",
  mainMessage: "แจ้งเตือนระดับน้ำล้นตลิ่ง ลุ่มน้ำชี และพื้นที่เศรษฐกิจ",
  detail: "ระดับน้ำมีแนวโน้มสูงขึ้น 5-10 ซม./ชม. ขอให้ประชาชนในพื้นที่เสี่ยงภัยปฏิบัติตามคำแนะนำ",
};

const drainagePlan = [
  { location: "บึงแก่นนคร", action: "เร่งระบายน้ำ", target: "สู่ห้วยพระคือ", status: "เดินเครื่อง 100%", priority: "high" },
  { location: "บึงทุ่งสร้าง", action: "หน่วงน้ำ", target: "รับน้ำตัวเมือง", status: "พร่องน้ำรอรับ", priority: "medium" },
  { location: "ปตร. D8 (ศรีฐาน)", action: "ปิดประตู", target: "กันน้ำหนุน", status: "ปิดสนิท", priority: "high" },
];

const evacuationZones = [
  {
    zoneName: "โซน A: ริมแม่น้ำชี",
    subDistricts: "ต.เมืองเก่า, ต.พระลับ",
    riskLevel: "CRITICAL",
    action: "อพยพทันที",
    itemHeight: "2.0 - 2.5 ม.",
    shelter: "รร.บ้านกุดกว้าง",
  },
  {
    zoneName: "โซน B: พื้นที่เศรษฐกิจ",
    subDistricts: "รอบบึงแก่นนคร, ถ.เหล่านาดี",
    riskLevel: "WARNING",
    action: "เฝ้าระวังสูงสุด",
    itemHeight: "1.0 - 1.5 ม.",
    shelter: "สนามกีฬากลาง",
  },
  {
    zoneName: "โซน C: พื้นที่ดอน",
    subDistricts: "ต.ศิลา, มข.",
    riskLevel: "WATCH",
    action: "ติดตามข่าวสาร",
    itemHeight: "0.5 ม.",
    shelter: "-",
  },
];

const emergencyContacts = [
  { name: "สายด่วน ปภ.", number: "1784" },
  { name: "เทศบาลนครขอนแก่น", number: "043-222-222" },
  { name: "หน่วยกู้ภัยสว่าง", number: "1669" },
];

// --- Sub-Components ---
const StatusBadge = ({ level }: { level: string }) => {
  const styles = level === "CRITICAL" 
    ? "bg-red-50 text-red-700 border-red-200" 
    : level === "WARNING" 
    ? "bg-orange-50 text-orange-700 border-orange-200" 
    : "bg-green-50 text-green-700 border-green-200";
    
  const text = level === "CRITICAL" ? "วิกฤต (แดง)" : level === "WARNING" ? "แจ้งเตือน (ส้ม)" : "เฝ้าระวัง (เขียว)";

  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold border ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${level === "CRITICAL" ? "bg-red-600 animate-pulse" : "bg-current"}`}></span>
      {text}
    </span>
  );
};

export default function FloodAdvisoryDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "zones" | "drainage">("overview");

  return (
    // แก้ไข 1: เปลี่ยน h-screen เป็น h-full เพื่อให้ยืดตาม Parent container พอดี ไม่ล้นจอ
    <div className="flex flex-col h-full w-full bg-white font-sans text-gray-900 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      
      {/* --- Compact Header --- */}
      <header className="shrink-0 border-b border-gray-100 bg-white px-3 py-2 z-20">
        <div className="mx-auto w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <ShieldAlert size={18} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-800 leading-tight">ศูนย์บัญชาการน้ำ</h1>
                <p className="text-[10px] text-gray-500">เทศบาลนครขอนแก่น | ฉบับที่ {floodSituation.announcementNo}</p>
              </div>
            </div>
            <div className="text-right">
              <StatusBadge level={floodSituation.severityLevel} />
              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-gray-400">
                <Clock size={10} />
                <span>{floodSituation.date} {floodSituation.time}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- Tab Navigation --- */}
      <div className="shrink-0 bg-gray-50/50 border-b border-gray-200 px-2 pt-1">
        <div className="mx-auto flex w-full gap-1">
          {[
            { id: "overview", label: "ภาพรวม", icon: LayoutDashboard },
            { id: "zones", label: "พื้นที่เสี่ยง", icon: AlertOctagon },
            { id: "drainage", label: "การระบายน้ำ", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-[11px] font-semibold transition-all relative ${
                activeTab === tab.id
                  ? "text-orange-600 bg-white border-t-2 border-x border-gray-200 border-t-orange-500 rounded-t-lg shadow-sm top-[1px]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-t-lg border border-transparent"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- Scrollable Content --- */}
      {/* แก้ไข 2: ใช้ flex-1 และ overflow-y-auto เพื่อให้ Scroll เฉพาะส่วนเนื้อหา */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-3">
        <div className="mx-auto w-full space-y-3 pb-4">
          
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === "overview" && (
            <>
              {/* Main Alert Card */}
              <div className="rounded-lg border border-red-100 bg-white p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                   <Megaphone size={80} />
                </div>
                <div className="relative z-10">
                  <h2 className="text-sm font-bold text-red-600 mb-1 flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    ประกาศแจ้งเตือนด่วน
                  </h2>
                  <p className="text-sm font-bold text-gray-900 leading-snug mb-2">
                    {floodSituation.mainMessage}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed border-l-2 border-red-200 pl-2">
                    {floodSituation.detail}
                  </p>
                </div>
              </div>

              {/* Guidelines Grid */}
              <div className="grid grid-cols-2 gap-2">
                 <div className="rounded-lg bg-white p-3 border border-gray-100 shadow-sm">
                    <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                       <ArrowUp size={14} />
                    </div>
                    <h3 className="text-xs font-bold text-gray-800">ยกของขึ้นที่สูง</h3>
                    <p className="text-[10px] text-gray-500 mt-1">1.5 - 2.5 เมตร (โซนแดง)</p>
                 </div>
                 <div className="rounded-lg bg-white p-3 border border-gray-100 shadow-sm">
                    <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                       <AlertTriangle size={14} />
                    </div>
                    <h3 className="text-xs font-bold text-gray-800">ตัดกระแสไฟ</h3>
                    <p className="text-[10px] text-gray-500 mt-1">ชั้น 1 ทั้งหมด (หากน้ำท่วม)</p>
                 </div>
              </div>

              {/* Official Guidelines List */}
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <h3 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                   <Info size={12} className="text-orange-500"/> ข้อควรปฏิบัติ
                </h3>
                <ul className="space-y-2">
                  {[
                    "เตรียมกระสอบทรายอุดปิดท่อระบายน้ำป้องกันน้ำย้อน",
                    "ห้ามขับรถเล็กผ่านเส้นทางที่มีน้ำท่วมสูงเกิน 30 ซม.",
                    "ชาร์จแบตเตอรี่โทรศัพท์และไฟฉายให้พร้อมใช้งาน",
                    "เตรียมยาสามัญและอาหารแห้งสำหรับ 3 วัน"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-gray-600">
                       <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-gray-400"></span>
                       {item}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* ================= TAB 2: ZONES ================= */}
          {activeTab === "zones" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                 <span className="text-xs font-bold text-gray-500">พื้นที่เฝ้าระวัง 3 โซน</span>
                 <span className="text-[10px] text-gray-400">ข้อมูลจาก ปภ.</span>
              </div>
              
              {evacuationZones.map((zone, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                       <div className={`h-2 w-2 rounded-full ${
                          zone.riskLevel === 'CRITICAL' ? 'bg-red-500' : 
                          zone.riskLevel === 'WARNING' ? 'bg-orange-500' : 'bg-yellow-400'
                       }`} />
                       <h3 className="text-xs font-bold text-gray-900">{zone.zoneName}</h3>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        zone.riskLevel === 'CRITICAL' ? 'bg-red-50 text-red-600' : 
                        zone.riskLevel === 'WARNING' ? 'bg-orange-50 text-orange-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                       {zone.riskLevel === 'CRITICAL' ? 'อพยพทันที' : zone.riskLevel === 'WARNING' ? 'เฝ้าระวัง' : 'ติดตามข่าว'}
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-gray-500 mb-3 border-b border-gray-50 pb-2">
                    <MapPin size={10} className="inline mr-1"/> {zone.subDistricts}
                  </p>

                  <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded p-2">
                    <div>
                       <span className="text-[9px] text-gray-400 block">ยกของสูง (ม.)</span>
                       <span className="text-xs font-bold text-gray-800">{zone.itemHeight}</span>
                    </div>
                    <div>
                       <span className="text-[9px] text-gray-400 block">จุดพักพิง</span>
                       <span className="text-xs font-bold text-gray-800 truncate block" title={zone.shelter}>
                          {zone.shelter}
                       </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ================= TAB 3: DRAINAGE & CONTACT ================= */}
          {activeTab === "drainage" && (
            <div className="space-y-3">
              {/* Drainage Cards */}
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div className="bg-orange-50/50 px-3 py-2 border-b border-gray-100 flex justify-between items-center">
                   <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Waves size={12} className="text-orange-500"/> สถานะการระบายน้ำ
                   </h3>
                </div>
                <div className="divide-y divide-gray-50">
                   {drainagePlan.map((plan, i) => (
                      <div key={i} className="p-3">
                         <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-gray-800">{plan.location}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                               plan.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                            }`}>{plan.status}</span>
                         </div>
                         <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                            <span className="text-orange-600 font-semibold">{plan.action}</span>
                            <ChevronRight size={10} />
                            <span>{plan.target}</span>
                         </div>
                      </div>
                   ))}
                </div>
              </div>

              {/* Emergency Contacts Compact */}
              <div className="rounded-lg bg-gray-900 p-3 shadow-md">
                 <h3 className="text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
                    <PhoneCall size={12} /> เบอร์โทรฉุกเฉิน
                 </h3>
                 <div className="space-y-1.5">
                    {emergencyContacts.map((contact, i) => (
                       <div key={i} className="flex items-center justify-between rounded bg-gray-800 px-3 py-2">
                          <span className="text-[11px] text-gray-300">{contact.name}</span>
                          <a href={`tel:${contact.number}`} className="text-sm font-bold text-green-400 hover:text-green-300">
                             {contact.number}
                          </a>
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}