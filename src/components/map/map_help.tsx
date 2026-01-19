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
  Activity,
  Download,
  CloudRain,
  Droplet,
  FileText,
  Calendar,
  ChevronDown,
  Eye,
} from "lucide-react";
import { generateOfficialPDFReport } from "./pdfGenerator";
import HecRasFinalCode from "./water-way";

// Types
type SeverityLevel = "CRITICAL" | "WARNING" | "WATCH";
type RiskLevel = "CRITICAL" | "WARNING" | "WATCH";
type Priority = "high" | "medium" | "low";
type TabId = "command" | "reports" | "drainage";

interface PDFReport {
  id: string;
  date: string;
  time: string;
  title: string;
  severity: SeverityLevel;
  fileSize: string;
}

// Mock Data
export const floodSituation = {
  announcementNo: "12/2568",
  date: "18 ธ.ค. 68",
  time: "15:00 น.",
  severityLevel: "CRITICAL" as SeverityLevel,
  mainMessage: "แจ้งเตือนระดับน้ำล้นตลิ่ง ลุ่มน้ำชี และพื้นที่เศรษฐกิจ",
  detail:
    "ระดับน้ำมีแนวโน้มสูงขึ้น 5-10 ซม./ชม. ขอให้ประชาชนในพื้นที่เสี่ยงภัยปฏิบัติตามคำแนะนำ",
};

// Mock PDF Reports (รายงานย้อนหลัง 30 วัน)
export const pdfReports: PDFReport[] = [
  {
    id: "001",
    date: "18 ธ.ค. 2568",
    time: "15:00",
    title: "รายงานสถานการณ์น้ำท่วม - สถานะวิกฤต",
    severity: "CRITICAL",
    fileSize: "2.4 MB",
  },
  {
    id: "002",
    date: "18 ธ.ค. 2568",
    time: "09:00",
    title: "รายงานสถานการณ์น้ำท่วม - เฝ้าระวัง",
    severity: "WARNING",
    fileSize: "2.1 MB",
  },
  {
    id: "003",
    date: "17 ธ.ค. 2568",
    time: "18:00",
    title: "รายงานสถานการณ์น้ำท่วม - สถานะวิกฤต",
    severity: "CRITICAL",
    fileSize: "2.3 MB",
  },
  {
    id: "004",
    date: "17 ธ.ค. 2568",
    time: "12:00",
    title: "รายงานสถานการณ์น้ำท่วม - เฝ้าระวัง",
    severity: "WARNING",
    fileSize: "2.0 MB",
  },
  {
    id: "005",
    date: "17 ธ.ค. 2568",
    time: "06:00",
    title: "รายงานสถานการณ์น้ำท่วม - เฝ้าระวัง",
    severity: "WARNING",
    fileSize: "1.9 MB",
  },
  {
    id: "006",
    date: "16 ธ.ค. 2568",
    time: "20:00",
    title: "รายงานสถานการณ์น้ำท่วม - สถานะปกติ",
    severity: "WATCH",
    fileSize: "1.8 MB",
  },
  {
    id: "007",
    date: "16 ธ.ค. 2568",
    time: "14:00",
    title: "รายงานสถานการณ์น้ำท่วม - เฝ้าระวัง",
    severity: "WARNING",
    fileSize: "2.2 MB",
  },
  {
    id: "008",
    date: "16 ธ.ค. 2568",
    time: "08:00",
    title: "รายงานสถานการณ์น้ำท่วม - สถานะปกติ",
    severity: "WATCH",
    fileSize: "1.7 MB",
  },
  {
    id: "009",
    date: "15 ธ.ค. 2568",
    time: "18:00",
    title: "รายงานสถานการณ์น้ำท่วม - สถานะปกติ",
    severity: "WATCH",
    fileSize: "1.6 MB",
  },
  {
    id: "010",
    date: "15 ธ.ค. 2568",
    time: "10:00",
    title: "รายงานสถานการณ์น้ำท่วม - สถานะปกติ",
    severity: "WATCH",
    fileSize: "1.5 MB",
  },
  {
    id: "011",
    date: "14 ธ.ค. 2568",
    time: "16:00",
    title: "รายงานสถานการณ์น้ำท่วม - เฝ้าระวัง",
    severity: "WARNING",
    fileSize: "2.0 MB",
  },
  {
    id: "012",
    date: "14 ธ.ค. 2568",
    time: "08:00",
    title: "รายงานสถานการณ์น้ำท่วม - สถานะปกติ",
    severity: "WATCH",
    fileSize: "1.4 MB",
  },
  {
    id: "013",
    date: "13 ธ.ค. 2568",
    time: "18:00",
    title: "รายงานสถานการณ์น้ำท่วม - สถานะวิกฤต",
    severity: "CRITICAL",
    fileSize: "2.6 MB",
  },
  {
    id: "014",
    date: "13 ธ.ค. 2568",
    time: "12:00",
    title: "รายงานสถานการณ์น้ำท่วม - เฝ้าระวัง",
    severity: "WARNING",
    fileSize: "2.1 MB",
  },
  {
    id: "015",
    date: "13 ธ.ค. 2568",
    time: "06:00",
    title: "รายงานสถานการณ์น้ำท่วม - สถานะปกติ",
    severity: "WATCH",
    fileSize: "1.5 MB",
  },
];

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
];

