"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RAIN_STATIONS } from "@/lib/rain-stations";
import { getRainSeverity } from "@/lib/rain-severity";
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
import { CANAL_MAP_IDS } from "@/lib/telemetry-stations";
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
export type RainWindow = "1h" | "3h" | "24h";

export const RAINFALL_TABS: { key: RainfallTab; label: string }[] = [
  { key: "1hr", label: "ฝน 1 ชม." },
  { key: "3hr", label: "ฝน 3 ชม." },
  { key: "24hr", label: "ฝน 24 ชม." },
  { key: "forecast_1hr", label: "ฝนพยากรณ์ล่วงหน้า 1 ชม." },
  { key: "forecast_3hr", label: "ฝนพยากรณ์ล่วงหน้า 3 ชม." },
];

/** window ที่ tab นั้นๆ ใช้อ้างอิง (ทั้งฝั่งข้อมูลจริง MQTT และฝั่งพยากรณ์ใช้กฎเดียวกัน) */
export function deriveRainWindow(tab: RainfallTab): RainWindow {
  if (tab === "3hr" || tab === "forecast_3hr") return "3h";
  if (tab === "24hr") return "24h";
  return "1h";
}

export function isForecastTab(tab: RainfallTab): boolean {
  return tab.startsWith("forecast_");
}

/** สลับดูสถานีท่อ (ปิด) กับคลอง (เปิด) ในหน้าระดับน้ำในทางระบายน้ำ — ใช้ทั้งแผนที่และตาราง */
export type DrainageTab = "pipe" | "canal";

