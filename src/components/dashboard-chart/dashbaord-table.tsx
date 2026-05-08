"use client";
import React, { useState, useEffect } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface WaterData {
  station: string;
  location: string;
  basin: string;
  level: number;
  bankLevel: number;
  status: string;
  diff: number;
  time: string;
  stationCode?: string;
}

interface HourlyPoint {
  label: string;
  value: number;
  actual: number | null;
  forecast: number | null;
  isCurrent: boolean;
  isForecast: boolean;
}

interface ForecastItem {
  station_code: string;
  station_name: string;
  forecast_datetime: string;
  rainfall_mm: number;
  lead_hour: number;
  model_run_time: string;
}

interface ForecastResponse {
  run: { run_time: string };
  count: number;
  station_code: string;
  data: ForecastItem[];
}

function toHourlyPoints(items: ForecastItem[]): HourlyPoint[] {
  const now = new Date();
  const sorted = [...items].sort(
    (a, b) =>
      new Date(a.forecast_datetime).getTime() -
      new Date(b.forecast_datetime).getTime(),
  );

  let closestIdx = 0;
  let minDiff = Infinity;
  sorted.forEach((item, i) => {
    const diff = Math.abs(
      new Date(item.forecast_datetime).getTime() - now.getTime(),
    );
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = i;
    }
  });

  const firstForecastIdx = sorted.findIndex((item) => item.lead_hour > 0);

  return sorted.map((item, i) => {
    const t = new Date(item.forecast_datetime);
    const label = `${t.getDate()}-${t.toLocaleString("en", {
      month: "short",
    })} ${t.getHours().toString().padStart(2, "0")}:00`;

    const isForecast = item.lead_hour > 0;

    return {
      label,
      value: item.rainfall_mm,
      actual: !isForecast || i === firstForecastIdx ? item.rainfall_mm : null,
      forecast: isForecast
        ? item.rainfall_mm
        : i === firstForecastIdx - 1
          ? item.rainfall_mm
          : null,
      isCurrent: i === closestIdx,
      isForecast,
    };
  });
}

// ── ตัดข้อมูลให้ได้อัตราส่วน actual:forecast = 3:2 ──
function sliceByRatio(points: HourlyPoint[]): HourlyPoint[] {
  const actualPoints = points.filter((p) => p.actual !== null);
  const forecastPoints = points.filter((p) => p.forecast !== null);

  if (actualPoints.length === 0 || forecastPoints.length === 0) return points;

  const unit = Math.min(
    Math.floor(actualPoints.length / 3),
    Math.floor(forecastPoints.length / 2),
  );

  if (unit === 0) return points;

  // เอา actual ล่าสุด (tail) 3 ส่วน + forecast แรกสุด (head) 2 ส่วน
  // หา index ของ actual จุดสุดท้ายที่ต้องการ
  const lastActualKeep = actualPoints[actualPoints.length - 1];
  const firstActualKeep = actualPoints[actualPoints.length - unit * 3];
  const lastForecastKeep = forecastPoints[unit * 2 - 1];

  // กรองจาก array ต้นฉบับโดยใช้ label เป็น key
  const keepActualLabels = new Set(
    actualPoints.slice(-(unit * 3)).map((p) => p.label),
  );
  const keepForecastLabels = new Set(
    forecastPoints.slice(0, unit * 2).map((p) => p.label),
  );

  // รวม label ที่ต้องการ (union)
  const keepLabels = new Set([...keepActualLabels, ...keepForecastLabels]);

  // คืน array ต้นฉบับที่ filter เฉพาะ label ที่ต้องการ (รักษาลำดับ + ข้อมูลครบ)
  return points.filter((p) => keepLabels.has(p.label));
}