export const waterLevelData = [
  {
    location: "บึงแก่นนคร",
    type: "แหล่งน้ำธรรมชาติ",
    level: "ไม่มีข้อมูล",
    note: "เร่งระบายน้ำสู่ห้วยพระคือ",
  },
  {
    location: "บึงทุ่งสร้าง",
    type: "แหล่งน้ำธรรมชาติ",
    level: "ไม่มีข้อมูล",
    note: "พร่องน้ำรอรับ",
  },
  {
    location: "ท่อระบายน้ำหลัก ซอย 1",
    type: "โครงสร้างระบาย",
    level: "ไม่มีข้อมูล",
    note: "-",
  },
  {
    location: "ท่อระบายน้ำหลัก ซอย 2",
    type: "โครงสร้างระบาย",
    level: "ไม่มีข้อมูล",
    note: "-",
  },
];

export const drainagePlan = [
  {
    location: "บึงแก่นนคร",
    action: "เร่งระบายน้ำ",
    target: "สู่ห้วยพระคือ",
    status: "เดินเครื่อง 100%",
    priority: "high" as Priority,
  },
  {
    location: "บึงทุ่งสร้าง",
    action: "หน่วงน้ำ",
    target: "รับน้ำตัวเมือง",
    status: "พร่องน้ำรอรับ",
    priority: "medium" as Priority,
  },
  {
    location: "ปตร. D8 (ศรีฐาน)",
    action: "ปิดประตู",
    target: "กันน้ำหนุน",
    status: "ปิดสนิท",
    priority: "high" as Priority,
  },
];

export const evacuationZones = [
  {
    zoneName: "โซน A: ริมแม่น้ำชี",
    subDistricts: "ต.เมืองเก่า, ต.พระลับ",
    riskLevel: "CRITICAL" as RiskLevel,
    action: "อพยพทันที",
    itemHeight: "2.0 - 2.5 ม.",
    shelter: "รร.บ้านกุดกว้าง",
  },
  {
    zoneName: "โซน B: พื้นที่เศรษฐกิจ",
    subDistricts: "รอบบึงแก่นนคร, ถ.เหล่านาดี",
    riskLevel: "WARNING" as RiskLevel,
    action: "เฝ้าระวังสูงสุด",
    itemHeight: "1.0 - 1.5 ม.",
    shelter: "สนามกีฬากลาง",
  },
  {
    zoneName: "โซน C: พื้นที่ดอน",
    subDistricts: "ต.ศิลา, มข.",
    riskLevel: "WATCH" as RiskLevel,
    action: "ติดตามข่าวสาร",
    itemHeight: "0.5 ม.",
    shelter: "-",
  },
];

export const emergencyContacts = [
  { name: "สายด่วน ปภ.", number: "1784" },
  { name: "เทศบาลนครขอนแก่น", number: "043-222-222" },
  { name: "หน่วยกู้ภัยสว่าง", number: "1669" },
];

