"use client";

import React, { useState } from "react";
import {
  AlertTriangle, Waves, ArrowUp, MapPin, Megaphone, PhoneCall,
  ShieldAlert, Info, ChevronRight, Clock, LayoutDashboard,
  AlertOctagon, Activity, Download, CloudRain, Droplet,
} from "lucide-react";
import { generateOfficialPDFReport } from "./pdfGenerator";

// Types
type SeverityLevel = "CRITICAL" | "WARNING" | "WATCH";
type RiskLevel = "CRITICAL" | "WARNING" | "WATCH";
type Priority = "high" | "medium" | "low";
type TabId = "overview" | "rainfall" | "waterlevel" | "zones" | "drainage";

// Mock Data
export const floodSituation = {
  announcementNo: "12/2568",
  date: "18 ธ.ค. 68",
  time: "15:00 น.",
  severityLevel: "CRITICAL" as SeverityLevel,
  mainMessage: "แจ้งเตือนระดับน้ำล้นตลิ่ง ลุ่มน้ำชี และพื้นที่เศรษฐกิจ",
  detail: "ระดับน้ำมีแนวโน้มสูงขึ้น 5-10 ซม./ชม. ขอให้ประชาชนในพื้นที่เสี่ยงภัยปฏิบัติตามคำแนะนำ",
};

export const rainStations = [
  {
    stationCode: "BKN",
    nameTh: "บึงแก่นนคร",
    lat: 16.419,
    long: 102.836,
    past24h: "ไม่มีข้อมูล",
    forecast24h: "ไม่มีข้อมูล",
    forecast72h: "ไม่มีข้อมูล",
  },
  {
    stationCode: "BNK",
    nameTh: "บึงหนองโคตร",
    lat: 16.429,
    long: 102.805,
    past24h: "ไม่มีข้อมูล",
    forecast24h: "ไม่มีข้อมูล",
    forecast72h: "ไม่มีข้อมูล",
  },
  {
    stationCode: "BSV",
    nameTh: "หมู่บ้านสีวลี",
    lat: 16.436,
    long: 102.785,
    past24h: "ไม่มีข้อมูล",
    forecast24h: "ไม่มีข้อมูล",
    forecast72h: "ไม่มีข้อมูล",
  },
  {
    stationCode: "BTS",
    nameTh: "บึงทุ่งสร้าง",
    lat: 16.452,
    long: 102.855,
    past24h: "ไม่มีข้อมูล",
    forecast24h: "ไม่มีข้อมูล",
    forecast72h: "ไม่มีข้อมูล",
  },
  {
    stationCode: "KKC_BL",
    nameTh: "โรงเรียนสอนคนตาบอด",
    lat: 16.442,
    long: 102.808,
    past24h: "ไม่มีข้อมูล",
    forecast24h: "ไม่มีข้อมูล",
    forecast72h: "ไม่มีข้อมูล",
  },
  {
    stationCode: "KKC_MUN",
    nameTh: "เทศบาลนครขอนแก่น",
    lat: 16.429,
    long: 102.829,
    past24h: "ไม่มีข้อมูล",
    forecast24h: "ไม่มีข้อมูล",
    forecast72h: "ไม่มีข้อมูล",
  },
  {
    stationCode: "KKC_SP",
    nameTh: "อุทยานวิทยาศาสตร์ มหาวิทยาลัยขอนแก่น",
    lat: 16.456,
    long: 102.819,
    past24h: "ไม่มีข้อมูล",
    forecast24h: "ไม่มีข้อมูล",
    forecast72h: "ไม่มีข้อมูล",
  },
  {
    stationCode: "MKO_MUN",
    nameTh: "เทศบาลเมืองเก่า",
    lat: 16.402,
    long: 102.788,
    past24h: "ไม่มีข้อมูล",
    forecast24h: "ไม่มีข้อมูล",
    forecast72h: "ไม่มีข้อมูล",
  },
  {
    stationCode: "NEU",
    nameTh: "มหาวิทยาลัยภาคตะวันออกเฉียงเหนือ",
    lat: 16.422,
    long: 102.814,
    past24h: "ไม่มีข้อมูล",
    forecast24h: "ไม่มีข้อมูล",
    forecast72h: "ไม่มีข้อมูล",
  },
  {
    stationCode: "NLP",
    nameTh: "หนองเลิงเปือย",
    lat: 16.43,
    long: 102.877,
    past24h: "ไม่มีข้อมูล",
    forecast24h: "ไม่มีข้อมูล",
    forecast72h: "ไม่มีข้อมูล",
  },
  {
    stationCode: "RMUTI",
    nameTh: "มหาวิทยาลัยราชมงคลอีสาน วิทยาเขตขอนแก่น",
    lat: 16.434,
    long: 102.861,
    past24h: "ไม่มีข้อมูล",
    forecast24h: "ไม่มีข้อมูล",
    forecast72h: "ไม่มีข้อมูล",
  },
  {
    stationCode: "SIL_MUN",
    nameTh: "เทศบาลเมืองศิลา",
    lat: 16.473,
    long: 102.849,
    past24h: "ไม่มีข้อมูล",
    forecast24h: "ไม่มีข้อมูล",
    forecast72h: "ไม่มีข้อมูล",
  },
  {
    stationCode: "SNK_HOSP",
    nameTh: "โรงพยาบาลศรีนครินทร์",
    lat: 16.466,
    long: 102.831,
    past24h: "ไม่มีข้อมูล",
    forecast24h: "ไม่มีข้อมูล",
    forecast72h: "ไม่มีข้อมูล",
  },
  {
    stationCode: "UNE_MC",
    nameTh: "ศูนย์อุตุนิยมวิทยาภาคตะวันออกเฉียงเหนือตอนบน",
    lat: 16.463,
    long: 102.786,
    past24h: "ไม่มีข้อมูล",
    forecast24h: "ไม่มีข้อมูล",
    forecast72h: "ไม่มีข้อมูล",
  },
  {
    stationCode: "UNE_SH",
    nameTh: "บ้านพักพนักงานอุตุฯ",
    lat: 16.446,
    long: 102.832,
    past24h: "ไม่มีข้อมูล",
    forecast24h: "ไม่มีข้อมูล",
    forecast72h: "ไม่มีข้อมูล",
  },
];