function statusColor(status: string) {
  switch (status) {
    case "หนักมาก":
      return "bg-red-500 text-white";
    case "หนัก":
      return "bg-orange-400 text-white";
    case "ปานกลาง":
      return "bg-yellow-400 text-gray-900";
    case "เล็กน้อย":
      return "bg-blue-400 text-white";
    case "สูง":
      return "bg-red-500 text-white";
    case "กลาง":
      return "bg-yellow-400 text-gray-900";
    case "ต่ำ":
      return "bg-green-400 text-white";
    case "น้ำท่วม":
      return "bg-red-600 text-white";
    default:
      return "bg-gray-200 text-gray-600";
  }
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isForecast = payload[0]?.payload?.isForecast;
    const val = payload[0]?.payload?.value;
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
        <p
          className={`font-bold mt-0.5 ${isForecast ? "text-purple-600" : "text-blue-600"}`}
        >
          {val} มม.
        </p>
      </div>
    );
  }
  return null;
};

interface ChartModalProps {
  station: WaterData;
  onClose: () => void;
}

const ChartModal = ({ station, onClose }: ChartModalProps) => {
  const [data, setData] = useState<HourlyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          `/api/rain/forecast-timeseries?station_code=${station.stationCode}&limit=500`,
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

  // ── สัดส่วน 3:2 แล้ว sample ทุก 6 จุด ──
  const ratioData = sliceByRatio(data);
  const displayData = ratioData.filter((_, i) => i % 2 === 0);

  const currentLabel =
    displayData.find((d) => d.isCurrent)?.label ??
    data.find((d) => d.isCurrent)?.label ??
    "";
  const firstForecastLabel = displayData.find((d) => d.isForecast)?.label ?? "";
  const tickLabels = displayData
    .filter((_, i) => i % 6 === 0)
    .map((d) => d.label);

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
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Sub-header */}
        <div className="flex flex-wrap gap-3 px-5 py-3 bg-blue-50/60 text-xs text-gray-500 border-b border-blue-100">
          <span>{station.basin}</span>
          <span>อัปเดตล่าสุด: {station.time}</span>
          {runTime && (
            <span className="text-purple-500">
              รันโมเดล:{" "}
              {new Date(runTime).toLocaleString("th-TH", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
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
            <span className="inline-block h-3 w-4 rounded-sm bg-blue-500" />
            ข้อมูลย้อนหลัง
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-4 rounded-sm bg-purple-400 opacity-75" />
            พยากรณ์ล่วงหน้า
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-5"
              style={{ borderTop: "2px dashed #f87171" }}
            />
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
                <svg
                  className="h-6 w-6 animate-spin text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                กำลังโหลดข้อมูล...
              </div>
            </div>
          ) : error ? (
            <div className="flex h-[220px] items-center justify-center">
              <div className="flex flex-col items-center gap-1 text-sm text-red-400">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
                {error}
              </div>
            </div>
          ) : displayData.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">
              ไม่มีข้อมูลสถานีนี้
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart
                data={displayData}
                margin={{ top: 8, right: 10, left: -10, bottom: 5 }}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />

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

                {firstForecastLabel && firstForecastLabel !== currentLabel && (
                  <ReferenceLine
                    x={firstForecastLabel}
                    stroke="#a855f7"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                )}

                {/* แท่ง actual — น้ำเงิน */}
                <Bar
                  dataKey="actual"
                  name="ย้อนหลัง"
                  fill="#3b82f6"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={40}
                />

                {/* แท่ง forecast — ม่วง */}
                <Bar
                  dataKey="forecast"
                  name="พยากรณ์"
                  fill="#a855f7"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={40}
                  opacity={0.75}
                />
              </ComposedChart>
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

interface WaterTableProps {
  data: WaterData[];
}

const WaterTable = ({ data }: WaterTableProps) => {
  const [selectedStation, setSelectedStation] = useState<WaterData | null>(
    null,
  );

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
                <td
                  colSpan={5}
                  className="py-12 text-center text-sm text-gray-400"
                >
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 transition-colors hover:bg-blue-50/40"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {row.station}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{row.location}</td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {row.time}
                  </td>
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
                      className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 p-1.5 text-blue-500 transition-all hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300 hover:scale-110 active:scale-95"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
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
