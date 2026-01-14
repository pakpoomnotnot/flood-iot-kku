"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CombinedPredictionChartProps {
  stationName?: string;
  stationId?: string;
  data: Array<{
    time: string;
    datetime?: Date;
    predicted24h: number | null;
    predicted72h: number | null;
    leadHour?: number;
  }>;
  unit?: string;
  height?: number;
  color?: string; // 🎨 เพิ่ม prop สำหรับ custom color
}

export const CombinedPredictionChart: React.FC<CombinedPredictionChartProps> = ({
  stationName,
  stationId,
  data,
  unit = "มม.",
  height = 400,
  color = "#A73B24", // 🎨 ใช้สีธีมเป็น default
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
        style={{ height }}
      >
        <p className="text-gray-400 text-sm">ไม่มีข้อมูลพยากรณ์</p>
      </div>
    );
  }

  // 🎨 สร้างสีแบบ lighter version สำหรับ tooltip
  const getLighterColor = (hex: string, percent: number = 30) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, ((num >> 16) & 255) + percent);
    const g = Math.min(255, ((num >> 8) & 255) + percent);
    const b = Math.min(255, (num & 255) + percent);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 min-w-[200px]">
          <p className="text-xs font-semibold text-gray-900 mb-2 border-b pb-2">
            {item.time}
          </p>
          {item.leadHour !== undefined && (
            <p className="text-xs text-gray-500 mb-2">
              ชั่วโมงที่ {item.leadHour} จากการรัน
            </p>
          )}
          
          <div className="space-y-2">
            {item.predicted24h !== null && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-gray-600">24 ชม.</span>
                </div>
                <span 
                  className="text-sm font-bold"
                  style={{ color }}
                >
                  {item.predicted24h.toFixed(2)} {unit}
                </span>
              </div>
            )}
            
            {item.predicted72h !== null && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getLighterColor(color, 40) }}
                  />
                  <span className="text-xs text-gray-600">72 ชม.</span>
                </div>
                <span 
                  className="text-sm font-bold"
                  style={{ color: getLighterColor(color, 40) }}
                >
                  {item.predicted72h.toFixed(2)} {unit}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Format X-axis - แสดงเฉพาะบางจุด
  const formatXAxis = (value: string, index: number) => {
    // แสดงทุก 6 ชั่วโมง
    if (index % 6 === 0) {
      return value;
    }
    return "";
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={formatXAxis}
            angle={-45}
            textAnchor="end"
            height={80}
            stroke="#9ca3af"
            reversed={true}
          />
          
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            label={{
              value: `ปริมาณฝน (${unit})`,
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 12, fill: "#374151" },
            }}
            stroke="#9ca3af"
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "13px",
            }}
            iconType="line"
          />
          
          {/* 🎨 เส้น 24 ชั่วโมง - ใช้สีที่กำหนด */}
          <Line
            type="monotone"
            dataKey="predicted24h"
            stroke={color}
            strokeWidth={3}
            name="พยากรณ์ 24 ชม."
            dot={{
              r: 3,
              fill: color,
              strokeWidth: 0,
            }}
            activeDot={{
              r: 6,
              fill: color,
              stroke: "#fff",
              strokeWidth: 2,
            }}
            connectNulls={false}
          />
          
          {/* 🎨 เส้น 72 ชั่วโมง - ใช้สีเดียวกันแบบ dashed */}
          <Line
            type="monotone"
            dataKey="predicted72h"
            stroke={color}
            strokeWidth={2.5}
            name="พยากรณ์ 72 ชม."
            dot={{
              r: 2,
              fill: color,
              strokeWidth: 0,
            }}
            activeDot={{
              r: 5,
              fill: color,
              stroke: "#fff",
              strokeWidth: 2,
            }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Data Summary */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5" style={{ backgroundColor: color }}></div>
          <span>24 ชม.: {data.filter(d => d.predicted24h !== null).length} รายการ</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-0.5 border-t border-dashed" 
            style={{ borderColor: color }}
          ></div>
          <span>72 ชม.: {data.filter(d => d.predicted72h !== null).length} รายการ</span>
        </div>
      </div>
    </div>
  );
};