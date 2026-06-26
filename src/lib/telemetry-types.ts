export type {
  TelemetryReading,
  TelemetryStationResult,
} from "@/app/api/lib/fetchTelemetryReading";

export interface TelemetryApiResponse {
  fetched_at: string;
  status: "success" | "error";
  type: "pipe" | "road";
  count: number;
  stations: import("@/app/api/lib/fetchTelemetryReading").TelemetryStationResult[];
}
