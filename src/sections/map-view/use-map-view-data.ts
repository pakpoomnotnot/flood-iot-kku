"use client";

import { useState, useEffect, useCallback } from "react";
import { RAIN_STATIONS } from "@/lib/rain-stations";
import {
  LAKE_CONFIG,
  getPondFreeboard,
  getPondStatusThai,
  type LakeId,
} from "@/lib/lake-thresholds";
import {
  getPipeLevelStatusThai,
  getRoadLevelStatusThai,
} from "@/lib/water-level-status";
import type { TelemetryApiResponse } from "@/lib/telemetry-types";
import type { TelemetryStationResult } from "@/app/api/lib/fetchTelemetryReading";

export interface WaterData {
  station: string;
  location: string;
  level: number;
  bankLevel: number;
  status: string;
  diff: number;
  time: string;
  stationCode?: string;
}

interface LakeApiItem {
  lake_id: string;
  name_th: string;
  name_en: string;
  location: { lat: number; lng: number };
  status: "ok" | "error" | "no_data";
  water_level?: number;
  water_flow?: number;
  water_total?: number;
  rain_value?: number;
  rain_daily?: number;
  air_temp?: number;
  air_humid?: number;
  wind_direction_name?: string;
  date_time?: string;
  water_volume_m3?: number;
  water_area_m2?: number;
  capacity_pct?: number;
  error?: string;
}

interface LakesApiResponse {
  fetched_at: string;
  count: number;
  lakes: LakeApiItem[];
}

export type RainfallTab = "1hr" | "3hr" | "24hr" | "forecast_1hr" | "forecast_3hr";

export const RAINFALL_TABS: { key: RainfallTab; label: string }[] = [
  { key: "1hr", label: "ฝน 1 ชม." },
  { key: "3hr", label: "ฝน 3 ชม." },
  { key: "24hr", label: "ฝน 24 ชม." },
  { key: "forecast_1hr", label: "ฝนพยากรณ์ล่วงหน้า 1 ชม." },
  { key: "forecast_3hr", label: "ฝนพยากรณ์ล่วงหน้า 3 ชม." },
];

export const STATION_METADATA = [
  { id: "SNK_HOSP", name: RAIN_STATIONS.SNK_HOSP.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "KKC_MUN", name: RAIN_STATIONS.KKC_MUN.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "BKN", name: RAIN_STATIONS.BKN.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "BTS", name: RAIN_STATIONS.BTS.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "NLP", name: RAIN_STATIONS.NLP.name, location: "อ. เมือง" },
  { id: "BNK", name: RAIN_STATIONS.BNK.name, location: "ต. บ้านเป็ด อ. เมือง" },
  { id: "SIL_MUN", name: RAIN_STATIONS.SIL_MUN.name, location: "ต. ศิลา อ. เมือง" },
  { id: "UNE_MC", name: RAIN_STATIONS.UNE_MC.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "MKO_MUN", name: RAIN_STATIONS.MKO_MUN.name, location: "ต. เมืองเก่า อ. เมือง" },
  { id: "NEU", name: RAIN_STATIONS.NEU.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "UNE_SH", name: RAIN_STATIONS.UNE_SH.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "KKC_SP", name: RAIN_STATIONS.KKC_SP.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "BSV", name: RAIN_STATIONS.BSV.name, location: "ต. บ้านเป็ด อ. เมือง" },
  { id: "RMUTI", name: RAIN_STATIONS.RMUTI.name, location: "ต. ในเมือง อ. เมือง" },
  { id: "KKC_BL", name: RAIN_STATIONS.KKC_BL.name, location: "ต. ในเมือง อ. เมือง" },
];

export const LAKE_META: { lakeId: LakeId; name: string; location: string }[] = [
  { lakeId: "Lake_03", name: "บึงแก่นนคร", location: "ต. ในเมือง อ. เมือง" },
  { lakeId: "Lake_02", name: "บึงทุ่งสร้าง", location: "ต. ในเมือง อ. เมือง" },
  { lakeId: "Lake_05", name: "บึงหนองโคตร", location: "ต. บ้านเป็ด อ. เมือง" },
  { lakeId: "Lake_06", name: "หนองเลิงเปือย", location: "อ. เมือง" },
];

const getRainfallMockData = (tab: RainfallTab): WaterData[] => {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")} น.`;

  return STATION_METADATA.map((meta) => ({
    station: meta.name,
    location: meta.location,
    level: 0,
    bankLevel: 0,
    diff: 0,
    status: "ไม่มีฝน",
    time: timeStr,
    stationCode: meta.id,
  }));
};

