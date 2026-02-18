"use client";
import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
} from "recharts";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface WaterData {
  station: string;
  location: string;
  basin: string;
  level: number;
  bankLevel: number;
  status: string;
  diff: number;
  time: string;
}

interface HourlyPoint {
  label: string;
  value: number;
  isCurrent: boolean;
  isForecast: boolean;
}

// ─────────────────────────────────────────────
// Mock hourly data generator — ค่าเป็น 0 ทั้งหมด
// Timeline: ย้อนหลัง 24 ชม. + ปัจจุบัน + forecast 3 ชม. = 28 จุด
// ─────────────────────────────────────────────
function generateMockHourly(): HourlyPoint[] {
  const now = new Date();
  const points: HourlyPoint[] = [];

  // ย้อนหลัง 24 ชม. (i = 24 → 1)
  for (let i = 24; i >= 1; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000);
    const label = `${t.getDate()}-${t.toLocaleString("en", { month: "short" })} ${t
      .getHours()
      .toString()
      .padStart(2, "0")}:00`;
    points.push({ label, value: 0, isCurrent: false, isForecast: false });
  }

  // ปัจจุบัน (i = 0)
  {
    const t = new Date(now);
    const label = `${t.getDate()}-${t.toLocaleString("en", { month: "short" })} ${t
      .getHours()
      .toString()
      .padStart(2, "0")}:00`;
    points.push({ label, value: 0, isCurrent: true, isForecast: false });
  }

  // Forecast 3 ชม. ข้างหน้า (i = 1 → 3)
  for (let i = 1; i <= 3; i++) {
    const t = new Date(now.getTime() + i * 60 * 60 * 1000);
    const label = `${t.getDate()}-${t.toLocaleString("en", { month: "short" })} ${t
      .getHours()
      .toString()
      .padStart(2, "0")}:00`;
    points.push({ label, value: 0, isCurrent: false, isForecast: true });
  }

  return points; // รวม 28 จุด (24 + 1 ปัจจุบัน + 3 forecast)
}

// ─────────────────────────────────────────────
// Status badge color
// ─────────────────────────────────────────────
function statusColor(status: string) {
  switch (status) {
    case "หนักมาก":  return "bg-red-500 text-white";
    case "หนัก":     return "bg-orange-400 text-white";
    case "ปานกลาง":  return "bg-yellow-400 text-gray-900";
    case "เล็กน้อย": return "bg-blue-400 text-white";
    case "สูง":      return "bg-red-500 text-white";
    case "กลาง":     return "bg-yellow-400 text-gray-900";
    case "ต่ำ":      return "bg-green-400 text-white";
    case "น้ำท่วม": return "bg-red-600 text-white";
    default:         return "bg-gray-200 text-gray-600";
  }
}

// ─────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isForecast = payload[0]?.payload?.isForecast;
    return (
      <div className="rounded-lg border border-blue-100 bg-white px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-gray-700">
          {label}
          {isForecast && (
            <span className="ml-1.5 rounded-full bg-purple-100 px-1.5 py-0.5 text-purple-600 font-medium">
              พยากรณ์
            </span>
          )}
        </p>
        <p className="text-blue-600 font-bold mt-0.5">
          {payload[0].value} มม.
        </p>
      </div>
    );
  }
  return null;
};

// ─────────────────────────────────────────────
// Custom dot — สีม่วงสำหรับ forecast
// ─────────────────────────────────────────────
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  const color = payload.isForecast ? "#a855f7" : "#3b82f6";
  return <circle cx={cx} cy={cy} r={3} fill={color} stroke="white" strokeWidth={1} />;
};

const CustomActiveDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  const color = payload.isForecast ? "#a855f7" : "#3b82f6";
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={1.5} />;
};

// ─────────────────────────────────────────────
// ChartModal
// ─────────────────────────────────────────────
interface ChartModalProps {
  station: WaterData;
  onClose: () => void;
}