const StatusBadge: React.FC<{ level: SeverityLevel }> = ({ level }) => {
  const styles =
    level === "CRITICAL"
      ? "bg-red-50 text-red-700 border-red-200"
      : level === "WARNING"
      ? "bg-orange-50 text-orange-700 border-orange-200"
      : "bg-green-50 text-green-700 border-green-200";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[12px] font-bold border ${styles}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          level === "CRITICAL" ? "bg-red-600 animate-pulse" : "bg-current"
        }`}
      ></span>
      สถานะ: {level}
    </span>
  );
};

const FloodAdvisoryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("command");

  const tabs = [
    {
      id: "command" as TabId,
      label: "ศูนย์บัญชาการน้ำและการสนับสนุนการตัดสินใจ",
      icon: LayoutDashboard,
    },
    { id: "reports" as TabId, label: "รายงาน PDF ย้อนหลัง", icon: FileText },
    { id: "drainage" as TabId, label: "แผนผังการระบายน้ำ", icon: Activity },
  ];

  const guidelines = [
    "เตรียมกระสอบทรายอุดปิดท่อระบายน้ำป้องกันน้ำย้อน",
    "ห้ามขับรถเล็กผ่านเส้นทางที่มีน้ำท่วมสูงเกิน 30 ซม.",
    "ชาร์จแบตเตอรี่โทรศัพท์และไฟฉายให้พร้อมใช้งาน",
    "เตรียมยาสามัญและอาหารแห้งสำหรับ 3 วัน",
  ];

  const handleDownloadReport = (reportId: string) => {
    console.log(`Downloading report ${reportId}`);
    generateOfficialPDFReport();
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Tabs Navigation */}
      <div className="shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-3 pt-2">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-bold transition-all relative ${
                activeTab === tab.id
                  ? "text-primary bg-white border-t-3 border-x border-orange-200 border-t-primary rounded-t-xl shadow-md top-[1px]"
                  : "text-gray-500 hover:text-orange-700 hover:bg-orange-50 rounded-t-xl"
              }`}
            >
              <tab.icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto w-full max-w-6xl space-y-4 pb-6">
          {/* Tab 1: Command Center */}
          {activeTab === "command" && (
            <>
              {/* Alert Banner */}
              <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Megaphone size={100} />
                </div>
                <div className="relative z-10">
                  <h2 className="text-sm font-black text-red-700 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} className="animate-pulse" />
                    ประกาศแจ้งเตือนด่วน
                  </h2>
                  <p className="text-base font-bold text-gray-900 mb-3">
                    {floodSituation.mainMessage}
                  </p>
                  <p className="text-xs text-gray-700 border-l-4 border-red-400 pl-3 bg-white/50 py-2 rounded">
                    {floodSituation.detail}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-white p-4 border-2 border-orange-100 shadow-lg">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md">
                    <ArrowUp size={18} />
                  </div>
                  <h3 className="text-sm font-black text-gray-800">
                    ยกของขึ้นที่สูง
                  </h3>
                  <p className="text-xs text-gray-600 mt-1.5">
                    1.5 - 2.5 เมตร (โซนแดง)
                  </p>
                </div>
                <div className="rounded-xl bg-white p-4 border-2 border-orange-100 shadow-lg">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md">
                    <AlertTriangle size={18} />
                  </div>
                  <h3 className="text-sm font-black text-gray-800">
                    ตัดกระแสไฟ
                  </h3>
                  <p className="text-xs text-gray-600 mt-1.5">
                    ชั้น 1 ทั้งหมด (หากน้ำท่วม)
                  </p>
                </div>
              </div>

              {/* Guidelines */}
              <div className="rounded-xl border-2 border-orange-100 bg-white p-4 shadow-lg">
                <h3 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
                  <Info size={14} className="text-orange-600" /> ข้อควรปฏิบัติ
                </h3>
                <ul className="space-y-2.5">
                  {guidelines.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-xs text-gray-700"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500"></span>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Evacuation Zones */}
              <div className="rounded-xl border-2 border-amber-100 bg-white p-4 shadow-lg">
                <h3 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
                  <AlertOctagon size={14} className="text-amber-600" />{" "}
                  พื้นที่เสี่ยง
                </h3>
                <div className="space-y-3">
                  {evacuationZones.map((z, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-xs font-black text-gray-900">
                          {z.zoneName}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full font-black ${
                            z.riskLevel === "CRITICAL"
                              ? "bg-red-100 text-red-700"
                              : z.riskLevel === "WARNING"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {z.action}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 flex items-center gap-1 mb-2">
                        <MapPin size={12} /> {z.subDistricts}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white rounded px-2 py-1">
                          <span className="text-[10px] text-gray-500 block">
                            ยกของสูง
                          </span>
                          <span className="font-black text-gray-800">
                            {z.itemHeight}
                          </span>
                        </div>
                        <div className="bg-white rounded px-2 py-1">
                          <span className="text-[10px] text-gray-500 block">
                            จุดพักพิง
                          </span>
                          <span className="font-black text-gray-800">
                            {z.shelter}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Water Level Data */}
              <div className="rounded-xl border-2 border-amber-100 bg-white p-4 shadow-lg">
                <h3 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
                  <Droplet size={14} className="text-amber-600" /> ระดับน้ำ
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                        <th className="px-3 py-2 text-left font-black rounded-tl-lg">
                          แหล่งน้ำ
                        </th>
                        <th className="px-3 py-2 text-center font-black">
                          ประเภท
                        </th>
                        <th className="px-3 py-2 text-left font-black rounded-tr-lg">
                          หมายเหตุ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {waterLevelData.map((w, i) => (
                        <tr
                          key={i}
                          className={
                            i % 2 === 0 ? "bg-amber-50/30" : "bg-white"
                          }
                        >
                          <td className="px-3 py-2 font-bold text-gray-800">
                            {w.location}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-600">
                            {w.type}
                          </td>
                          <td className="px-3 py-2 text-gray-600">{w.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Drainage Status */}
              <div className="rounded-xl border-2 border-orange-100 bg-white overflow-hidden shadow-lg">
                <div className="bg-primary px-4 py-3 flex items-center gap-2 text-white">
                  <Waves size={16} />{" "}
                  <h3 className="text-sm font-black">สถานะการระบายน้ำ</h3>
                </div>
                <div className="divide-y">
                  {drainagePlan.map((p, i) => (
                    <div key={i} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-black text-gray-800">
                          {p.location}
                        </span>
                        <span className="text-[10px] px-2 py-1 rounded-full font-black bg-orange-100 text-orange-700">
                          {p.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="text-orange-700 font-bold">
                          {p.action}
                        </span>
                        <ChevronRight size={12} />
                        <span>{p.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Contacts */}
              {/* <div className="rounded-xl bg-gradient-to-br from-orange-900 to-red-900 p-4 shadow-xl">
                <h3 className="text-sm font-black text-orange-100 mb-3 flex items-center gap-2">
                  <PhoneCall size={16} /> เบอร์โทรฉุกเฉิน
                </h3>
                <div className="space-y-2">
                  {emergencyContacts.map((c, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-orange-800/50 px-4 py-3">
                      <span className="text-xs text-orange-100 font-bold">{c.name}</span>
                      <a href={`tel:${c.number}`} className="text-base font-black text-yellow-300 hover:text-yellow-200 transition-colors">
                        {c.number}
                      </a>
                    </div>
                  ))}
                </div>
              </div> */}
            </>
          )}

          {/* Tab 2: PDF Reports */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-orange-100 bg-white p-4 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-light text-gray-800 flex items-center gap-2">
                    <FileText size={20} className="text-orange-600" />
                    รายงานสถานการณ์ PDF ย้อนหลัง
                  </h3>
                  <button
                    onClick={generateOfficialPDFReport}
                    className="flex items-center gap-2 bg-primary hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition-all active:scale-95"
                  >
                    <Download size={16} />
                    <span>สร้างรายงานใหม่</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {pdfReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all group"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            report.severity === "CRITICAL"
                              ? "bg-red-100 text-red-600"
                              : report.severity === "WARNING"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          <FileText size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-light text-gray-800 mb-1">
                            {report.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {report.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {report.time} น.
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>{report.fileSize}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full font-black ${
                            report.severity === "CRITICAL"
                              ? "bg-red-100 text-red-700"
                              : report.severity === "WARNING"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {report.severity}
                        </span>
                        <button
                          onClick={() => handleDownloadReport(report.id)}
                          className="flex items-center gap-1 px-3 py-2 bg-primary hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Download size={14} />
                          ดาวน์โหลด
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Drainage Diagram */}
          {activeTab === "drainage" && <HecRasFinalCode />}
        </div>
      </main>
    </div>
  );
};

export default FloodAdvisoryDashboard;