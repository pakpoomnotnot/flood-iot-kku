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
   สีของหมวดหมู่
   ---------------------------- */
const pieColors = {
  น้ำล้นตลิ่ง: "#d32f2f",
  น้ำมาก: "#1565c0",
  น้ำปกติ: "#2e7d32",
  น้ำน้อย: "#fbc02d",
  น้ำน้อยวิกฤติ: "#ff6f00",

  ฝนตกหนักมาก: "#d32f2f",
  ฝนตกหนัก: "#ef6c00",
  ฝนตกปานกลาง: "#8bc34a",
  ฝนตกเล็กน้อย: "#64b5f6",

  วิกฤต: "#d32f2f",
  แจ้งเตือน: "#1565c0",
  เฝ้าระวัง: "#2e7d32",
  ปกติ: "#fbc02d",
};

/* ----------------------------
   Icon Components
   ---------------------------- */
const WaterIcon = ({ level }: { level: number }) => {
  const size = 16;
  const color = "#1565c0";

  if (level === 5) {
    return (
      <div className="flex items-center gap-0">
        <Waves size={size} color="#d32f2f" strokeWidth={2.5} />
        <Waves size={size} color="#d32f2f" strokeWidth={2.5} className="-ml-2" />
        <Waves size={size} color="#d32f2f" strokeWidth={2.5} className="-ml-2" />
      </div>
    );
  }
  if (level === 4) {
    return (
      <div className="flex items-center gap-0">
        <Waves size={size} color={color} strokeWidth={2.5} />
        <Waves size={size} color={color} strokeWidth={2.5} className="-ml-2" />
      </div>
    );
  }
  if (level === 3) {
    return <Waves size={size} color="#2e7d32" strokeWidth={2.5} />;
  }
  if (level === 2) {
    return <Waves size={size} color="#fbc02d" strokeWidth={2.5} />;
  }
  if (level === 1) {
    return (
      <div className="flex items-center gap-0">
        <Waves size={size} color="#ff6f00" strokeWidth={2.5} />
        <Waves size={size} color="#ff6f00" strokeWidth={2.5} className="-ml-2" />
      </div>
    );
  }
  return <XCircle size={size} color="#9e9e9e" strokeWidth={2} />;
};

const RainIcon = ({ level }: { level: number }) => {
  const size = 16;

  if (level === 4) {
    return (
      <div className="flex items-center gap-0">
        <CloudRain size={size} color="#d32f2f" strokeWidth={2.5} />
        <CloudRain size={size} color="#d32f2f" strokeWidth={2.5} className="-ml-2" />
      </div>
    );
  }
  if (level === 3) {
    return <CloudRain size={size} color="#ef6c00" strokeWidth={2.5} />;
  }
  if (level === 2) {
    return <CloudDrizzle size={size} color="#8bc34a" strokeWidth={2.5} />;
  }
  if (level === 1) {
    return <Cloud size={size} color="#64b5f6" strokeWidth={2.5} />;
  }
  return <XCircle size={size} color="#9e9e9e" strokeWidth={2} />;
};

/* ----------------------------
   Initial (fallback) data
   ---------------------------- */
const initialPondData = [
  { name: "น้ำล้นตลิ่ง", value: 0, color: pieColors["น้ำล้นตลิ่ง"], iconLevel: 5 },
  { name: "น้ำมาก", value: 0, color: pieColors["น้ำมาก"], iconLevel: 4 },
  { name: "น้ำปกติ", value: 0, color: pieColors["น้ำปกติ"], iconLevel: 3 },
  { name: "น้ำน้อย", value: 0, color: pieColors["น้ำน้อย"], iconLevel: 2 },
  { name: "น้ำน้อยวิกฤติ", value: 0, color: pieColors["น้ำน้อยวิกฤติ"], iconLevel: 1 },
  { name: "ไม่มีข้อมูล", value: 0, color: "#9e9e9e", iconLevel: 0 },
];

