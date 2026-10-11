import { NextResponse } from "next/server";
import { fetchCsvData } from "../../lib/fetchCsv";
import { transferDataUrl } from "@/lib/server-config";

export async function GET() {
  const pattern = /Reservoir_fcst_72hr_step1hr_(\d+_\d+)\.csv/g;

  const data = await fetchCsvData(transferDataUrl("flow_result_hms/1hr_3km_f72hr/"), pattern);

  if (!data)
    return NextResponse.json({ status: "error", message: "no reservoir files" });

  return NextResponse.json({
    status: "success",
    type: "pond",
    ...data,
  });
}
