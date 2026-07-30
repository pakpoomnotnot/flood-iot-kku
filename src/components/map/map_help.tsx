"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Waves,
  ArrowUp,
  MapPin,
  ShieldAlert,
  Info,
  ChevronRight,
  LayoutDashboard,
  AlertOctagon,
  Activity,
  Download,
  Droplet,
  FileText,
  RefreshCw,
} from "lucide-react";
import { generateOfficialPDFReport } from "./pdfGenerator";
import HecRasFinalCode from "./water-way";
import { LAKE_CONFIG, getPondStatusThai, type LakeId } from "@/lib/lake-thresholds";
import {
  getPipeLevelStatusThai,
  getRoadLevelStatusThai,
} from "@/lib/water-level-status";
import type { TelemetryApiResponse, TelemetryStationResult } from "@/lib/telemetry-types";
import {
  computeOverallSeverity,
  OVERALL_SEVERITY_TEXT,
  type OverallSeverity,
} from "@/lib/flood-overall-severity";

// Types
type TabId = "command" | "reports" | "drainage";

interface LakeApiItem {
  lake_id: string;
  name_th: string;
  status: "ok" | "error" | "no_data";
  water_level?: number;
  water_volume_m3?: number | null;
  capacity_pct?: number | null;
  date_time?: string;
}

// ─────────────────────────────────────────────
// ข้อมูลอ้างอิงคงที่ — แผนอพยพ/พื้นที่เสี่ยง (ข้อมูลภูมิศาสตร์/แผนปฏิบัติการของหน่วยงาน
// ไม่ใช่ค่าจากเซนเซอร์ จึงไม่มีฟีดข้อมูลจริงมาแทนที่ได้ ยกเว้นระดับความเสี่ยงของโซน B
// ที่อ้างอิงกับบึงแก่นนคร (Lake_03) ซึ่งคำนวณจากข้อมูลจริงด้านล่าง)
// ─────────────────────────────────────────────
export const evacuationZones = [
  {
    zoneName: "โซน A: ริมแม่น้ำชี",
    subDistricts: "ต.เมืองเก่า, ต.พระลับ",
    lakeRef: null as LakeId | null,
    itemHeight: "2.0 - 2.5 ม.",
    shelter: "รร.บ้านกุดกว้าง",
  },
  {
    zoneName: "โซน B: พื้นที่เศรษฐกิจ",
    subDistricts: "รอบบึงแก่นนคร, ถ.เหล่านาดี",
    lakeRef: "Lake_03" as LakeId | null,
    itemHeight: "1.0 - 1.5 ม.",
    shelter: "สนามกีฬากลาง",
  },
  {
    zoneName: "โซน C: พื้นที่ดอน",
    subDistricts: "ต.ศิลา, มข.",
    lakeRef: null as LakeId | null,
    itemHeight: "0.5 ม.",
    shelter: "-",
  },
];

export const emergencyContacts = [
  { name: "สายด่วน ปภ.", number: "1784" },
  { name: "เทศบาลนครขอนแก่น", number: "043-222-222" },
  { name: "หน่วยกู้ภัยสว่าง", number: "1669" },
];

const zoneRiskLabel = (level: OverallSeverity): { text: string; action: string } => {
  if (level === "CRITICAL") return { text: "CRITICAL", action: "อพยพทันที" };
  if (level === "WARNING") return { text: "WARNING", action: "เฝ้าระวังสูงสุด" };
  return { text: "WATCH", action: "ติดตามข่าวสาร" };
};

const StatusBadge: React.FC<{ level: OverallSeverity }> = ({ level }) => {
  const styles =
    level === "CRITICAL"
      ? "bg-red-50 text-red-700 border-red-200"
      : level === "WARNING"
      ? "bg-orange-50 text-orange-700 border-orange-200"
      : level === "WATCH"
      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
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
      สถานะ: {OVERALL_SEVERITY_TEXT[level]}
    </span>
  );
};