export const waterLevelData = [
  { location: "บึงแก่นนคร", type: "แหล่งน้ำธรรมชาติ", level: "ไม่มีข้อมูล", note: "เร่งระบายน้ำสู่ห้วยพระคือ" },
  { location: "บึงทุ่งสร้าง", type: "แหล่งน้ำธรรมชาติ", level: "ไม่มีข้อมูล", note: "พร่องน้ำรอรับ" },
  { location: "ท่อระบายน้ำหลัก ซอย 1", type: "โครงสร้างระบาย", level: "ไม่มีข้อมูล", note: "-" },
  { location: "ท่อระบายน้ำหลัก ซอย 2", type: "โครงสร้างระบาย", level: "ไม่มีข้อมูล", note: "-" },
];

export const drainagePlan = [
  { location: "บึงแก่นนคร", action: "เร่งระบายน้ำ", target: "สู่ห้วยพระคือ", status: "เดินเครื่อง 100%", priority: "high" as Priority },
  { location: "บึงทุ่งสร้าง", action: "หน่วงน้ำ", target: "รับน้ำตัวเมือง", status: "พร่องน้ำรอรับ", priority: "medium" as Priority },
  { location: "ปตร. D8 (ศรีฐาน)", action: "ปิดประตู", target: "กันน้ำหนุน", status: "ปิดสนิท", priority: "high" as Priority },
];

export const evacuationZones = [
  { zoneName: "โซน A: ริมแม่น้ำชี", subDistricts: "ต.เมืองเก่า, ต.พระลับ", riskLevel: "CRITICAL" as RiskLevel, action: "อพยพทันที", itemHeight: "2.0 - 2.5 ม.", shelter: "รร.บ้านกุดกว้าง" },
  { zoneName: "โซน B: พื้นที่เศรษฐกิจ", subDistricts: "รอบบึงแก่นนคร, ถ.เหล่านาดี", riskLevel: "WARNING" as RiskLevel, action: "เฝ้าระวังสูงสุด", itemHeight: "1.0 - 1.5 ม.", shelter: "สนามกีฬากลาง" },
  { zoneName: "โซน C: พื้นที่ดอน", subDistricts: "ต.ศิลา, มข.", riskLevel: "WATCH" as RiskLevel, action: "ติดตามข่าวสาร", itemHeight: "0.5 ม.", shelter: "-" },
];

