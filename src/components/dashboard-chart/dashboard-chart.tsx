"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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
};

// ----------------------------
// Data
// ----------------------------
const pondData = [
  { name: "น้ำมาก", value: 6, color: pieColors["น้ำมาก"] },
  { name: "น้ำปกติ", value: 3, color: pieColors["น้ำปกติ"] },
  { name: "น้ำน้อย", value: 1, color: pieColors["น้ำน้อย"] },
];

const rainData = [
  { name: "ฝนตกเล็กน้อย", value: 7, color: pieColors["ฝนตกเล็กน้อย"] },
];

const pipeData = [
  { name: "แจ้งเตือน", value: 6, color: pieColors["น้ำมาก"] },
  { name: "เฝ้าระวัง", value: 3, color: pieColors["น้ำปกติ"] },
  { name: "ปกติ", value: 1, color: pieColors["น้ำน้อย"] },
];

const roadData = [
  { name: "แจ้งเตือน", value: 6, color: pieColors["น้ำมาก"] },
  { name: "เฝ้าระวัง", value: 3, color: pieColors["น้ำปกติ"] },
  { name: "ปกติ", value: 1, color: pieColors["น้ำน้อย"] },
];

// ----------------------------
// Donut Chart
// ----------------------------
const Donut = ({ data }: any) => (
  <div className="w-[120px] h-[120px]">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          innerRadius="55%"
          outerRadius="95%"
          paddingAngle={2}
        >
          {data.map((item: any, idx: number) => (
            <Cell key={idx} fill={item.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  </div>
);

// ----------------------------
// Card (Legend อยู่ขวา)
// ----------------------------
const Card = ({ title, subtitle, data }: any) => (
  <div className="rounded-xl border bg-white p-2 shadow-sm flex flex-col">

    {/* ชื่อด้านบน */}
    <p className="font-semibold text-sm text-center">{title}</p>
    <p className="text-gray-500 text-xs text-center">{subtitle}</p>

    {/* Chart + Legend */}
    <div className="mt-3 flex flex-row items-center justify-center gap-4">

      {/* Chart */}
      <Donut data={data} />

      {/* Legend ด้านขวา */}
      <div className="flex flex-col text-xs space-y-1">
        {data.map((item: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="whitespace-nowrap">{item.name}</span>
            <span className="ml-1 text-gray-600">{item.value}</span>
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
    <div className="w-full h-[70%] p-2">
      <div className="grid grid-cols-2 gap-4 w-full h-full">

        <Card
          title="สถานีวัดระดับน้ำในหนองน้ำ"
          subtitle="10 สถานี"
          data={pondData}
        />

        <Card
          title="สถานีวัดปริมาณฝน"
          subtitle="27 สถานี"
          data={rainData}
        />

        <Card
          title="สถานีวัดระดับน้ำในท่อ"
          subtitle="10 สถานี"
          data={pipeData}
        />

        <Card
          title="สถานีวัดระดับน้ำท่วมผิวถนน"
          subtitle="10 สถานี"
          data={roadData}
        />

      </div>
    </div>
  );
}
