import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const baseUrl =
      "http://10.101.111.123:8080/transfer_data/rain/1hr_2km_f48hr/";

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 50;
    const offset = Number(searchParams.get("offset")) || 0;

    // 1) load directory listing
    const html = await fetch(baseUrl).then((r) => r.text());

    // 2) extract filenames
    let csvFiles = [...html.matchAll(/href="([^"]+\.csv)"/g)].map(
      (m) => m[1]
    );

    if (csvFiles.length === 0) {
      return addCORSHeaders(
        NextResponse.json({
          status: "empty",
          message: "No CSV files found.",
          data: [],
        })
      );
    }

    const allRows: any[] = [];

    // 3) read all files
    for (const file of csvFiles) {
      const fileUrl = baseUrl + file;

      const csvText = await fetch(fileUrl).then((res) => res.text());

      const lines = csvText.trim().split("\n");
      const header = lines[0].split(",");

      const rows = lines.slice(1).map((line) => {
        const cols = line.split(",");
        const datetime = cols[0];

        const stations: Record<string, number> = {};
        for (let i = 1; i < header.length; i++) {
          stations[header[i]] = Number(cols[i]);
        }

        return {
          file,
          datetime,
          datetime_ts: new Date(datetime).getTime(),
          stations,
        };
      });

      allRows.push(...rows);
    }

    // 4) sort by datetime (latest → oldest)
    allRows.sort((a, b) => b.datetime_ts - a.datetime_ts);

    // 5) apply limit + offset
    const paginated = allRows.slice(offset, offset + limit);

    return addCORSHeaders(
      NextResponse.json({
        status: "success",
        total: allRows.length,
        limit,
        offset,
        returned: paginated.length,
        data: paginated,
      })
    );
  } catch (error) {
    return addCORSHeaders(
      NextResponse.json(
        {
          status: "error",
          message: (error as Error).message,
        },
        { status: 500 }
      )
    );
  }
}

// ===== CORS CONFIG =====

function addCORSHeaders(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

// Handle OPTIONS preflight
export function OPTIONS() {
  const res = NextResponse.json({}, { status: 200 });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}