const ChartModal = ({ station, onClose }: ChartModalProps) => {
  const data = useMemo(() => generateMockHourly(), [station.station]);

  const currentLabel = data.find((d) => d.isCurrent)?.label ?? "";
  const firstForecastLabel = data.find((d) => d.isForecast)?.label ?? "";

  // ticks ทุก 3 ชม.
  const tickLabels = data.filter((_, i) => i % 3 === 0).map((d) => d.label);

  // segment สีม่วงสำหรับ forecast (ใช้ ReferenceLine ทำ background)
  const lastLabel = data[data.length - 1]?.label ?? "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4 rounded-2xl bg-white shadow-2xl border border-blue-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              กราฟฝน — {station.station}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{station.location}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-0.5 flex-shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="ปิด"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sub-header */}
        <div className="flex flex-wrap gap-3 px-5 py-3 bg-blue-50/60 text-xs text-gray-500 border-b border-blue-100">
          <span>{station.basin}</span>
          <span>อัปเดตล่าสุด: {station.time}</span>
          <span
            className={`ml-auto inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(station.status)}`}
          >
            {station.status}
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 pt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
            ข้อมูลย้อนหลัง 24 ชม.
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-purple-500" />
            พยากรณ์ล่วงหน้า 3 ชม.
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 bg-red-400" style={{ borderTop: "2px dashed #f87171" }} />
            ปัจจุบัน
          </span>
        </div>

        {/* Chart */}
        <div className="px-4 pt-2 pb-5">
          <p className="text-[11px] font-medium text-gray-400 mb-2 uppercase tracking-wide">
            ปริมาณน้ำฝนรายชั่วโมง (มม.) — ย้อนหลัง 24 ชม. + พยากรณ์ 3 ชม.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 8, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                {/* พื้นหลังสีม่วงอ่อนสำหรับโซน forecast */}
                <linearGradient id="forecastBg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#f5f3ff" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#f5f3ff" stopOpacity={0.8} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

              <XAxis
                dataKey="label"
                ticks={tickLabels}
                tick={{ fontSize: 9, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                unit=" มม."
              />

              <Tooltip content={<CustomTooltip />} />

              {/* เส้นแดงประ = ปัจจุบัน */}
              <ReferenceLine
                x={currentLabel}
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                label={{
                  value: "ปัจจุบัน",
                  position: "top",
                  fontSize: 10,
                  fill: "#ef4444",
                  fontWeight: 600,
                }}
              />

              {/* เส้นม่วงประ = เริ่ม forecast */}
              <ReferenceLine
                x={firstForecastLabel}
                stroke="#a855f7"
                strokeWidth={1}
                strokeDasharray="3 3"
              />

              {/* พื้นที่ใต้กราฟ */}
              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill="url(#rainGradient)"
              />

              {/* เส้นกราฟ — สีเปลี่ยนตาม isForecast ด้วย dot custom */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={<CustomActiveDot />}
                strokeDasharray="0"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 pb-4">
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

// ─────────────────────────────────────────────
// WaterTable (main export)
// ─────────────────────────────────────────────
interface WaterTableProps {
  data: WaterData[];
}

const WaterTable = ({ data }: WaterTableProps) => {
  const [selectedStation, setSelectedStation] = useState<WaterData | null>(null);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                ชื่อสถานี
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                ที่ตั้ง
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                เวลา
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                ฝนล่าสุด (มม.) ↓
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                กราฟ
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 transition-colors hover:bg-blue-50/40"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{row.station}</td>
                  <td className="px-4 py-3 text-gray-500">{row.location}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{row.time}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center rounded-md px-2.5 py-1 text-sm font-bold min-w-[48px] ${statusColor(row.status)}`}
                    >
                      {row.level}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <button
                      onClick={() => setSelectedStation(row)}
                      title="ดูกราฟรายชั่วโมง"
                      className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 p-1.5 text-blue-500 transition-all hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300 hover:scale-110 active:scale-95"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedStation && (
        <ChartModal
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
        />
      )}
    </div>
  );
};

export default WaterTable;