export const DRAINAGE_TABS: { key: DrainageTab; label: string }[] = [
  { key: "pipe", label: "ท่อระบายน้ำ" },
  { key: "canal", label: "คลอง" },
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

// Lake_06 (หนองเลิงเปือย) ถูกเอาออกเพราะสถานีเสีย/MQTT ไม่อัปเดต — แทนที่ด้วย Lake_04
// (บึงหนองเอียด ใกล้บึงสีฐาน) ตามคอมเมนต์ KKC-UFM — Lake_04 ยังไม่มีเกณฑ์ maxLevel/watchFB
// ใน LAKE_CONFIG จึงยังแสดงสถานะ "ไม่มีข้อมูล" แม้จะมีค่าระดับน้ำจริงมาแล้วก็ตาม รอข้อมูล
// ระดับขอบบึงจริงเพื่อเปิดใช้เกณฑ์สี/สถานะแบบเดียวกับบึงอื่น
export const LAKE_META: { lakeId: string; name: string; location: string }[] = [
  { lakeId: "Lake_03", name: "บึงแก่นนคร", location: "ต. ในเมือง อ. เมือง" },
  { lakeId: "Lake_02", name: "บึงทุ่งสร้าง", location: "ต. ในเมือง อ. เมือง" },
  { lakeId: "Lake_05", name: "บึงหนองโคตร", location: "ต. บ้านเป็ด อ. เมือง" },
  { lakeId: "Lake_04", name: "บึงหนองเอียด", location: "ต. ศิลา อ. เมือง" },
];

// สถานีคลอง (WP ที่อยู่ใน CANAL_MAP_IDS) — ยังไม่มีสาย telemetry เชื่อมเข้าระบบ (ไม่มีไฟล์ CSV)
// จึงประกาศชื่อ/ที่ตั้งไว้ตรงนี้เพื่อให้ตารางแสดงแถวสถานีได้เหมือนท่อ แม้ค่ายังไม่มีก็ตาม
export const CANAL_META: { mapId: string; name: string; location: string }[] = [
  { mapId: "WP06", name: "สะพาน บ้านทุ่งเศรษฐี", location: "เทศบาลนครขอนแก่น" },
];

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

interface RainWindowApiStation {
  station_code: string;
  value: number;
  time: string | null;
}

export function useMapViewData() {
  const [rainfallData, setRainfallData] = useState<WaterData[]>([]);
  const [rainfallTab, setRainfallTab] = useState<RainfallTab>("1hr");
  const [drainageTab, setDrainageTab] = useState<DrainageTab>("pipe");
  const [lakesData, setLakesData] = useState<LakeApiItem[]>([]);
  const [pipeData, setPipeData] = useState<TelemetryStationResult[]>([]);
  const [roadData, setRoadData] = useState<TelemetryStationResult[]>([]);

  const rainRequestSeq = useRef(0);

  const fetchRainData = async (tab: RainfallTab) => {
    const seq = ++rainRequestSeq.current;
    try {
      const windowParam = deriveRainWindow(tab);
      const endpoint = isForecastTab(tab) ? "/api/rain/forecast" : "/api/rain/actual";
      const response = await fetch(`${endpoint}?window=${windowParam}`);
      const result = await response.json();

      // ถ้ามี request ใหม่กว่ายิงออกไปแล้ว (เช่นสลับ tab ไว) ทิ้งผลลัพธ์ของ request เก่าที่เพิ่งมาถึงทีหลัง
      if (seq !== rainRequestSeq.current) return;

      const byStation: Record<string, RainWindowApiStation> = {};
      (result.stations ?? []).forEach((s: RainWindowApiStation) => {
        byStation[s.station_code] = s;
      });

      const formattedData: WaterData[] = STATION_METADATA.map((meta) => {
        const entry = byStation[meta.id];
        const value = entry?.value ?? 0;
        const statusText = getRainSeverity(value, windowParam).label;

        let timeStr = "-";
        if (entry?.time) {
          const d = new Date(entry.time.replace(" ", "T"));
          if (!isNaN(d.getTime())) {
            timeStr = `${d.getHours().toString().padStart(2, "0")}:${d
              .getMinutes()
              .toString()
              .padStart(2, "0")} น.`;
          }
        }

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

      setRainfallData(formattedData);
    } catch (error) {
      if (seq !== rainRequestSeq.current) return;
      console.error("Error fetching rain data:", error);
      setRainfallData([]);
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

  useEffect(() => {
    fetchRainData(rainfallTab);
    const interval = setInterval(() => fetchRainData(rainfallTab), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [rainfallTab]);

  const getLakesTableData = useCallback((): WaterData[] => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")} น.`;

    return LAKE_META.map((meta) => {
      const lake = lakesData.find((l) => l.lake_id === meta.lakeId);
      const waterLevel = lake?.water_level;
      // บึงที่ยังไม่มีเกณฑ์ maxLevel/watchFB (เช่น Lake_04/บึงหนองเอียด) จะไม่มี cfg — bankLevel เป็น 0
      const cfg = LAKE_CONFIG[meta.lakeId as LakeId];
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
        bankLevel: cfg?.maxLevel ?? 0,
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
          return rainfallData;
        case "ponds":
          return getLakesTableData();
        case "drainage": {
          if (drainageTab === "canal") {
            // สถานีคลองบางจุดยังไม่มีสาย telemetry เชื่อม (ไม่มีใน pipeData เลย) — ใช้ CANAL_META
            // สร้างแถวชื่อ/ที่ตั้งไว้ก่อนเสมอ ถ้ามีข้อมูลจริงมาจับคู่ด้วย map_id ค่อยแสดงค่าจริงทับ
            return CANAL_META.map((meta) => {
              const station = pipeData.find((s) => s.map_id === meta.mapId);
              // คลองยังไม่มีเกณฑ์ความรุนแรงที่ยืนยันแล้ว (ต่างจากท่อ) จึงไม่ใช้ getPipeLevelStatusThai
              // ที่ตัดสีตาม PIPE_BANDS — ใช้สถานะกลางแทน ไม่บอกระดับความรุนแรง
              if (station) {
                return telemetryToWaterData([station], (levelM) =>
                  levelM != null ? "มีข้อมูล" : "ไม่มีข้อมูล",
                )[0];
              }
              return {
                station: meta.name,
                location: meta.location,
                level: 0,
                bankLevel: 0,
                diff: 0,
                status: "ไม่มีข้อมูล",
                time: "—",
                stationCode: meta.mapId,
              };
            });
          }
          const filtered = pipeData.filter((s) => !CANAL_MAP_IDS.has(s.map_id ?? ""));
          return telemetryToWaterData(filtered, getPipeLevelStatusThai);
        }
        case "roads":
          return telemetryToWaterData(roadData, getRoadLevelStatusThai);
        default:
          return [];
      }
    },
    [rainfallData, getLakesTableData, pipeData, roadData, drainageTab],
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
    drainageTab,
    setDrainageTab,
    getCurrentData,
    getTableMode,
    getTelemetryCategory,
  };
}
