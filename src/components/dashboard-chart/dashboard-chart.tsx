// components/Dashboard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Waves,
  Cloud,
  CloudRain,
  CloudDrizzle,
  XCircle,
} from "lucide-react";

/* ----------------------------
   สีของหมวดหมู่ — ระบบสีเดียวกันทุก chart
   ---------------------------- */
const COLOR = {
  critical: "#d32f2f",
  warning:  "#ef6c00",
  watch:    "#fbc02d",
  normal:   "#2e7d32",
  nodata:   "#9e9e9e",
};

/* ----------------------------
   maxLevel และ watchThreshold ของแต่ละบึง
   (ตาม LAKE_THRESHOLDS ใน map_swamp.tsx)
   freeboard = maxLevel − water_level
   วิกฤต   : freeboard < 0.50 ม.
   เตือนภัย : freeboard < 1.00 ม.
   เฝ้าระวัง: freeboard < watchFB  (Lake_05 = 1.75, อื่นๆ = 1.50)
   ปกติ    : freeboard >= watchFB
   ---------------------------- */
const LAKE_CONFIG: Record<string, { maxLevel: number; watchFB: number }> = {
  Lake_02: { maxLevel: 150.0, watchFB: 1.50 },
  Lake_03: { maxLevel: 152.0, watchFB: 1.50 },
  Lake_05: { maxLevel: 155.0, watchFB: 1.75 },
  Lake_06: { maxLevel: 151.5, watchFB: 1.50 },
};

type PondStatus = "critical" | "warning" | "watch" | "normal" | "nodata";

function getPondStatus(lakeId: string, waterLevel: number | undefined): PondStatus {
  const cfg = LAKE_CONFIG[lakeId];
  if (!cfg || waterLevel == null || isNaN(waterLevel) || waterLevel === 0) return "nodata";
  const fb = cfg.maxLevel - waterLevel;
  if (fb < 0.50)      return "critical";
  if (fb < 1.00)      return "warning";
  if (fb < cfg.watchFB) return "watch";
  return "normal";
}

/* ----------------------------
   Interface ข้อมูล API บึง
   ---------------------------- */
interface LakeApiItem {
  lake_id:      string;
  status:       "ok" | "error" | "no_data";
  water_level?: number;
}
interface LakesApiResponse {
  fetched_at: string;
  count:      number;
  lakes:      LakeApiItem[];
}

/* ----------------------------
   Icon Components
   ---------------------------- */
const WaterIcon = ({ level }: { level: number }) => {
  const size = 16;
  if (level === 5) return (
    <div className="flex items-center gap-0">
      <Waves size={size} color={COLOR.critical} strokeWidth={2.5} />
      <Waves size={size} color={COLOR.critical} strokeWidth={2.5} className="-ml-2" />
      <Waves size={size} color={COLOR.critical} strokeWidth={2.5} className="-ml-2" />
    </div>
  );
  if (level === 4) return (
    <div className="flex items-center gap-0">
      <Waves size={size} color={COLOR.warning} strokeWidth={2.5} />
      <Waves size={size} color={COLOR.warning} strokeWidth={2.5} className="-ml-2" />
    </div>
  );
  if (level === 3) return <Waves size={size} color={COLOR.watch}    strokeWidth={2.5} />;
  if (level === 2) return <Waves size={size} color={COLOR.normal}   strokeWidth={2.5} />;
  if (level === 1) return (
    <div className="flex items-center gap-0">
      <Waves size={size} color={COLOR.critical} strokeWidth={2.5} />
      <Waves size={size} color={COLOR.critical} strokeWidth={2.5} className="-ml-2" />
    </div>
  );
  return <XCircle size={size} color={COLOR.nodata} strokeWidth={2} />;
};

const RainIcon = ({ level }: { level: number }) => {
  const size = 16;
  if (level === 4) return (
    <div className="flex items-center gap-0">
      <CloudRain size={size} color={COLOR.critical} strokeWidth={2.5} />
      <CloudRain size={size} color={COLOR.critical} strokeWidth={2.5} className="-ml-2" />
    </div>
  );
  if (level === 3) return <CloudRain   size={size} color={COLOR.warning} strokeWidth={2.5} />;
  if (level === 2) return <CloudDrizzle size={size} color={COLOR.watch}   strokeWidth={2.5} />;
  if (level === 1) return <Cloud        size={size} color={COLOR.normal}  strokeWidth={2.5} />;
  return <XCircle size={size} color={COLOR.nodata} strokeWidth={2} />;
};

