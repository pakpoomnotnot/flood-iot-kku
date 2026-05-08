// hooks/useLakeData.ts
"use client";
import { useEffect, useState } from "react";

export interface LakeApiItem {
  lake_id: string;
  status: "ok" | "error" | "no_data";
  water_level?: number;
  water_volume_m3?: number;
  water_area_m2?: number;
  capacity_pct?: number;
  date_time?: string;
}

interface LakesApiResponse {
  fetched_at: string;
  count: number;
  lakes: LakeApiItem[];
}

export function useLakeData() {
  const [lakes, setLakes] = useState<LakeApiItem[]>([]);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/lake");
        if (!res.ok) return;
        const json: LakesApiResponse = await res.json();
        setLakes(json.lakes);
      } catch {}
    };
    fetch_();
    const id = setInterval(fetch_, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const getLake = (lakeId: string) => lakes.find((l) => l.lake_id === lakeId);

  return { getLake };
}