const initialRainData = [
  { name: "ฝนตกหนักมาก", value: 0, color: pieColors["ฝนตกหนักมาก"], rainLevel: 4 },
  { name: "ฝนตกหนัก", value: 0, color: pieColors["ฝนตกหนัก"], rainLevel: 3 },
  { name: "ฝนตกปานกลาง", value: 0, color: pieColors["ฝนตกปานกลาง"], rainLevel: 2 },
  { name: "ฝนตกเล็กน้อย", value: 0, color: pieColors["ฝนตกเล็กน้อย"], rainLevel: 1 },
  { name: "ไม่มีฝน", value: 0, color: "#e0e0e0", rainLevel: 0 },
];

const initialPipeData = [
  { name: "วิกฤต", value: 0, color: pieColors["วิกฤต"], iconLevel: 5 },
  { name: "แจ้งเตือน", value: 0, color: pieColors["แจ้งเตือน"], iconLevel: 4 },
  { name: "เฝ้าระวัง", value: 0, color: pieColors["เฝ้าระวัง"], iconLevel: 3 },
  { name: "ปกติ", value: 0, color: pieColors["ปกติ"], iconLevel: 2 },
  { name: "ไม่มีข้อมูล", value: 0, color: "#9e9e9e", iconLevel: 0 },
];

const initialRoadData = [
  { name: "วิกฤต", value: 0, color: pieColors["วิกฤต"], iconLevel: 5 },
  { name: "แจ้งเตือน", value: 0, color: pieColors["แจ้งเตือน"], iconLevel: 4 },
  { name: "เฝ้าระวัง", value: 0, color: pieColors["เฝ้าระวัง"], iconLevel: 3 },
  { name: "ปกติ", value: 0, color: pieColors["ปกติ"], iconLevel: 2 },
  { name: "ไม่มีข้อมูล", value: 0, color: "#9e9e9e", iconLevel: 0 },
];

/* ----------------------------
   Donut component
   ---------------------------- */