async function safeJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const FloodAdvisoryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("command");

  const [lakes, setLakes] = useState<LakeApiItem[]>([]);
  const [pipes, setPipes] = useState<TelemetryStationResult[]>([]);
  const [roads, setRoads] = useState<TelemetryStationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [lakeJson, pipeJson, roadJson] = await Promise.all([
      safeJson<{ lakes: LakeApiItem[] }>("/api/lake"),
      safeJson<TelemetryApiResponse>("/api/water/pipe"),
      safeJson<TelemetryApiResponse>("/api/water/road"),
    ]);
    setLakes(lakeJson?.lakes ?? []);
    setPipes(pipeJson?.stations ?? []);
    setRoads(roadJson?.stations ?? []);
    setLastFetched(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const overall = computeOverallSeverity(lakes, pipes, roads);

  const lakeRows = Object.keys(LAKE_CONFIG).map((lakeId) => {
    const lake = lakes.find((l) => l.lake_id === lakeId);
    const ok = lake?.status === "ok";
    return {
      location: lake?.name_th ?? lakeId,
      type: "แหล่งน้ำธรรมชาติ",
      level: ok ? `${lake!.water_level!.toFixed(2)} ม.รทก.` : "ไม่มีข้อมูล",
      status: ok ? getPondStatusThai(lakeId, lake!.water_level) : "ไม่มีข้อมูล",
    };
  });

  // จุดที่ระดับน้ำสูงสุด 4 อันดับแรก จากท่อระบายน้ำและถนน — ใช้แทนที่ "แผนดำเนินการ" จำลองเดิม
  const topMonitoring = [...pipes, ...roads]
    .filter((s) => s.status === "ok" && s.water_level_m != null)
    .sort((a, b) => (b.water_level_m ?? 0) - (a.water_level_m ?? 0))
    .slice(0, 4)
    .map((s) => {
      const isPipe = pipes.includes(s);
      const status = isPipe
        ? getPipeLevelStatusThai(s.water_level_m)
        : getRoadLevelStatusThai(s.water_level_m);
      return {
        location: s.name_th,
        kind: isPipe ? "ท่อระบายน้ำ" : "ผิวถนน",
        level: `${s.water_level_m!.toFixed(2)} ม.`,
        status,
      };
    });

  const guidelines = [
    "เตรียมกระสอบทรายอุดปิดท่อระบายน้ำป้องกันน้ำย้อน",
    "ห้ามขับรถเล็กผ่านเส้นทางที่มีน้ำท่วมสูงเกิน 30 ซม.",
    "ชาร์จแบตเตอรี่โทรศัพท์และไฟฉายให้พร้อมใช้งาน",
    "เตรียมยาสามัญและอาหารแห้งสำหรับ 3 วัน",
  ];

  const tabs = [
    {
      id: "command" as TabId,
      label: "ศูนย์บัญชาการน้ำและการสนับสนุนการตัดสินใจ",
      icon: LayoutDashboard,
    },
    { id: "reports" as TabId, label: "รายงาน PDF", icon: FileText },
    { id: "drainage" as TabId, label: "แผนผังการระบายน้ำ", icon: Activity },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await generateOfficialPDFReport();
    } finally {
      setIsGenerating(false);
    }
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
              {/* Live status bar */}
              <div className="flex items-center justify-between rounded-xl border-2 border-orange-100 bg-white px-4 py-2.5 shadow-sm">
                <StatusBadge level={overall.level} />
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  {lastFetched && (
                    <span>
                      อัปเดตล่าสุด: {lastFetched.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                    </span>
                  )}
                  <button
                    onClick={fetchAll}
                    disabled={loading}
                    className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 font-bold text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                  >
                    <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
                    รีเฟรช
                  </button>
                </div>
              </div>

              {/* Alert Banner */}
              <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <ShieldAlert size={100} />
                </div>
                <div className="relative z-10">
                  <h2 className="text-sm font-black text-red-700 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} className="animate-pulse" />
                    สถานะภาพรวมพื้นที่: {OVERALL_SEVERITY_TEXT[overall.level]}
                  </h2>
                  {overall.reasons.length > 0 ? (
                    <ul className="space-y-1">
                      {overall.reasons.slice(0, 5).map((r, i) => (
                        <li key={i} className="text-xs text-gray-700 border-l-4 border-red-400 pl-3 bg-white/50 py-1.5 rounded">
                          {r}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-700 border-l-4 border-green-400 pl-3 bg-white/50 py-2 rounded">
                      ระดับน้ำในบึง ท่อระบายน้ำ และผิวถนนทุกจุดที่ตรวจวัดได้อยู่ในเกณฑ์ปกติ
                    </p>
                  )}
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
                  {evacuationZones.map((z, i) => {
                    const lake = z.lakeRef ? lakes.find((l) => l.lake_id === z.lakeRef) : null;
                    const zoneLevel: OverallSeverity = z.lakeRef
                      ? (() => {
                          const s = getPondStatusThai(
                            z.lakeRef!,
                            lake?.status === "ok" ? lake.water_level : undefined,
                          );
                          if (s === "วิกฤต") return "CRITICAL";
                          if (s === "เตือนภัย") return "WARNING";
                          if (s === "เฝ้าระวัง") return "WATCH";
                          return "NORMAL";
                        })()
                      : "WATCH"; // ไม่มีเซนเซอร์อ้างอิงตรง — แสดงเฝ้าระวังเป็นค่าเริ่มต้นเชิงอนุรักษ์นิยม
                    const risk = zoneRiskLabel(zoneLevel);
                    return (
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
                              zoneLevel === "CRITICAL"
                                ? "bg-red-100 text-red-700"
                                : zoneLevel === "WARNING"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {risk.action}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 flex items-center gap-1 mb-2">
                          <MapPin size={12} /> {z.subDistricts}
                          {z.lakeRef && (
                            <span className="ml-1 text-gray-400">
                              (อ้างอิงระดับน้ำ{lake?.name_th ?? z.lakeRef} แบบเรียลไทม์)
                            </span>
                          )}
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
                    );
                  })}
                </div>
              </div>

              {/* Water Level Data — บึง (ข้อมูลจริง) */}
              <div className="rounded-xl border-2 border-amber-100 bg-white p-4 shadow-lg">
                <h3 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
                  <Droplet size={14} className="text-amber-600" /> ระดับน้ำในบึง (ข้อมูลจริงจากสถานีโทรมาตร)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                        <th className="px-3 py-2 text-left font-black rounded-tl-lg">
                          แหล่งน้ำ
                        </th>
                        <th className="px-3 py-2 text-center font-black">
                          ระดับน้ำ
                        </th>
                        <th className="px-3 py-2 text-left font-black rounded-tr-lg">
                          สถานะ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lakeRows.map((w, i) => (
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
                            {w.level}
                          </td>
                          <td className="px-3 py-2 text-gray-600">{w.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* จุดตรวจวัดที่ระดับน้ำสูงสุด (ท่อระบายน้ำ/ผิวถนน) — ข้อมูลจริง */}
              <div className="rounded-xl border-2 border-orange-100 bg-white overflow-hidden shadow-lg">
                <div className="bg-primary px-4 py-3 flex items-center gap-2 text-white">
                  <Waves size={16} />{" "}
                  <h3 className="text-sm font-black">จุดที่ระดับน้ำสูงสุด (ท่อระบายน้ำ/ผิวถนน)</h3>
                </div>
                <div className="divide-y">
                  {topMonitoring.length === 0 ? (
                    <div className="p-4 text-xs text-gray-400 text-center">ไม่มีข้อมูล</div>
                  ) : (
                    topMonitoring.map((p, i) => (
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
                          <span className="text-orange-700 font-bold">{p.kind}</span>
                          <ChevronRight size={12} />
                          <span>{p.level}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* Tab 2: PDF Reports */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-orange-100 bg-white p-4 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-light text-gray-800 flex items-center gap-2">
                    <FileText size={20} className="text-orange-600" />
                    รายงานสถานการณ์น้ำ PDF
                  </h3>
                </div>

                <div className="rounded-lg border border-dashed border-orange-200 bg-orange-50/40 p-6 text-center">
                  <FileText size={32} className="mx-auto text-orange-300 mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    ระบบยังไม่มีคลังรายงานย้อนหลัง — รายงานจะถูกสร้างขึ้นใหม่ทุกครั้งโดยใช้
                    <strong> ข้อมูลจริงล่าสุด</strong> จากสถานีโทรมาตร (บึง/ท่อระบายน้ำ/ถนน/ฝน)
                    พร้อมภาพแผนที่ดาวเทียมพื้นที่เสี่ยงน้ำท่วมล่าสุด
                  </p>
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="mt-3 inline-flex items-center gap-2 bg-primary hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-60"
                  >
                    <Download size={16} className={isGenerating ? "animate-bounce" : ""} />
                    <span>{isGenerating ? "กำลังสร้างรายงาน..." : "สร้างรายงาน PDF ล่าสุด"}</span>
                  </button>
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