export const emergencyContacts = [
  { name: "สายด่วน ปภ.", number: "1784" },
  { name: "เทศบาลนครขอนแก่น", number: "043-222-222" },
  { name: "หน่วยกู้ภัยสว่าง", number: "1669" },
];

const StatusBadge: React.FC<{ level: SeverityLevel }> = ({ level }) => {
  const styles = level === "CRITICAL" ? "bg-red-50 text-red-700 border-red-200" : 
                 level === "WARNING" ? "bg-orange-50 text-orange-700 border-orange-200" : 
                 "bg-green-50 text-green-700 border-green-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[12px] font-bold border ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${level === "CRITICAL" ? "bg-red-600 animate-pulse" : "bg-current"}`}></span>
      สถานะ: {level}
    </span>
  );
};

const FloodAdvisoryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabs = [
    { id: "overview" as TabId, label: "ภาพรวม", icon: LayoutDashboard },
    { id: "rainfall" as TabId, label: "สถานีน้ำฝน", icon: CloudRain },
    { id: "waterlevel" as TabId, label: "ระดับน้ำ", icon: Droplet },
    { id: "zones" as TabId, label: "พื้นที่เสี่ยง", icon: AlertOctagon },
    { id: "drainage" as TabId, label: "การระบายน้ำ", icon: Activity },
  ];

  const guidelines = [
    "เตรียมกระสอบทรายอุดปิดท่อระบายน้ำป้องกันน้ำย้อน",
    "ห้ามขับรถเล็กผ่านเส้นทางที่มีน้ำท่วมสูงเกิน 30 ซม.",
    "ชาร์จแบตเตอรี่โทรศัพท์และไฟฉายให้พร้อมใช้งาน",
    "เตรียมยาสามัญและอาหารแห้งสำหรับ 3 วัน",
  ];

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="shrink-0 border-b-2 border-orange-200 bg-white/90 backdrop-blur-sm px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h1 className="text-base font-black text-gray-800">ศูนย์บัญชาการน้ำ</h1>
              <p className="text-[11px] text-gray-500 font-medium">เทศบาลนครขอนแก่น | ฉบับที่ {floodSituation.announcementNo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <StatusBadge level={floodSituation.severityLevel} />
              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-gray-400">
                <Clock size={11} />
                <span>{floodSituation.date} {floodSituation.time}</span>
              </div>
            </div>
            <button onClick={generateOfficialPDFReport} className="flex items-center gap-2 bg-primary hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-lg transition-all active:scale-95">
              <Download size={16} />
              <span className="hidden sm:inline">ส่งออก PDF</span>
            </button>
          </div>
        </div>
      </header>

      <div className="shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-3 pt-2">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-[11px] font-bold transition-all relative ${activeTab === tab.id ? "text-orange-600 bg-white border-t-3 border-x border-gray-200 border-t-orange-500 rounded-t-xl shadow-md top-[1px]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-xl"}`}>
              <tab.icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto w-full max-w-6xl space-y-4 pb-6">
          {activeTab === "overview" && (
            <>
              <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><Megaphone size={100} /></div>
                <div className="relative z-10">
                  <h2 className="text-sm font-black text-red-700 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} className="animate-pulse" />ประกาศแจ้งเตือนด่วน
                  </h2>
                  <p className="text-base font-bold text-gray-900 mb-3">{floodSituation.mainMessage}</p>
                  <p className="text-xs text-gray-700 border-l-4 border-red-400 pl-3 bg-white/50 py-2 rounded">{floodSituation.detail}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-white p-4 border-2 border-orange-100 shadow-lg">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md"><ArrowUp size={18} /></div>
                  <h3 className="text-sm font-black text-gray-800">ยกของขึ้นที่สูง</h3>
                  <p className="text-xs text-gray-600 mt-1.5">1.5 - 2.5 เมตร (โซนแดง)</p>
                </div>
                <div className="rounded-xl bg-white p-4 border-2 border-orange-100 shadow-lg">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md"><AlertTriangle size={18} /></div>
                  <h3 className="text-sm font-black text-gray-800">ตัดกระแสไฟ</h3>
                  <p className="text-xs text-gray-600 mt-1.5">ชั้น 1 ทั้งหมด (หากน้ำท่วม)</p>
                </div>
              </div>

              <div className="rounded-xl border-2 border-blue-100 bg-white p-4 shadow-lg">
                <h3 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
                  <Info size={14} className="text-blue-600" /> ข้อควรปฏิบัติ
                </h3>
                <ul className="space-y-2.5">
                  {guidelines.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500"></span>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {activeTab === "rainfall" && (
            <div className="overflow-x-auto rounded-xl border-2 border-blue-100 bg-white shadow-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-3 py-2 text-left font-black">รหัส</th>
                    <th className="px-3 py-2 text-left font-black">ชื่อสถานี</th>
                    <th className="px-3 py-2 text-center font-black">24 ชม.ที่ผ่าน</th>
                  </tr>
                </thead>
                <tbody>
                  {rainStations.map((s, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-blue-50/30" : "bg-white"}>
                      <td className="px-3 py-2 font-bold text-gray-800">{s.stationCode}</td>
                      <td className="px-3 py-2 font-medium text-gray-700">{s.nameTh}</td>
                      <td className="px-3 py-2 text-center text-gray-500 italic">{s.past24h}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "waterlevel" && (
            <div className="overflow-x-auto rounded-xl border-2 border-cyan-100 bg-white shadow-lg">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
                    <th className="px-4 py-3 text-left text-xs font-black">แหล่งน้ำ</th>
                    <th className="px-4 py-3 text-center text-xs font-black">ประเภท</th>
                    <th className="px-4 py-3 text-left text-xs font-black">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {waterLevelData.map((w, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-cyan-50/30" : "bg-white"}>
                      <td className="px-4 py-3 text-xs font-bold text-gray-800">{w.location}</td>
                      <td className="px-4 py-3 text-center text-xs text-gray-600">{w.type}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{w.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "zones" && (
            <div className="space-y-3">
              {evacuationZones.map((z, i) => (
                <div key={i} className="rounded-xl border-2 border-gray-200 bg-white p-4 shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-black text-gray-900">{z.zoneName}</h3>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-black ${z.riskLevel === "CRITICAL" ? "bg-red-100 text-red-700" : z.riskLevel === "WARNING" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {z.action}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 flex items-center gap-1"><MapPin size={12} /> {z.subDistricts}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
                    <div><span className="text-[10px] text-gray-500 block font-bold">ยกของสูง</span><span className="text-sm font-black">{z.itemHeight}</span></div>
                    <div><span className="text-[10px] text-gray-500 block font-bold">จุดพักพิง</span><span className="text-sm font-black">{z.shelter}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "drainage" && (
            <>
              <div className="rounded-xl border-2 border-green-100 bg-white overflow-hidden shadow-lg">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 flex items-center gap-2 text-white">
                  <Waves size={16} /> <h3 className="text-sm font-black">สถานะการระบายน้ำ</h3>
                </div>
                <div className="divide-y">
                  {drainagePlan.map((p, i) => (
                    <div key={i} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-black text-gray-800">{p.location}</span>
                        <span className="text-[10px] px-2 py-1 rounded-full font-black bg-green-100 text-green-700">{p.status}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="text-green-700 font-bold">{p.action}</span>
                        <ChevronRight size={12} />
                        <span>{p.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-xl">
                <h3 className="text-sm font-black text-gray-200 mb-3 flex items-center gap-2">
                  <PhoneCall size={16} /> เบอร์โทรฉุกเฉิน
                </h3>
                <div className="space-y-2">
                  {emergencyContacts.map((c, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-gray-700 px-4 py-3">
                      <span className="text-xs text-gray-200 font-bold">{c.name}</span>
                      <a href={`tel:${c.number}`} className="text-base font-black text-emerald-400">{c.number}</a>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default FloodAdvisoryDashboard;