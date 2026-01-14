"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { CombinedPredictionChart } from "./prediction-chart";
import { Button } from "@/components/ui/button";

/* ------------------ types ------------------ */

interface Station {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    area: string;
  };
}

interface PredictionModalProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PredictionData {
  time: string;
  datetime: Date;
  predicted24h: number | null;
  predicted72h: number | null;
  leadHour: number;
}

interface ForecastResponse {
  run: {
    run_time: string;
  };
  count: number;
  station_code: string;
  data: Array<{
    station_code: string;
    station_name: string;
    forecast_datetime: string;
    rainfall_mm: number;
    lead_hour: number;
    model_run_time: string;
  }>;
}

// 🎨 ธีมสีหลัก
const THEME_COLOR = "#A73B24";
const THEME_COLOR_LIGHT = "#C85C43";
const THEME_COLOR_LIGHTER = "#E8A598";

/* ------------------ component ------------------ */

export const PredictionModal: React.FC<PredictionModalProps> = ({
  station,
  isOpen,
  onClose,
}) => {
  const [combinedData, setCombinedData] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelRunTime, setModelRunTime] = useState<string>("");
  const [stats24h, setStats24h] = useState({ max: 0, avg: 0, count: 0 });
  const [stats72h, setStats72h] = useState({ max: 0, avg: 0, count: 0 });

  /* ------------------ fetch forecast ------------------ */
  useEffect(() => {
    if (!station || !isOpen) return;

    const fetchForecast = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching for station:', station.id);

        const res = await fetch(
          `/api/rain/forecast-timeseries?station_code=${station.id}&limit=500`
        );

        console.log('📡 Response status:', res.status);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json: ForecastResponse = await res.json();
        console.log('📊 Data received:', json);

        // Set model run time
        if (json.run?.run_time) {
          const runDate = new Date(json.run.run_time);
          setModelRunTime(
            runDate.toLocaleString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        }

        // สร้างข้อมูลรวม 72 ชั่วโมง
        const chartData: PredictionData[] = [];
        
        for (let i = 0; i < 72; i++) {
          const item = json.data?.find(d => d.lead_hour === i);
          
          if (item) {
            const dt = new Date(item.forecast_datetime);
            chartData.push({
              time: dt.toLocaleString("th-TH", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }),
              datetime: dt,
              predicted24h: i < 24 ? (item.rainfall_mm ?? 0) : null,
              predicted72h: item.rainfall_mm ?? 0,
              leadHour: i,
            });
          }
        }

        setCombinedData(chartData);

        // Calculate stats for 24h
        const data24h = chartData.filter(d => d.predicted24h !== null);
        if (data24h.length > 0) {
          const values24h = data24h.map(d => d.predicted24h!);
          setStats24h({
            max: Math.max(...values24h),
            avg: values24h.reduce((a, b) => a + b, 0) / values24h.length,
            count: data24h.length,
          });
        }

        // Calculate stats for 72h
        const data72h = chartData.filter(d => d.predicted72h !== null);
        if (data72h.length > 0) {
          const values72h = data72h.map(d => d.predicted72h!);
          setStats72h({
            max: Math.max(...values72h),
            avg: values72h.reduce((a, b) => a + b, 0) / values72h.length,
            count: data72h.length,
          });
        }

      } catch (err: any) {
        console.error('❌ Fetch error:', err);
        setError(`ไม่สามารถโหลดข้อมูลพยากรณ์ได้: ${err.message}`);
        setCombinedData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [station, isOpen]);

  // 🔁 กลับหัวท้ายข้อมูลก่อน plot
  const reversedData = useMemo(
    () => [...combinedData].reverse(),
    [combinedData]
  );

  if (!isOpen || !station) return null;

  /* ------------------ render ------------------ */

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-6xl sm:mx-4 max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - ใช้สีธีม */}
        <div 
          className="sticky top-0 text-white px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between z-10 shadow-lg"
          style={{ background: `linear-gradient(to right, ${THEME_COLOR}, ${THEME_COLOR_LIGHT})` }}
        >
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="text-lg sm:text-xl font-bold truncate flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              กราฟการคาดการณ์ปริมาณฝน
            </h2>
            <p className="text-xs sm:text-sm opacity-90 mt-1 truncate">
              {station.name} – {station.location.area}
            </p>
            {modelRunTime && (
              <p className="text-xs opacity-80 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                รันโมเดล: {modelRunTime}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div 
                  className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                  style={{ borderColor: THEME_COLOR }}
                ></div>
                <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                <p className="text-xs text-gray-400 mt-2">Station: {station?.id}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 font-medium mb-2">{error}</p>
              <p className="text-xs text-gray-600">Station ID: {station?.id}</p>
              <p className="text-xs text-gray-600 mt-1">
                API: /api/rain/forecast-timeseries?station_code={station?.id}&limit=500
              </p>
            </div>
          )}

          {!loading && !error && (
            <>
              {combinedData.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <p className="text-yellow-800 font-medium">ไม่พบข้อมูลพยากรณ์</p>
                  <p className="text-sm text-yellow-600 mt-2">
                    ไม่มีข้อมูลสำหรับสถานี {station.id}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Combined Chart */}
                  <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">
                        พยากรณ์ปริมาณฝน 24-72 ชั่วโมง
                      </h3>
                      <div className="flex gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-0.5" style={{ backgroundColor: THEME_COLOR }}></div>
                          <span className="text-gray-600">24 ชม.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-0.5 border-t border-dashed"
                            style={{ borderColor: THEME_COLOR }}
                          ></div>
                          <span className="text-gray-600">72 ชม.</span>
                        </div>
                      </div>
                    </div>
                    
                    <CombinedPredictionChart
                      stationName={station.name}
                      stationId={station.id}
                      data={reversedData}
                      unit="มม."
                      height={400}
                      color={THEME_COLOR}
                    />
                  </div>

                  {/* Statistics - ใช้สีธีม */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 24h Stats */}
                    <div 
                      className="rounded-xl p-4 border bg-white"
                      style={{ 
                        borderColor: THEME_COLOR_LIGHT
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: THEME_COLOR }}
                        ></div>
                        <h4 className="font-bold text-gray-900">สถิติ 24 ชั่วโมง</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">ปริมาณสูงสุด</p>
                          <p 
                            className="text-lg font-bold"
                            style={{ color: THEME_COLOR }}
                          >
                            {stats24h.max.toFixed(1)} มม.
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">ค่าเฉลี่ย</p>
                          <p 
                            className="text-lg font-bold"
                            style={{ color: THEME_COLOR }}
                          >
                            {stats24h.avg.toFixed(1)} มม.
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">จำนวนข้อมูล</p>
                          <p 
                            className="text-lg font-bold"
                            style={{ color: THEME_COLOR }}
                          >
                            {stats24h.count}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 72h Stats */}
                    <div 
                      className="rounded-xl p-4 border bg-white"
                      style={{ 
                        borderColor: THEME_COLOR_LIGHT
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: THEME_COLOR_LIGHT }}
                        ></div>
                        <h4 className="font-bold text-gray-900">สถิติ 72 ชั่วโมง</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">ปริมาณสูงสุด</p>
                          <p 
                            className="text-lg font-bold"
                            style={{ color: THEME_COLOR }}
                          >
                            {stats72h.max.toFixed(1)} มม.
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">ค่าเฉลี่ย</p>
                          <p 
                            className="text-lg font-bold"
                            style={{ color: THEME_COLOR }}
                          >
                            {stats72h.avg.toFixed(1)} มม.
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">จำนวนข้อมูล</p>
                          <p 
                            className="text-lg font-bold"
                            style={{ color: THEME_COLOR }}
                          >
                            {stats72h.count}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Info */}
                  <div 
                    className="rounded-xl p-4 border border-gray-200"
                    style={{ background: `linear-gradient(to right, #f9fafb, ${THEME_COLOR_LIGHTER}15)` }}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">สถานี</p>
                        <p className="font-semibold text-gray-900">{station.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">รหัสสถานี</p>
                        <p className="font-semibold text-gray-900">{station.id}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-gray-600 mb-1">ช่วงเวลา</p>
                        <p className="font-semibold text-gray-900">
                          {combinedData[0]?.time} - {combinedData[combinedData.length - 1]?.time}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 sm:px-6 flex justify-between items-center shadow-lg">
          <p className="text-xs text-gray-500">
            ข้อมูลอัพเดท: {new Date().toLocaleString("th-TH")}
          </p>
          <Button
            variant="outline"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            ปิด
          </Button>
        </div>
      </div>
    </div>
  );
};