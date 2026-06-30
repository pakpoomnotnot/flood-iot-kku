"use client";

import { useEffect, useState } from "react";
import type { TelemetryChartPoint } from "@/lib/telemetry-history";

export function useTelemetryHistory(
  category: "pipe" | "road" | null,
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

    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          category,
          station_id: stationCode,
          hours: String(hours),
        });
        const res = await fetch(`/api/water/history?${params}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
        setData(json.data ?? []);
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
        setData([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [category, stationCode, hours]);

  return { data, loading, error };
}
