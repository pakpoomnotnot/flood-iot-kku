"use client";

import React, { FC } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTelemetryHistory } from "@/hooks/use-telemetry-history";

const getDrainageBarColor = (value: number) => {
  if (value > 2.5) return "#DC2626";
  if (value > 2.0) return "#FB923C";
  if (value > 1.5) return "#3B82F6";
  if (value > 1.0) return "#60A5FA";
  if (value > 0.5) return "#93C5FD";
  return "#DBEAFE";
};

const PipeTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="rounded-lg border border-blue-100 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700">{label}</p>
      {v == null ? (
        <p className="text-gray-400 font-medium mt-0.5">ไม่มีข้อมูล (สถานีขาดการเชื่อมต่อ)</p>
      ) : (
        <p className="text-blue-600 font-bold mt-0.5">{v} ม.</p>
      )}
    </div>
  );
};

const RoadTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  if (v == null) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-gray-600 mb-1">{label}</p>
        <p className="font-medium text-gray-400">ไม่มีข้อมูล (สถานีขาดการเชื่อมต่อ)</p>
      </div>
    );
  }
  const color =
    v > 0.69
      ? "#DC2626"
      : v > 0.46
        ? "#F87171"
        : v > 0.23
          ? "#FB923C"
          : v > 0.11
            ? "#CA8A04"
            : "#16A34A";
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-600 mb-1">{label}</p>
      <p className="font-bold" style={{ color }}>
        {v} ม.
      </p>
    </div>
  );
};

const CustomBar = (props: any) => {
  const { x, y, width, height, value } = props;
  if (value == null) return null;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={getDrainageBarColor(value)}
      rx={2}
      ry={2}
    />
  );
};

const ChartLoading = () => (
  <div className="flex h-[220px] items-center justify-center">
    <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
      <svg className="h-6 w-6 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      กำลังโหลดข้อมูล...
    </div>
  </div>
);

interface TelemetryHistoryChartModalProps {
  category: "pipe" | "road";
  stationCode: string;
  title: string;
  subtitle?: string;
  currentLevel: number;
  onClose: () => void;
}

export const TelemetryHistoryChartModal: FC<TelemetryHistoryChartModalProps> = ({
  category,
  stationCode,
  title,
  subtitle,
  currentLevel,
  onClose,
}) => {
  const { data, loading, error } = useTelemetryHistory(category, stationCode, 24);
  const currentLabel = data[data.length - 1]?.label ?? "";
  const tickLabels = data.filter((_, i) => i % 4 === 0).map((d) => d.label);
  const isPipe = category === "pipe";
  const hasAnyReading = data.some((d) => d.value != null);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl mx-4 rounded-2xl bg-white shadow-2xl border overflow-hidden ${
          isPipe ? "border-blue-100" : "border-red-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-800">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-0.5 flex-shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          className={`flex items-center gap-4 px-5 py-2.5 text-xs text-gray-500 border-b ${
            isPipe ? "bg-blue-50/60 border-blue-100" : "bg-red-50/60 border-red-100"
          }`}
        >
          {subtitle && <span>{subtitle}</span>}
          <span className={`ml-auto font-semibold ${isPipe ? "text-blue-700" : "text-red-600"}`}>
            ระดับน้ำปัจจุบัน: {currentLevel.toFixed(2)} ม.
          </span>
        </div>

        <div className="px-4 pt-4 pb-3">
          <p className="text-[11px] font-medium text-gray-400 mb-3 uppercase tracking-wide">
            {isPipe ? "ระดับน้ำในท่อ (ม.)" : "ระดับน้ำท่วมถนน (ม.)"} — 24 ชั่วโมงย้อนหลัง
          </p>

          {loading ? (
            <ChartLoading />
          ) : error ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-red-400">{error}</div>
          ) : data.length === 0 || !hasAnyReading ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">
              ไม่มีข้อมูลย้อนหลัง 24 ชม.
            </div>
          ) : isPipe ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" ticks={tickLabels} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 3.5]} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} unit=" ม." />
                <Tooltip content={<PipeTooltip />} cursor={{ fill: "#eff6ff" }} />
                <ReferenceLine y={1.5} stroke="#3B82F6" strokeWidth={1} strokeDasharray="5 4"
                  label={{ value: "ปานกลาง", position: "right", fontSize: 9, fill: "#3B82F6", fontWeight: 600 }} />
                <ReferenceLine y={2.5} stroke="#DC2626" strokeWidth={1} strokeDasharray="5 4"
                  label={{ value: "วิกฤต", position: "right", fontSize: 9, fill: "#DC2626", fontWeight: 600 }} />
                {currentLabel && (
                  <ReferenceLine x={currentLabel} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3"
                    label={{ value: "ปัจจุบัน", position: "top", fontSize: 9, fill: "#ef4444", fontWeight: 600 }} />
                )}
                <Bar dataKey="value" shape={<CustomBar />} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data} margin={{ top: 10, right: 60, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="roadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" ticks={tickLabels} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 1.2]} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} unit=" ม." />
                <Tooltip content={<RoadTooltip />} />
                <ReferenceLine y={0.23} stroke="#CA8A04" strokeWidth={1} strokeDasharray="5 4"
                  label={{ value: "กลาง", position: "right", fontSize: 9, fill: "#CA8A04", fontWeight: 600 }} />
                <ReferenceLine y={0.46} stroke="#EA580C" strokeWidth={1} strokeDasharray="5 4"
                  label={{ value: "สูง", position: "right", fontSize: 9, fill: "#EA580C", fontWeight: 600 }} />
                <ReferenceLine y={0.69} stroke="#DC2626" strokeWidth={1} strokeDasharray="5 4"
                  label={{ value: "น้ำท่วม", position: "right", fontSize: 9, fill: "#DC2626", fontWeight: 600 }} />
                {currentLabel && (
                  <ReferenceLine x={currentLabel} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3"
                    label={{ value: "ปัจจุบัน", position: "top", fontSize: 9, fill: "#ef4444", fontWeight: 600 }} />
                )}
                <Area type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2.5}
                  fill="url(#roadGradient)" dot={false} connectNulls={false}
                  activeDot={{ r: 4, fill: "#EF4444", strokeWidth: 2, stroke: "#fff" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex justify-end px-5 pb-4 border-t border-gray-50 pt-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-200 transition-colors font-medium"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