const StatusIcon = ({ level }: { level: number }) => {
  const size = 16;
  if (level === 5) return (
    <div className="flex items-center gap-0">
      <Waves size={size} color={COLOR.critical} strokeWidth={2.5} />
      <Waves size={size} color={COLOR.critical} strokeWidth={2.5} className="-ml-2" />
      <Waves size={size} color={COLOR.critical} strokeWidth={2.5} className="-ml-2" />
    </div>
  );
  if (level === 4) return (
    <div className="flex items-center gap-0">
      <Waves size={size} color={COLOR.warning} strokeWidth={2.5} />
      <Waves size={size} color={COLOR.warning} strokeWidth={2.5} className="-ml-2" />
    </div>
  );
  if (level === 3) return <Waves size={size} color={COLOR.watch}  strokeWidth={2.5} />;
  if (level === 2) return <Waves size={size} color={COLOR.normal} strokeWidth={2.5} />;
  return <XCircle size={size} color={COLOR.nodata} strokeWidth={2} />;
};

/* ----------------------------
   Initial (fallback) data
   ---------------------------- */
const initialPondData = [
  { name: "วิกฤต",       value: 0, color: COLOR.critical, iconLevel: 5 },
  { name: "เตือนภัย",    value: 0, color: COLOR.warning,  iconLevel: 4 },
  { name: "เฝ้าระวัง",   value: 0, color: COLOR.watch,    iconLevel: 3 },
  { name: "ปกติ",        value: 0, color: COLOR.normal,   iconLevel: 2 },
  { name: "ไม่มีข้อมูล", value: 0, color: COLOR.nodata,   iconLevel: 0 },
];

const initialRainData = [
  { name: "วิกฤต",       value: 0, color: COLOR.critical, rainLevel: 4 },
  { name: "เตือนภัย",    value: 0, color: COLOR.warning,  rainLevel: 3 },
  { name: "เฝ้าระวัง",   value: 0, color: COLOR.watch,    rainLevel: 2 },
  { name: "ปกติ",        value: 0, color: COLOR.normal,   rainLevel: 1 },
  { name: "ไม่มีข้อมูล", value: 0, color: COLOR.nodata,   rainLevel: 0 },
];

const initialPipeData = [
  { name: "วิกฤต",       value: 0, color: COLOR.critical, iconLevel: 5 },
  { name: "แจ้งเตือน",   value: 0, color: COLOR.warning,  iconLevel: 4 },
  { name: "เฝ้าระวัง",   value: 0, color: COLOR.watch,    iconLevel: 3 },
  { name: "ปกติ",        value: 0, color: COLOR.normal,   iconLevel: 2 },
  { name: "ไม่มีข้อมูล", value: 0, color: COLOR.nodata,   iconLevel: 0 },
];

const initialRoadData = [
  { name: "วิกฤต",       value: 0, color: COLOR.critical, iconLevel: 5 },
  { name: "แจ้งเตือน",   value: 0, color: COLOR.warning,  iconLevel: 4 },
  { name: "เฝ้าระวัง",   value: 0, color: COLOR.watch,    iconLevel: 3 },
  { name: "ปกติ",        value: 0, color: COLOR.normal,   iconLevel: 2 },
  { name: "ไม่มีข้อมูล", value: 0, color: COLOR.nodata,   iconLevel: 0 },
];

/* ----------------------------
   Donut component
   ---------------------------- */
