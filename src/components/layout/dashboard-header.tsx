"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Wifi, ChevronUp, ChevronDown } from "lucide-react";

// Types for API response
interface StationData {
  [key: string]: number;
}

interface RainData {
  file: string;
  datetime: string;
  datetime_ts: number;
  stations: StationData;
}

interface ApiResponse {
  status: string;
  total: number;
  limit: number;
  offset: number;
  returned: number;
  data: RainData[];
}

interface RainStats {
  maxValue: number;
  maxStation: string;
  hasRain: boolean;
}

export const DashboardHeader = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [rainData1hr, setRainData1hr] = useState<RainData | null>(null);
  const [rainData3hr, setRainData3hr] = useState<RainData | null>(null);
  const [rainData24hr, setRainData24hr] = useState<RainData | null>(null);
  const [tempMax, setTempMax] = useState<number | null>(null);
  const [tempMin, setTempMin] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Station name mapping - memoized
  const stationNames = useMemo(
    (): Record<string, string> => ({
      SNK_HOSP: "โรงพยาบาลศรีนครินทร์",
      KKC_MUN: "เทศบาลนครขอนแก่น",
      BKN: "บึงแก่นนคร",
      BTS: "บึงทุ่งสร้าง",
      NLP: "หนองเล็งเปีย",
      BNK: "บึงหนองโคตร",
      SIL_MUN: "เทศบาลเมืองศิลา",
      UNE_MC: "ศูนย์อุตุนิยมวิทยากาคตะวันออกเฉียงเหนือตอนบน",
      MKO_MUN: "เทศบาลเมือนเก่า",
      NEU: "มหาวิทยาลัยภาคตะวันออกเฉียงเหนือ",
      UNE_SH: "บ้านพักพนักงานอุตุฯ",
      KKC_SP: "อุทยานวิทยาศาสตร์มหาวิทยาลัยขอนแก่น",
      BSV: "หมู่บ้านสีวลี",
      RMUTI: "มหาวิทยาลัยเทยขนำหงคลอิสาน วิทยาเขตขอนแก่น",
      KKC_BL: "โรงเรียนสอนคนตาบอด",
    }),
    []
  );

  // Calculate rain statistics for 1hr - memoized
  const rain1hr = useMemo(() => {
    if (!rainData1hr) {
      return { maxValue: 0, maxStation: "", hasRain: false };
    }

    const stations = rainData1hr.stations;
    let maxValue = 0;
    let maxStation = "";
    let hasRain = false;

    Object.entries(stations).forEach(([station, value]) => {
      const cleanStation = station.replace(/\r/g, "");
      if (value > maxValue) {
        maxValue = value;
        maxStation = cleanStation;
        hasRain = value > 0;
      }
    });

    return {
      maxValue,
      maxStation: stationNames[maxStation] || maxStation,
      hasRain,
    };
  }, [rainData1hr, stationNames]);

  // Calculate rain statistics for 3hr - memoized
  const rain3hr = useMemo(() => {
    if (!rainData3hr) {
      return { maxValue: 0, maxStation: "", hasRain: false };
    }

    const stations = rainData3hr.stations;
    let maxValue = 0;
    let maxStation = "";
    let hasRain = false;

    Object.entries(stations).forEach(([station, value]) => {
      const cleanStation = station.replace(/\r/g, "");
      if (value > maxValue) {
        maxValue = value;
        maxStation = cleanStation;
        hasRain = value > 0;
      }
    });

    return {
      maxValue,
      maxStation: stationNames[maxStation] || maxStation,
      hasRain,
    };
  }, [rainData3hr, stationNames]);

  // Calculate rain statistics for 24hr - memoized
  const rain24hr = useMemo(() => {
    if (!rainData24hr) {
      return { maxValue: 0, maxStation: "", hasRain: false };
    }

    const stations = rainData24hr.stations;
    let maxValue = 0;
    let maxStation = "";
    let hasRain = false;

    Object.entries(stations).forEach(([station, value]) => {
      const cleanStation = station.replace(/\r/g, "");
      if (value > maxValue) {
        maxValue = value;
        maxStation = cleanStation;
        hasRain = value > 0;
      }
    });

    return {
      maxValue,
      maxStation: stationNames[maxStation] || maxStation,
      hasRain,
    };
  }, [rainData24hr, stationNames]);

  useEffect(() => {
    // ===========================
    // ดึงข้อมูลอุณหภูมิ ขอนแก่น
    // ===========================
    const fetchTemperature = async () => {
      try {
        const url =
          "https://api.open-meteo.com/v1/forecast?latitude=16.4419&longitude=102.8350&hourly=temperature_2m&timezone=Asia/Bangkok&past_days=1";

        const res = await fetch(url);
        const data = await res.json();

        const temps: number[] = data.hourly.temperature_2m;

        const maxT = Math.max(...temps);
        const minT = Math.min(...temps);

        setTempMax(maxT);
        setTempMin(minT);
      } catch (err) {
        console.error("Temperature API error:", err);
        setTempMax(null);
        setTempMin(null);
      }
    };

    // เรียกครั้งแรกตอน component โหลด
    fetchTemperature();

    // ตั้งเวลา refresh ทุก 5 นาที
    const interval = setInterval(() => {
      fetchTemperature();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch data from API
  useEffect(() => {
    const fetchRainData = async () => {
      try {
        setIsLoading(true);

        // Fetch all three APIs in parallel
        const [response1hr, response3hr, response24hr] = await Promise.all([
          fetch("http://10.198.110.39:3000/api/rain_1hr_2km?limit=1"),
          fetch("http://10.198.110.39:3000/api/rain_3hr_2km?limit=1"),
          fetch("http://10.198.110.39:3000/api/rain_24hr_2km?limit=1"),
        ]);

        const [data1hr, data3hr, data24hr]: [
          ApiResponse,
          ApiResponse,
          ApiResponse
        ] = await Promise.all([
          response1hr.json(),
          response3hr.json(),
          response24hr.json(),
        ]);

        // Set 1hr data
        if (data1hr.status === "success" && data1hr.data.length > 0) {
          setRainData1hr(data1hr.data[0]);
        } else {
          setRainData1hr(null);
        }

        // Set 3hr data
        if (data3hr.status === "success" && data3hr.data.length > 0) {
          setRainData3hr(data3hr.data[0]);
        } else {
          setRainData3hr(null);
        }

        // Set 24hr data
        if (data24hr.status === "success" && data24hr.data.length > 0) {
          setRainData24hr(data24hr.data[0]);
        } else {
          setRainData24hr(null);
        }
      } catch (error) {
        console.error("Error fetching rain data:", error);
        setRainData1hr(null);
        setRainData3hr(null);
        setRainData24hr(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRainData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchRainData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#ead0c7] bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center">
        {/* Logo and Title Section */}
        <div className="mt-2 flex w-full flex-col items-center">
          <div className="flex w-full flex-col items-center justify-center space-y-2 bg-[#fff5f2] px-2 py-3 shadow-sm sm:flex-row sm:space-x-3 sm:space-y-0 sm:px-4">
            {/* Logos */}
            <div className="flex flex-row items-center gap-2 sm:gap-3">
              <img
                src="/uni.png"
                alt="UNI Logo"
                width={40}
                height={40}
                className="object-contain drop-shadow-sm sm:h-[60px] sm:w-[60px]"
              />
              <img
                src="/w_ch.png"
                alt="W CH Logo"
                width={28}
                height={28}
                className="object-contain drop-shadow-sm sm:h-[35px] sm:w-[35px]"
              />
              <img
                src="/tsri.svg"
                alt="TSRI Logo"
                width={28}
                height={28}
                className="object-contain drop-shadow-sm sm:h-[35px] sm:w-[35px]"
              />
              <img
                src="/kku.png"
                alt="KKU Logo"
                width={40}
                height={40}
                className="-ml-1 object-contain drop-shadow-sm sm:-ml-4 sm:h-[60px] sm:w-[60px]"
              />
            </div>

            {/* Title */}
            <div className="flex flex-col items-center px-2 text-center">
              <h1 className="text-base font-bold leading-tight text-[#2c120c] sm:text-xl lg:text-2xl">
                ระบบสนับสนุนการเตือนภัยและแนวทางการป้องกันน้ำท่วมในเขตเมืองขอนแก่น
              </h1>
              <h2 className="text-xs text-[#6f4a41] sm:text-sm">
                Flood Warning System and Prevention Measures in Khon Kaen City
              </h2>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 shadow-md transition-all hover:bg-white hover:shadow-lg sm:right-4 sm:top-4 sm:p-2"
              aria-label={isExpanded ? "ซ่อนข้อมูล" : "แสดงข้อมูล"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-[#4b1f17] sm:h-5 sm:w-5" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[#4b1f17] sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Stats Section - Collapsible */}
        {isExpanded && (
          <div className="flex w-full flex-col gap-2 border-t border-[#ead0c7] px-2 py-2 text-[#2c120c] sm:gap-3 sm:px-4 sm:py-3">
            {/* Desktop: Single row */}
            <div className="hidden flex-row items-center justify-between lg:flex">
              <StatCard
                title="ปริมาณน้ำฝนสะสมสูงสุด 1 ชม."
                value={
                  isLoading
                    ? "..."
                    : rain1hr.hasRain
                    ? rain1hr.maxValue.toFixed(1)
                    : "0"
                }
                unit={rain1hr.hasRain ? "มม." : ""}
                location={
                  isLoading
                    ? "กำลังโหลด..."
                    : rain1hr.hasRain
                    ? rain1hr.maxStation
                    : "ขณะนี้ไม่มีฝนตก"
                }
              />
              <StatCard
                title="ปริมาณน้ำฝนสะสมสูงสุด 3 ชม."
                value={
                  isLoading
                    ? "..."
                    : rain3hr.hasRain
                    ? rain3hr.maxValue.toFixed(1)
                    : "0"
                }
                unit={rain3hr.hasRain ? "มม." : ""}
                location={
                  isLoading
                    ? "กำลังโหลด..."
                    : rain3hr.hasRain
                    ? rain3hr.maxStation
                    : "ขณะนี้ไม่มีฝนตก"
                }
              />
              <StatCard
                title="ปริมาณน้ำฝนสะสมสูงสุด 24 ชม."
                value={
                  isLoading
                    ? "..."
                    : rain24hr.hasRain
                    ? rain24hr.maxValue.toFixed(1)
                    : "0"
                }
                unit={rain24hr.hasRain ? "มม." : ""}
                location={
                  isLoading
                    ? "กำลังโหลด..."
                    : rain24hr.hasRain
                    ? rain24hr.maxStation
                    : "ขณะนี้ไม่มีฝนตก"
                }
              />
              <TemperatureCard tempMax={tempMax} tempMin={tempMin} />
              <StatCard
                title="ปริมาณน้ำในบึงทั้งหมด"
                value="ไม่พบข้อมูล"
                unit="ไม่พบข้อมูล ลบ.ซม."
              />
              <TelemetryCard />
            </div>

            {/* Tablet: Two rows */}
            <div className="hidden flex-col gap-3 md:flex lg:hidden">
              <div className="flex flex-row items-center justify-around">
                <StatCard
                  title="ปริมาณน้ำฝนสะสมสูงสุด 1 ชม."
                  value={
                    isLoading
                      ? "..."
                      : rain1hr.hasRain
                      ? rain1hr.maxValue.toFixed(1)
                      : "0"
                  }
                  unit={rain1hr.hasRain ? "มม." : ""}
                  location={
                    isLoading
                      ? "กำลังโหลด..."
                      : rain1hr.hasRain
                      ? rain1hr.maxStation
                      : "ขณะนี้ไม่มีฝนตก"
                  }
                  compact
                />
                <StatCard
                  title="ปริมาณน้ำฝนสะสมสูงสุด 3 ชม."
                  value={
                    isLoading
                      ? "..."
                      : rain3hr.hasRain
                      ? rain3hr.maxValue.toFixed(1)
                      : "0"
                  }
                  unit={rain3hr.hasRain ? "มม." : ""}
                  location={
                    isLoading
                      ? "กำลังโหลด..."
                      : rain3hr.hasRain
                      ? rain3hr.maxStation
                      : "ขณะนี้ไม่มีฝนตก"
                  }
                  compact
                />
                <StatCard
                  title="ปริมาณน้ำฝนสะสมสูงสุด 24 ชม."
                  value={
                    isLoading
                      ? "..."
                      : rain24hr.hasRain
                      ? rain24hr.maxValue.toFixed(1)
                      : "0"
                  }
                  unit={rain24hr.hasRain ? "มม." : ""}
                  location={
                    isLoading
                      ? "กำลังโหลด..."
                      : rain24hr.hasRain
                      ? rain24hr.maxStation
                      : "ขณะนี้ไม่มีฝนตก"
                  }
                  compact
                />
              </div>
              <div className="flex flex-row items-center justify-around">
                <TemperatureCard compact tempMax={tempMax} tempMin={tempMin} />
                <StatCard
                  title="ปริมาณน้ำในบึงทั้งหมด"
                  value="ไม่พบข้อมูล"
                  unit="ไม่พบข้อมูล ลบ.ซม."
                  compact
                />
                <TelemetryCard compact />
              </div>
            </div>

            {/* Mobile: Grid layout */}
            <div className="grid grid-cols-2 gap-2 md:hidden">
              <StatCard
                title="น้ำฝน 1 ชม."
                value={
                  isLoading
                    ? "..."
                    : rain1hr.hasRain
                    ? rain1hr.maxValue.toFixed(1)
                    : "0"
                }
                unit={rain1hr.hasRain ? "มม." : ""}
                location={
                  isLoading
                    ? "..."
                    : rain1hr.hasRain
                    ? rain1hr.maxStation
                    : "ไม่มีฝนตก"
                }
                mobile
              />
              <StatCard
                title="น้ำฝน 3 ชม."
                value={
                  isLoading
                    ? "..."
                    : rain3hr.hasRain
                    ? rain3hr.maxValue.toFixed(1)
                    : "0"
                }
                unit={rain3hr.hasRain ? "มม." : ""}
                location={
                  isLoading
                    ? "..."
                    : rain3hr.hasRain
                    ? rain3hr.maxStation
                    : "ไม่มีฝนตก"
                }
                mobile
              />
              <StatCard
                title="น้ำฝน 24 ชม."
                value={
                  isLoading
                    ? "..."
                    : rain24hr.hasRain
                    ? rain24hr.maxValue.toFixed(1)
                    : "0"
                }
                unit={rain24hr.hasRain ? "มม." : ""}
                location={
                  isLoading
                    ? "..."
                    : rain24hr.hasRain
                    ? rain24hr.maxStation
                    : "ไม่มีฝนตก"
                }
                mobile
              />
              <TemperatureCard mobile tempMax={tempMax} tempMin={tempMin} />
              <StatCard
                title="น้ำในบึงทั้งหมด"
                value="1,617"
                unit="(64%) ลบ.ซม."
                mobile
              />
              <TelemetryCard mobile />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  unit,
  location,
  compact = false,
  mobile = false,
}: {
  title: string;
  value: string;
  unit: string;
  location?: string;
  compact?: boolean;
  mobile?: boolean;
}) => {
  return (
    <div className="flex flex-col text-center">
      <div
        className={`font-semibold text-[#4b1f17] ${
          mobile ? "text-[10px]" : compact ? "text-xs" : "text-sm"
        }`}
      >
        {title}
      </div>
      <div
        className={`font-bold text-[#a73824] ${
          mobile ? "text-lg" : compact ? "text-xl" : "text-2xl"
        }`}
      >
        {value}
      </div>
      <div
        className={`text-[#8c6a61] ${
          mobile ? "text-[9px]" : compact ? "text-[10px]" : "text-xs"
        }`}
      >
        {unit}
      </div>
      {location && (
        <div
          className={`text-[#a73824] ${
            mobile ? "text-[9px]" : compact ? "text-[10px]" : "text-xs"
          }`}
        >
          {location}
        </div>
      )}
    </div>
  );
};

// Temperature Card Component
// Temperature Card Component
const TemperatureCard = ({
  compact = false,
  mobile = false,
  tempMax,
  tempMin,
}: {
  compact?: boolean;
  mobile?: boolean;
  tempMax: number | null;
  tempMin: number | null;
}) => {
  const maxText = tempMax !== null ? tempMax.toFixed(1) : "...";
  const minText = tempMin !== null ? tempMin.toFixed(1) : "...";

  return (
    <div className="flex flex-col text-center">
      <div
        className={`font-semibold text-[#4b1f17] mb-2 ${
          mobile ? "text-[10px]" : compact ? "text-xs" : "text-sm"
        }`}
      >
        อุณหภูมิในรอบสัปดาห์
      </div>

      <div
        className={`flex flex-col rounded-xl border border-[#edd9d4] bg-white shadow-sm ${
          mobile ? "px-2 py-1" : compact ? "px-2 py-1" : "px-3 py-1"
        }`}
      >
        <div
          className={`mb-1 font-semibold text-[#2b120d] ${
            mobile ? "text-[9px]" : compact ? "text-[10px]" : "text-[11px]"
          }`}
        >
          {/* อุณหภูมิในรอบสัปดาห์ */}
        </div>

        <div
          className={`flex items-center justify-center ${
            mobile ? "gap-2" : compact ? "gap-3" : "gap-4"
          }`}
        >
          {/* MAX */}
          <div className="flex flex-col items-center">
            <div
              className={`font-bold text-[#a73824] ${
                mobile ? "text-lg" : compact ? "text-xl" : "text-2xl"
              }`}
            >
              {maxText}
            </div>
            <div
              className={`flex items-center gap-0.5 text-[#7c584e] ${
                mobile ? "text-[8px]" : compact ? "text-[9px]" : "text-[10px]"
              }`}
            >
              <span>สูงสุด</span>
              <span className="text-[#d96a4c]">▲</span>
            </div>
          </div>

          {/* MIN */}
          <div className="flex flex-col items-center">
            <div
              className={`font-bold text-[#1f6f8b] ${
                mobile ? "text-lg" : compact ? "text-xl" : "text-2xl"
              }`}
            >
              {minText}
            </div>
            <div
              className={`flex items-center gap-0.5 text-[#7c584e] ${
                mobile ? "text-[8px]" : compact ? "text-[9px]" : "text-[10px]"
              }`}
            >
              <span>ต่ำสุด</span>
              <span className="text-gray-400">▼</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Telemetry Card Component
const TelemetryCard = ({
  compact = false,
  mobile = false,
}: {
  compact?: boolean;
  mobile?: boolean;
}) => {
  return (
    <div
      className={`flex flex-col items-center rounded-xl border border-[#edd9d4] bg-[#fff8f5] text-center shadow-sm ${
        mobile ? "px-2 py-1" : compact ? "px-2 py-1" : "px-3 py-2"
      }`}
    >
      <div
        className={`font-semibold text-[#4b1f17] ${
          mobile ? "text-[10px]" : compact ? "text-xs" : "text-sm"
        }`}
      >
        สถานสถานีโทรมาตร
      </div>
      <div
        className={`text-[#8c6a61] ${
          mobile ? "text-[8px]" : compact ? "text-[9px]" : "text-[10px]"
        }`}
      >
        ออนไลน์
      </div>
      <div
        className={`font-bold text-[#a73824] ${
          mobile ? "text-base" : compact ? "text-lg" : "text-lg"
        }`}
      >
        27/29
      </div>
      <div
        className={`flex items-center gap-1 text-green-600 ${
          mobile ? "text-[8px]" : compact ? "text-[9px]" : "text-[10px]"
        }`}
      >
        <span className="font-medium">Telemetry Active</span>
        <Wifi className={mobile ? "h-2.5 w-2.5" : "h-3.5 w-3.5"} />
      </div>
    </div>
  );
};
