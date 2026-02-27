"use client";
import React, { useState, useEffect, useMemo } from "react";
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
  station:      string;
  location:     string;
  basin:        string;
  level:        number;
  bankLevel:    number;
  status:       string;
  diff:         number;
  time:         string;
  stationCode?: string; // ← เพิ่มใหม่
}

interface HourlyPoint {
  label:      string;
  value:      number;
  isCurrent:  boolean;
  isForecast: boolean;
}

interface ForecastItem {
  station_code:      string;
  station_name:      string;
  forecast_datetime: string;
  rainfall_mm:       number;
  lead_hour:         number;
  model_run_time:    string;
}

interface ForecastResponse {
  run:          { run_time: string };
  count:        number;
  station_code: string;
  data:         ForecastItem[];
}

// ─────────────────────────────────────────────
// แปลง API response → HourlyPoint[]
// lead_hour <= 0 = ข้อมูลจริง (น้ำเงิน)
// lead_hour > 0  = พยากรณ์ (ม่วง)
// ─────────────────────────────────────────────
function toHourlyPoints(items: ForecastItem[]): HourlyPoint[] {
  const now = new Date();

  const sorted = [...items].sort(
    (a, b) =>
      new Date(a.forecast_datetime).getTime() -
      new Date(b.forecast_datetime).getTime()
  );

  // หา index ที่ใกล้เวลาปัจจุบันที่สุด
  let closestIdx = 0;
  let minDiff = Infinity;
  sorted.forEach((item, i) => {
    const diff = Math.abs(new Date(item.forecast_datetime).getTime() - now.getTime());
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = i;
    }
  });

  return sorted.map((item, i) => {
    const t = new Date(item.forecast_datetime);
    const label = `${t.getDate()}-${t.toLocaleString("en", { month: "short" })} ${t
      .getHours()
      .toString()
      .padStart(2, "0")}:00`;

    return {
      label,
      value:      item.rainfall_mm,
      isCurrent:  i === closestIdx,
      isForecast: item.lead_hour > 0,
    };
  });
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
    case "น้ำท่วม":  return "bg-red-600 text-white";
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
  const [data, setData]       = useState<HourlyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [runTime, setRunTime] = useState<string | null>(null);

  useEffect(() => {
    if (!station.stationCode) {
      setData([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/rain/forecast-timeseries?station_code=${station.stationCode}&limit=500`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ForecastResponse = await res.json();
        setRunTime(json.run?.run_time ?? null);
        setData(toHourlyPoints(json.data ?? []));
      } catch (e: any) {
        setError(e.message ?? "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [station.stationCode]);

  const currentLabel       = data.find((d) => d.isCurrent)?.label ?? "";
  const firstForecastLabel = data.find((d) => d.isForecast)?.label ?? "";
  const tickLabels         = data.filter((_, i) => i % 3 === 0).map((d) => d.label);

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
          {runTime && (
            <span className="text-purple-500">
              รันโมเดล: {new Date(runTime).toLocaleString("th-TH", {
                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
              })}
            </span>
          )}
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
            ข้อมูลย้อนหลัง
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-purple-500" />
            พยากรณ์ล่วงหน้า
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 bg-red-400" style={{ borderTop: "2px dashed #f87171" }} />
            ปัจจุบัน
          </span>
        </div>

        {/* Chart */}
        <div className="px-4 pt-2 pb-5">
          <p className="text-[11px] font-medium text-gray-400 mb-2 uppercase tracking-wide">
            ปริมาณน้ำฝนรายชั่วโมง (มม.)
          </p>

          {loading ? (
            <div className="flex h-[220px] items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
                <svg className="h-6 w-6 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                กำลังโหลดข้อมูล...
              </div>
            </div>
          ) : error ? (
            <div className="flex h-[220px] items-center justify-center">
              <div className="flex flex-col items-center gap-1 text-sm text-red-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {error}
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">
              ไม่มีข้อมูลสถานีนี้
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data} margin={{ top: 8, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                {currentLabel && (
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
                )}

                {/* เส้นม่วงประ = เริ่ม forecast */}
                {firstForecastLabel && firstForecastLabel !== currentLabel && (
                  <ReferenceLine
                    x={firstForecastLabel}
                    stroke="#a855f7"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                )}

                {/* พื้นที่ใต้กราฟ */}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="none"
                  fill="url(#rainGradient)"
                />

                {/* เส้นกราฟ */}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={<CustomDot />}
                  activeDot={<CustomActiveDot />}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
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