"use client";

import { useEffect, useState } from "react";
import type { TelemetryChartPoint } from "@/lib/telemetry-history";

export function useTelemetryHistory(
  category: "pipe" | "road" | "lake" | null,
  stationCode: string | null,
  hours = 24,
) {
  const [data, setData] = useState<TelemetryChartPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category || !stationCode) {
      setData([]);
      setLoading(false);
      return;
    }

    // นับ sequence กันผลลัพธ์ของ request เก่ามาทับผลลัพธ์ของ request ใหม่กว่าที่มาถึงทีหลัง
    const seqRef = { current: 0 };

    const load = async () => {
      const mySeq = ++seqRef.current;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          category,
          station_id: stationCode,
          hours: String(hours),
        });
        const res = await fetch(`/api/water/history?${params}`);
        if (mySeq !== seqRef.current) return;
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
        setData(json.data ?? []);
      } catch (e) {
        if (mySeq !== seqRef.current) return;
        setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
        setData([]);
      } finally {
        if (mySeq === seqRef.current) setLoading(false);
      }
    };

    load();
  }, [category, stationCode, hours]);

  return { data, loading, error };
}