const Donut = ({ data }: { data: any[] }) => {
  const filtered    = data.filter((d) => d.value > 0);
  const isEmpty     = filtered.length === 0;
  const displayData = isEmpty ? [{ value: 1, color: COLOR.nodata }] : filtered;

  return (
    <div className="h-[90px] w-[90px] sm:h-[100px] sm:w-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={displayData}
            dataKey="value"
            innerRadius="55%"
            outerRadius="95%"
            paddingAngle={isEmpty ? 0 : 2}
            isAnimationActive={false}
          >
            {displayData.map((item, i) => (
              <Cell key={i} fill={item.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ----------------------------
   Card (generic legend)
   ---------------------------- */
const Card = ({ title, subtitle, data, type }: any) => (
  <div className="flex h-full flex-col rounded-xl border border-[#ead0c7] bg-white p-1 shadow-sm">
    <p className="text-center text-xs font-semibold text-[#2c120c]">{title}</p>
    <p className="text-center text-[10px] text-[#8a6458]">{subtitle}</p>

    <div className="mt-2 flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:justify-center sm:gap-3">
      <div className="flex justify-center">
        <Donut data={data} />
      </div>

      <div className="grid w-auto gap-1 text-xs sm:w-auto sm:gap-1.5">
        {data.map((item: any, i: number) => (
          <div key={i} className="flex items-center gap-1 sm:gap-1.5">
            <div className="flex w-6 justify-center sm:w-7">
              {type === "rain" ? (
                <RainIcon level={item.rainLevel ?? 0} />
              ) : (
                <StatusIcon level={item.iconLevel ?? 0} />
              )}
            </div>
            <span className="w-24 whitespace-nowrap text-[10px] text-[#4c3b37] sm:text-[11px]">
              {item.name}
            </span>
            <span
              className="flex h-4 min-w-[20px] items-center justify-center rounded-full text-[9px] font-semibold text-white sm:min-w-[24px] sm:text-[10px]"
              style={{ backgroundColor: item.color }}
            >
              {item.value}
            </span>
            <span className="text-[9px] text-[#8a6458] sm:text-[10px]">สถานี</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ----------------------------
   Rain Card with Tabs
   ---------------------------- */
const RainCard = ({
  title,
  totalStations,
  dailyData,
  hourlyData,
}: {
  title:         string;
  totalStations: number;
  dailyData:     any[];
  hourlyData:    any[];
}) => {
  const [activeTab, setActiveTab] = useState<"daily" | "hourly">("daily");
  const data = activeTab === "daily" ? dailyData : hourlyData;

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#ead0c7] bg-white p-1 shadow-sm">
      <p className="text-center text-xs font-semibold text-[#2c120c]">{title}</p>

      {/* Tabs */}
      <div className="mt-1 flex justify-center gap-1">
        <button
          onClick={() => setActiveTab("daily")}
          className={`rounded-full px-3 py-0.5 text-[10px] font-semibold transition-colors ${
            activeTab === "daily"
              ? "bg-[#ef6c00] text-white"
              : "bg-[#f5ede9] text-[#8a6458] hover:bg-[#ead0c7]"
          }`}
        >
          รายวัน
        </button>
        <button
          onClick={() => setActiveTab("hourly")}
          className={`rounded-full px-3 py-0.5 text-[10px] font-semibold transition-colors ${
            activeTab === "hourly"
              ? "bg-[#1565c0] text-white"
              : "bg-[#f5ede9] text-[#8a6458] hover:bg-[#ead0c7]"
          }`}
        >
          รายชั่วโมง
        </button>
      </div>

      <div className="mt-1.5 flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:justify-center sm:gap-3">
        <div className="flex justify-center">
          <Donut data={data} />
        </div>

        <div className="grid w-auto gap-1 text-xs sm:w-auto sm:gap-1.5">
          {data.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-1 sm:gap-1.5">
              <div className="flex w-6 justify-center sm:w-7">
                <RainIcon level={item.rainLevel ?? 0} />
              </div>
              <span className="w-24 whitespace-nowrap text-[10px] text-[#4c3b37] sm:text-[11px]">
                {item.name}
              </span>
              <span
                className="flex h-4 min-w-[20px] items-center justify-center rounded-full text-[9px] font-semibold text-white sm:min-w-[24px] sm:text-[10px]"
                style={{ backgroundColor: item.color }}
              >
                {item.value}
              </span>
              <span className="text-[9px] text-[#8a6458] sm:text-[10px]">สถานี</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ----------------------------
   Helper — rain bucketing (ไม่เปลี่ยน)
   ---------------------------- */
function bucketRainValues(values: number[]) {
  let veryHeavy = 0, heavy = 0, moderate = 0, light = 0, none = 0;
  values.forEach((val) => {
    if (isNaN(val) || val === 0) none++;
    else if (val <= 10) light++;
    else if (val <= 35) moderate++;
    else if (val <= 90) heavy++;
    else veryHeavy++;
  });
  return { veryHeavy, heavy, moderate, light, none };
}

function buildRainChartData(stats: ReturnType<typeof bucketRainValues>) {
  return [
    { name: "วิกฤต",       value: stats.veryHeavy, color: COLOR.critical, rainLevel: 4 },
    { name: "เตือนภัย",    value: stats.heavy,     color: COLOR.warning,  rainLevel: 3 },
    { name: "เฝ้าระวัง",   value: stats.moderate,  color: COLOR.watch,    rainLevel: 2 },
    { name: "ปกติ",        value: stats.light,     color: COLOR.normal,   rainLevel: 1 },
    { name: "ไม่มีข้อมูล", value: stats.none,      color: COLOR.nodata,   rainLevel: 0 },
  ];
}

/* ----------------------------
   Helper — pipe/road bucketing (ไม่เปลี่ยน)
   ---------------------------- */
function bucketPipeOrRoadValues(latestRow: Record<string, any>) {
  const stats = { critical: 0, alert: 0, watch: 0, normal: 0, noData: 0 };
  Object.entries(latestRow).forEach(([k, v]) => {
    if (k.toLowerCase().includes("datetime")) return;
    const val = v === null || v === undefined || v === "" ? NaN : Number(v);
    if (isNaN(val))      stats.noData++;
    else if (val >= 0.15) stats.critical++;
    else if (val >= 0.08) stats.alert++;
    else if (val >= 0.03) stats.watch++;
    else if (val > 0)     stats.normal++;
    else                  stats.noData++;
  });
  return stats;
}

/* ----------------------------
   Helper — pond bucketing ใหม่ ใช้ freeboard จาก /api/lake
   รับ lakes array จาก API แล้วนับ status ตาม LAKE_CONFIG
   ---------------------------- */
function bucketPondByFreeboard(lakes: LakeApiItem[]) {
  const counts = { critical: 0, warning: 0, watch: 0, normal: 0, nodata: 0 };

  // วนเฉพาะบึงที่อยู่ใน LAKE_CONFIG (Lake_02, 03, 05, 06)
  Object.keys(LAKE_CONFIG).forEach((lakeId) => {
    const lake   = lakes.find((l) => l.lake_id === lakeId);
    const level  = lake?.status === "ok" ? lake.water_level : undefined;
    const status = getPondStatus(lakeId, level);
    counts[status]++;
  });

  return counts;
}

/* ----------------------------
   Main Component
   ---------------------------- */
export default function Dashboard() {
  const [pondChart, setPondChart]           = useState(initialPondData);
  const [pipeChart, setPipeChart]           = useState(initialPipeData);
  const [roadChart, setRoadChart]           = useState(initialRoadData);
  const [rainDailyData, setRainDailyData]   = useState(initialRainData);
  const [rainHourlyData, setRainHourlyData] = useState(initialRainData);
  const [totalRainStations, setTotalRainStations] = useState(0);

  /* ── Fetch บึง: ใช้ /api/lake + freeboard ── */
  const fetchPond = async () => {
    try {
      const res  = await fetch("/api/lake");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: LakesApiResponse = await res.json();

      const counts = bucketPondByFreeboard(json.lakes ?? []);

      setPondChart([
        { name: "วิกฤต",       value: counts.critical, color: COLOR.critical, iconLevel: 5 },
        { name: "เตือนภัย",    value: counts.warning,  color: COLOR.warning,  iconLevel: 4 },
        { name: "เฝ้าระวัง",   value: counts.watch,    color: COLOR.watch,    iconLevel: 3 },
        { name: "ปกติ",        value: counts.normal,   color: COLOR.normal,   iconLevel: 2 },
        { name: "ไม่มีข้อมูล", value: counts.nodata,   color: COLOR.nodata,   iconLevel: 0 },
      ]);
    } catch (err) {
      console.error("fetchPond error:", err);
      setPondChart(initialPondData);
    }
  };

  /* ── Fetch ท่อ ── */
  const fetchPipe = async () => {
    try {
      const res  = await fetch("/api/water/pipe");
      const json = await res.json();
      if (json?.status === "success" && Array.isArray(json.rows) && json.rows.length > 0) {
        const stats = bucketPipeOrRoadValues(json.rows[json.rows.length - 1]);
        setPipeChart([
          { name: "วิกฤต",       value: stats.critical, color: COLOR.critical, iconLevel: 5 },
          { name: "แจ้งเตือน",   value: stats.alert,    color: COLOR.warning,  iconLevel: 4 },
          { name: "เฝ้าระวัง",   value: stats.watch,    color: COLOR.watch,    iconLevel: 3 },
          { name: "ปกติ",        value: stats.normal,   color: COLOR.normal,   iconLevel: 2 },
          { name: "ไม่มีข้อมูล", value: stats.noData,   color: COLOR.nodata,   iconLevel: 0 },
        ]);
      } else {
        setPipeChart(initialPipeData);
      }
    } catch (err) {
      console.error("fetchPipe error:", err);
      setPipeChart(initialPipeData);
    }
  };

  /* ── Fetch ถนน ── */
  const fetchRoad = async () => {
    try {
      const res  = await fetch("/api/water/road");
      const json = await res.json();
      if (json?.status === "success" && Array.isArray(json.rows) && json.rows.length > 0) {
        const stats = bucketPipeOrRoadValues(json.rows[json.rows.length - 1]);
        setRoadChart([
          { name: "วิกฤต",       value: stats.critical, color: COLOR.critical, iconLevel: 5 },
          { name: "แจ้งเตือน",   value: stats.alert,    color: COLOR.warning,  iconLevel: 4 },
          { name: "เฝ้าระวัง",   value: stats.watch,    color: COLOR.watch,    iconLevel: 3 },
          { name: "ปกติ",        value: stats.normal,   color: COLOR.normal,   iconLevel: 2 },
          { name: "ไม่มีข้อมูล", value: stats.noData,   color: COLOR.nodata,   iconLevel: 0 },
        ]);
      } else {
        setRoadChart(initialRoadData);
      }
    } catch (err) {
      console.error("fetchRoad error:", err);
      setRoadChart(initialRoadData);
    }
  };

  /* ── Fetch ฝนรายวัน ── */
  const fetchRainDaily = async () => {
    try {
      const response = await fetch("/api/rain_24hr?limit=1");
      const result   = await response.json();
      if (result?.status === "success" && Array.isArray(result.data) && result.data.length > 0) {
        const stations = result.data[0].stations || {};
        const values   = Object.values(stations).map((v: any) => Number(v));
        setTotalRainStations(values.length);
        setRainDailyData(buildRainChartData(bucketRainValues(values)));
      }
    } catch (err) {
      console.error("fetchRainDaily error:", err);
    }
  };

  /* ── Fetch ฝนรายชั่วโมง ── */
  const fetchRainHourly = async () => {
    try {
      const response = await fetch("/api/rain_3hr_2km?limit=1");
      const result   = await response.json();
      if (result?.status === "success" && Array.isArray(result.data) && result.data.length > 0) {
        const stations = result.data[0].stations || {};
        const values   = Object.values(stations).map((v: any) => Number(v));
        if (totalRainStations === 0) setTotalRainStations(values.length);
        setRainHourlyData(buildRainChartData(bucketRainValues(values)));
      }
    } catch (err) {
      console.error("fetchRainHourly error:", err);
    }
  };

  useEffect(() => {
    fetchPond();
    fetchPipe();
    fetchRoad();
    fetchRainDaily();
    fetchRainHourly();

    const interval = setInterval(() => {
      fetchPond();
      fetchPipe();
      fetchRoad();
      fetchRainDaily();
      fetchRainHourly();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full p-0 h-full">
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 h-full">
        <Card title="สถานีวัดระดับน้ำในบึง" subtitle="" data={pondChart} type="status" />
        <RainCard
          title="สถานีวัดปริมาณน้ำฝน"
          totalStations={totalRainStations}
          dailyData={rainDailyData}
          hourlyData={rainHourlyData}
        />
        <Card title="สถานีวัดระดับน้ำในท่อ"          subtitle="" data={pipeChart} type="status" />
        <Card title="สถานีวัดระดับน้ำท่วมผิวถนน" subtitle="" data={roadChart} type="status" />
      </div>
    </div>
  );
}