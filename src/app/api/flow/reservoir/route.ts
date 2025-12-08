import { NextResponse } from "next/server";
import { loadCsvFiles, withCORS } from "../utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") || 50);
  const offset = Number(url.searchParams.get("offset") || 0);

  const rows = await loadCsvFiles("Reservoir_fcst");

  const paginated = rows.slice(offset, offset + limit);

  return withCORS(
    NextResponse.json({
      type: "reservoir",
      total: rows.length,
      limit,
      offset,
      data: paginated,
    })
  );
}

export function OPTIONS() {
  return withCORS(NextResponse.json({}, { status: 200 }));
}