const Donut = ({ data }: { data: any[] }) => {
  const filtered = data.filter((d) => d.value > 0);
  return (
    <div className="h-[90px] w-[90px] sm:h-[100px] sm:w-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={filtered} dataKey="value" innerRadius="55%" outerRadius="95%" paddingAngle={2}>
            {filtered.map((item, i) => (
              <Cell key={i} fill={item.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ----------------------------
   Card (legend)
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
              {type === "rain" ? <RainIcon level={item.rainLevel ?? 0} /> : <WaterIcon level={item.iconLevel ?? 0} />}
            </div>
            <span className="w-24 whitespace-nowrap text-[10px] text-[#4c3b37] sm:text-[11px]">{item.name}</span>
            <span
              className="flex h-4 min-w-[20px] items-center justify-center rounded-full text-[9px] font-semibold text-white sm:min-w-[24px] sm:text-[10px]"
              style={{ backgroundColor: item.value === 0 ? "#9e9e9e" : item.color }}
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
   Helper: parse latest row values and bucket counts
   - expects object rows (array of objects)
   - returns counts for categories
   ---------------------------- */
function bucketPondValues(latestRow: Record<string, any>) {
  // thresholds for pond (meters) — ปรับได้ตามต้องการ
  // overflow: > 1.0
  // high: > 0.5
  // normal: > 0.2
  // low: > 0.05
  // criticalLow: <= 0.05
  const stats = {
    overflow: 0,
    high: 0,
    normal: 0,
    low: 0,
    criticalLow: 0,
    noData: 0,
  };

  Object.entries(latestRow).forEach(([k, v]) => {
    if (k.toLowerCase().includes("datetime")) return;
    const val = v === null || v === undefined || v === "" ? NaN : Number(v);
    if (isNaN(val)) {
      stats.noData++;
    } else {
      if (val > 1.0) stats.overflow++;
      else if (val > 0.5) stats.high++;
      else if (val > 0.2) stats.normal++;
      else if (val > 0.05) stats.low++;
      else stats.criticalLow++;
    }
  });

  return stats;
}

function bucketPipeOrRoadValues(latestRow: Record<string, any>) {
  // thresholds for pipe/road (example, flow depth/velocity)
  // critical (วิกฤต): >= 0.15
  // alert (แจ้งเตือน): >= 0.08
  // watch (เฝ้าระวัง): >= 0.03
  // normal: > 0
  // noData: = 0 or NaN
  const stats = {
    critical: 0,
    alert: 0,
    watch: 0,
    normal: 0,
    noData: 0,
  };

  Object.entries(latestRow).forEach(([k, v]) => {
    if (k.toLowerCase().includes("datetime")) return;
    const val = v === null || v === undefined || v === "" ? NaN : Number(v);
    if (isNaN(val)) {
      stats.noData++;
    } else {
      if (val >= 0.15) stats.critical++;
      else if (val >= 0.08) stats.alert++;
      else if (val >= 0.03) stats.watch++;
      else if (val > 0) stats.normal++;
      else stats.noData++;
    }
  });

  return stats;
}

/* ----------------------------
   Main Component
   ---------------------------- */
export default function Dashboard() {
  // states for real data
  const [pondChart, setPondChart] = useState(initialPondData);
  const [pipeChart, setPipeChart] = useState(initialPipeData);
  const [roadChart, setRoadChart] = useState(initialRoadData);

  // (keep your rain logic / data if needed)
  const [rainChartData, setRainChartData] = useState(initialRainData);
  const [totalRainStations, setTotalRainStations] = useState(0);

  /* Fetch functions */
  const fetchPond = async () => {
    try {
      const res = await fetch("/api/water/pond");
      const json = await res.json();
      if (json?.status === "success" && Array.isArray(json.rows) && json.rows.length > 0) {
        const latestRow = json.rows[json.rows.length - 1];
        const stats = bucketPondValues(latestRow);

        const updated = [
          { name: "น้ำล้นตลิ่ง", value: stats.overflow, color: pieColors["น้ำล้นตลิ่ง"], iconLevel: 5 },
          { name: "น้ำมาก", value: stats.high, color: pieColors["น้ำมาก"], iconLevel: 4 },
          { name: "น้ำปกติ", value: stats.normal, color: pieColors["น้ำปกติ"], iconLevel: 3 },
          { name: "น้ำน้อย", value: stats.low, color: pieColors["น้ำน้อย"], iconLevel: 2 },
          { name: "น้ำน้อยวิกฤต", value: stats.criticalLow, color: pieColors["น้ำน้อยวิกฤติ"], iconLevel: 1 },
          { name: "ไม่มีข้อมูล", value: stats.noData, color: "#9e9e9e", iconLevel: 0 },
        ];

        setPondChart(updated);
      } else {
        // fallback to zeros
        setPondChart(initialPondData);
      }
    } catch (err) {
      console.error("fetchPond error:", err);
      setPondChart(initialPondData);
    }
  };

  const fetchPipe = async () => {
    try {
      const res = await fetch("/api/water/pipe");
      const json = await res.json();
      if (json?.status === "success" && Array.isArray(json.rows) && json.rows.length > 0) {
        const latestRow = json.rows[json.rows.length - 1];
        const stats = bucketPipeOrRoadValues(latestRow);

        const updated = [
          { name: "วิกฤต", value: stats.critical, color: pieColors["วิกฤต"], iconLevel: 5 },
          { name: "แจ้งเตือน", value: stats.alert, color: pieColors["แจ้งเตือน"], iconLevel: 4 },
          { name: "เฝ้าระวัง", value: stats.watch, color: pieColors["เฝ้าระวัง"], iconLevel: 3 },
          { name: "ปกติ", value: stats.normal, color: pieColors["ปกติ"], iconLevel: 2 },
          { name: "ไม่มีข้อมูล", value: stats.noData, color: "#9e9e9e", iconLevel: 0 },
        ];

        setPipeChart(updated);
      } else {
        setPipeChart(initialPipeData);
      }
    } catch (err) {
      console.error("fetchPipe error:", err);
      setPipeChart(initialPipeData);
    }
  };

  const fetchRoad = async () => {
    try {
      const res = await fetch("/api/water/road");
      const json = await res.json();
      if (json?.status === "success" && Array.isArray(json.rows) && json.rows.length > 0) {
        const latestRow = json.rows[json.rows.length - 1];
        const stats = bucketPipeOrRoadValues(latestRow);

        const updated = [
          { name: "วิกฤต", value: stats.critical, color: pieColors["วิกฤต"], iconLevel: 5 },
          { name: "แจ้งเตือน", value: stats.alert, color: pieColors["แจ้งเตือน"], iconLevel: 4 },
          { name: "เฝ้าระวัง", value: stats.watch, color: pieColors["เฝ้าระวัง"], iconLevel: 3 },
          { name: "ปกติ", value: stats.normal, color: pieColors["ปกติ"], iconLevel: 2 },
          { name: "ไม่มีข้อมูล", value: stats.noData, color: "#9e9e9e", iconLevel: 0 },
        ];

        setRoadChart(updated);
      } else {
        setRoadChart(initialRoadData);
      }
    } catch (err) {
      console.error("fetchRoad error:", err);
      setRoadChart(initialRoadData);
    }
  };

  /* Fetch rain (your existing logic) - kept minimal here (you had it earlier) */
  const fetchRain = async () => {
    try {
      const response = await fetch("/api/rain_3hr_2km?limit=1");
      const result = await response.json();
      if (result?.status === "success" && Array.isArray(result.data) && result.data.length > 0) {
        const stations = result.data[0].stations || {};
        const values = Object.values(stations).map((v: any) => Number(v));
        setTotalRainStations(values.length);

        let veryHeavy = 0;
        let heavy = 0;
        let moderate = 0;
        let light = 0;
        let none = 0;

        values.forEach((val: number) => {
          if (isNaN(val) || val === 0) none++;
          else if (val <= 10) light++;
          else if (val <= 35) moderate++;
          else if (val <= 90) heavy++;
          else veryHeavy++;
        });

        setRainChartData([
          { name: "ฝนตกหนักมาก", value: veryHeavy, color: pieColors["ฝนตกหนักมาก"], rainLevel: 4 },
          { name: "ฝนตกหนัก", value: heavy, color: pieColors["ฝนตกหนัก"], rainLevel: 3 },
          { name: "ฝนตกปานกลาง", value: moderate, color: pieColors["ฝนตกปานกลาง"], rainLevel: 2 },
          { name: "ฝนตกเล็กน้อย", value: light, color: pieColors["ฝนตกเล็กน้อย"], rainLevel: 1 },
          { name: "ไม่มีฝน", value: none, color: "#e0e0e0", rainLevel: 0 },
        ]);
      }
    } catch (err) {
      console.error("fetchRain error:", err);
    }
  };

  useEffect(() => {
    // initial load
    fetchPond();
    fetchPipe();
    fetchRoad();
    fetchRain();

    // refresh every 5 minutes
    const interval = setInterval(() => {
      fetchPond();
      fetchPipe();
      fetchRoad();
      fetchRain();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full p-0">
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 h-full">
        <Card title="สถานีวัดระดับน้ำในหนองน้ำ" subtitle="(Reservoirs)" data={pondChart} type="water" />

        <Card title="สถานีวัดปริมาณฝน" subtitle={`${totalRainStations} สถานี`} data={rainChartData} type="rain" />

        <Card title="สถานีวัดระดับน้ำในท่อ" subtitle="(Pipes / Other)" data={pipeChart} type="water" />

        <Card title="สถานีวัดระดับน้ำท่วมผิวถนน" subtitle="(Road junctions)" data={roadChart} type="water" />
      </div>
    </div>
  );
}
