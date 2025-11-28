"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { 
  Waves, 
  Cloud, 
  CloudRain, 
  CloudDrizzle,
  XCircle 
} from "lucide-react";

// ----------------------------
// สีของหมวดหมู่
// ----------------------------
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

// ----------------------------
// Icon Components
// ----------------------------
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

// ----------------------------
// Data
// ----------------------------
const pondData = [
  { name: "น้ำล้นตลิ่ง", value: 0, color: pieColors["น้ำล้นตลิ่ง"], iconLevel: 5 },
  { name: "น้ำมาก", value: 6, color: pieColors["น้ำมาก"], iconLevel: 4 },
  { name: "น้ำปกติ", value: 3, color: pieColors["น้ำปกติ"], iconLevel: 3 },
  { name: "น้ำน้อย", value: 1, color: pieColors["น้ำน้อย"], iconLevel: 2 },
  { name: "น้ำน้อยวิกฤต", value: 0, color: pieColors["น้ำน้อยวิกฤติ"], iconLevel: 1 },
  { name: "ไม่มีข้อมูล", value: 0, color: "#9e9e9e", iconLevel: 0 },
];

const rainData = [
  { name: "ฝนตกหนักมาก", value: 0, color: pieColors["ฝนตกหนักมาก"], rainLevel: 4 },
  { name: "ฝนตกหนัก", value: 0, color: pieColors["ฝนตกหนัก"], rainLevel: 3 },
  { name: "ฝนตกปานกลาง", value: 0, color: pieColors["ฝนตกปานกลาง"], rainLevel: 2 },
  { name: "ฝนตกเล็กน้อย", value: 7, color: pieColors["ฝนตกเล็กน้อย"], rainLevel: 1 },
  { name: "ไม่มีฝน", value: 20, color: "#e0e0e0", rainLevel: 0 },
];

const pipeData = [
  { name: "วิกฤต", value: 0, color: pieColors["วิกฤต"], iconLevel: 5 },
  { name: "แจ้งเตือน", value: 6, color: pieColors["แจ้งเตือน"], iconLevel: 4 },
  { name: "เฝ้าระวัง", value: 3, color: pieColors["เฝ้าระวัง"], iconLevel: 3 },
  { name: "ปกติ", value: 1, color: pieColors["ปกติ"], iconLevel: 2 },
  { name: "ไม่มีข้อมูล", value: 0, color: "#9e9e9e", iconLevel: 0 },
];

const roadData = [
  { name: "วิกฤต", value: 0, color: pieColors["วิกฤต"], iconLevel: 5 },
  { name: "แจ้งเตือน", value: 6, color: pieColors["แจ้งเตือน"], iconLevel: 4 },
  { name: "เฝ้าระวัง", value: 3, color: pieColors["เฝ้าระวัง"], iconLevel: 3 },
  { name: "ปกติ", value: 1, color: pieColors["ปกติ"], iconLevel: 2 },
  { name: "ไม่มีข้อมูล", value: 0, color: "#9e9e9e", iconLevel: 0 },
];

// ----------------------------
// Donut Chart
// ----------------------------
const Donut = ({ data }: any) => {
  const filteredData = data.filter((item: any) => item.value > 0);
  
  return (
    <div className="h-[90px] w-[90px] sm:h-[100px] sm:w-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            dataKey="value"
            innerRadius="55%"
            outerRadius="95%"
            paddingAngle={2}
          >
            {filteredData.map((item: any, idx: number) => (
              <Cell key={idx} fill={item.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// ----------------------------
// Card (Legend อยู่ขวา)
// ----------------------------
const Card = ({ title, subtitle, data, type }: any) => (
  <div className="flex h-full flex-col rounded-xl border border-[#ead0c7] bg-white p-1 shadow-sm">
    <p className="text-center text-xs font-semibold text-[#2c120c]">{title}</p>
    <p className="text-center text-[10px] text-[#8a6458]">{subtitle}</p>

    <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-center">
      <Donut data={data} />

      <div className="grid w-full gap-1.5 text-xs sm:w-auto">
        {data.map((item: any, i: number) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="flex w-7 justify-center">
              {type === "rain" ? (
                <RainIcon level={item.rainLevel} />
              ) : (
                <WaterIcon level={item.iconLevel} />
              )}
            </div>
            <span className="w-20 whitespace-nowrap text-[11px] text-[#4c3b37]">
              {item.name}
            </span>
            <span
              className="flex h-4 min-w-[24px] items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{
                backgroundColor: item.value === 0 ? "#9e9e9e" : item.color,
              }}
            >
              {item.value}
            </span>
            <span className="text-[10px] text-[#8a6458]">สถานี</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ----------------------------
// Dashboard 2×2
// ----------------------------
export default function Dashboard() {
  return (
    <div className="w-full p-0">
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 h-full">
        <Card
          title="สถานีวัดระดับน้ำในหนองน้ำ"
          subtitle="10 สถานี"
          data={pondData}
          type="water"
        />

        <Card
          title="สถานีวัดปริมาณฝน"
          subtitle="27 สถานี"
          data={rainData}
          type="rain"
        />

        <Card
          title="สถานีวัดระดับน้ำในท่อ"
          subtitle="10 สถานี"
          data={pipeData}
          type="water"
        />

        <Card
          title="สถานีวัดระดับน้ำท่วมผิวถนน"
          subtitle="10 สถานี"
          data={roadData}
          type="water"
        />
      </div>
    </div>
  );
}