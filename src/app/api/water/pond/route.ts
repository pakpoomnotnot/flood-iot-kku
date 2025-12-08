import { NextResponse } from "next/server";
import { fetchCsvData } from "../../lib/fetchCsv";

const BASE =
  "http://10.101.111.123:8080/transfer_data/flow_result_hms/1hr_3km_f72hr/";

export async function GET() {
  const pattern = /Reservoir_fcst_72hr_step1hr_(\d+_\d+)\.csv/g;

  const data = await fetchCsvData(BASE, pattern);

  if (!data)
    return NextResponse.json({ status: "error", message: "no reservoir files" });

  return NextResponse.json({
    status: "success",
    type: "pond",
    ...data,
  });
}
