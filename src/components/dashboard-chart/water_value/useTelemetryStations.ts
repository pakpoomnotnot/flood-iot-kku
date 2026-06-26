"use client";

import { useEffect, useState } from "react";
import type { TelemetryStationResult } from "@/app/api/lib/fetchTelemetryReading";
import type { TelemetryApiResponse } from "@/lib/telemetry-types";

export function useTelemetryStations(type: "pipe" | "road") {
  const [stations, setStations] = useState<TelemetryStationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/water/${type}`);
        const json: TelemetryApiResponse = await res.json();
        setStations(json?.status === "success" ? json.stations ?? [] : []);
      } catch (error) {
        console.error(`Error fetching ${type} telemetry:`, error);
        setStations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [type]);

  return { stations, isLoading };
}