const telemetryToWaterData = (
  stations: TelemetryStationResult[],
  getStatus: (levelM: number | undefined) => string,
): WaterData[] =>
  stations.map((station) => {
    const levelM = station.status === "ok" ? station.water_level_m : undefined;
    const timeDisplay = (() => {
      if (!station.date_time) return "—";
      const d = new Date(station.date_time.replace(" ", "T"));
      if (isNaN(d.getTime())) return "—";
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} น.`;
    })();

    return {
      station: station.name_th,
      location: station.location.area,
      level: levelM ?? 0,
      bankLevel: 0,
      diff: 0,
      status: getStatus(levelM),
      time: timeDisplay,
      stationCode: station.map_id ?? station.station_id,
    };
  });

export function useMapViewData() {
  const [realRainfallData, setRealRainfallData] = useState<WaterData[]>([]);
  const [rainfallTab, setRainfallTab] = useState<RainfallTab>("1hr");
  const [lakesData, setLakesData] = useState<LakeApiItem[]>([]);
  const [pipeData, setPipeData] = useState<TelemetryStationResult[]>([]);
  const [roadData, setRoadData] = useState<TelemetryStationResult[]>([]);

  const fetchRainData = async () => {
    try {
      const response = await fetch("http://10.198.110.39:3000/api/rain_1hr_2km?limit=1");
      const result = await response.json();

      if (result.status === "success" && result.data && result.data.length > 0) {
        const latestData = result.data[0];
        const dateObj = new Date(latestData.datetime);
        const timeStr = `${dateObj.getHours().toString().padStart(2, "0")}:${dateObj
          .getMinutes()
          .toString()
          .padStart(2, "0")} น.`;

        const rainValues: Record<string, number> = {};
        Object.entries(latestData.stations).forEach(([key, value]) => {
          rainValues[key.trim()] = Number(value);
        });

        const formattedData: WaterData[] = STATION_METADATA.map((meta) => {
          const value = rainValues[meta.id] ?? 0;
          let statusText = "ไม่มีฝน";
          if (value > 40) statusText = "หนักมาก";
          else if (value > 30) statusText = "หนัก";
          else if (value > 20) statusText = "ปานกลาง";
          else if (value > 0) statusText = "เล็กน้อย";

          return {
            station: meta.name,
            location: meta.location,
            level: Number(value.toFixed(1)),
            bankLevel: 0,
            diff: 0,
            status: statusText,
            time: timeStr,
            stationCode: meta.id,
          };
        });

        setRealRainfallData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching rain data:", error);
    }
  };

  const fetchLakesData = async () => {
    try {
      const res = await fetch("/api/lake");
      if (!res.ok) throw new Error(`API ตอบกลับ ${res.status}`);
      const json: LakesApiResponse = await res.json();
      setLakesData(json.lakes ?? []);
    } catch (error) {
      console.error("Error fetching lake data:", error);
    }
  };

  const fetchPipeData = async () => {
    try {
      const res = await fetch("/api/water/pipe");
      if (!res.ok) throw new Error(`API ตอบกลับ ${res.status}`);
      const json: TelemetryApiResponse = await res.json();
      setPipeData(json.stations ?? []);
    } catch (error) {
      console.error("Error fetching pipe data:", error);
    }
  };

  const fetchRoadData = async () => {
    try {
      const res = await fetch("/api/water/road");
      if (!res.ok) throw new Error(`API ตอบกลับ ${res.status}`);
      const json: TelemetryApiResponse = await res.json();
      setRoadData(json.stations ?? []);
    } catch (error) {
      console.error("Error fetching road data:", error);
    }
  };

  useEffect(() => {
    fetchRainData();
    fetchLakesData();
    fetchPipeData();
    fetchRoadData();
    const interval = setInterval(() => {
      fetchLakesData();
      fetchPipeData();
      fetchRoadData();
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getLakesTableData = useCallback((): WaterData[] => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")} น.`;

    return LAKE_META.map((meta) => {
      const lake = lakesData.find((l) => l.lake_id === meta.lakeId);
      const waterLevel = lake?.water_level;
      const cfg = LAKE_CONFIG[meta.lakeId];
      const freeboard = getPondFreeboard(meta.lakeId, waterLevel) ?? 0;
      const status = getPondStatusThai(meta.lakeId, waterLevel);

      let timeDisplay = timeStr;
      if (lake?.date_time) {
        const d = new Date(lake.date_time);
        if (!isNaN(d.getTime())) {
          timeDisplay = `${d.getHours().toString().padStart(2, "0")}:${d
            .getMinutes()
            .toString()
            .padStart(2, "0")} น.`;
        }
      }

      return {
        station: meta.name,
        location: meta.location,
        level: waterLevel ?? 0,
        bankLevel: cfg.maxLevel,
        diff: freeboard,
        status,
        time: timeDisplay,
        stationCode: meta.lakeId,
      };
    });
  }, [lakesData]);

  const getCurrentData = useCallback(
    (activeView: string): WaterData[] => {
      switch (activeView) {
        case "rainfall":
          if (rainfallTab === "1hr" && realRainfallData.length > 0) return realRainfallData;
          return getRainfallMockData(rainfallTab);
        case "ponds":
          return getLakesTableData();
        case "drainage":
          return telemetryToWaterData(pipeData, getPipeLevelStatusThai);
        case "roads":
          return telemetryToWaterData(roadData, getRoadLevelStatusThai);
        default:
          return [];
      }
    },
    [rainfallTab, realRainfallData, getLakesTableData, pipeData, roadData],
  );

  const getTableMode = (activeView: string): "rainfall" | "pond" | "default" => {
    if (activeView === "rainfall") return "rainfall";
    if (activeView === "ponds") return "pond";
    return "default";
  };

  const getTelemetryCategory = (
    activeView: string,
  ): "pipe" | "road" | undefined => {
    if (activeView === "drainage") return "pipe";
    if (activeView === "roads") return "road";
    return undefined;
  };

  return {
    rainfallTab,
    setRainfallTab,
    getCurrentData,
    getTableMode,
    getTelemetryCategory,
  };
}
