import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const baseUrl =
      "http://10.101.111.123:8080/transfer_data/rain/3hr_9km_f10day/";

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 50;
    const offset = Number(searchParams.get("offset")) || 0;

    // 1) load directory listing
    const html = await fetch(baseUrl).then((r) => r.text());

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

    // 2) load all CSV
    for (const file of csvFiles) {
      const fileUrl = baseUrl + file;

      const csvText = await fetch(fileUrl).then((r) => r.text());
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

    // 3) sort by time
    allRows.sort((a, b) => a.datetime_ts - b.datetime_ts);

    // 4) build new timeline (2 hour interval)
    const newData: any[] = [];

    for (let i = 0; i < allRows.length - 1; i++) {
      const curr = allRows[i];
      const next = allRows[i + 1];

      const t0 = curr.datetime_ts;
      const t1 = next.datetime_ts;

      const diffHours = (t1 - t0) / (1000 * 3600);

      if (diffHours === 3) {
        // keep original t0 (0 hr)
        newData.push(curr);

        // interpolate t2
        const t2_ts = t0 + 2 * 3600 * 1000;
        const stations2: Record<string, number> = {};

        for (const s in curr.stations) {
          const v0 = curr.stations[s];
          const v1 = next.stations[s];
          stations2[s] = v0 + ((v1 - v0) * (2 / 3));
        }

        newData.push({
          datetime: new Date(t2_ts).toISOString().replace("T", " ").slice(0, 16),
          datetime_ts: t2_ts,
          stations: stations2,
        });
      }
    }

    // 5) sort again (latest → oldest)
    newData.sort((a, b) => b.datetime_ts - a.datetime_ts);

    // 6) apply limit and offset
    const paginated = newData.slice(offset, offset + limit);

    return addCORSHeaders(
      NextResponse.json({
        status: "success",
        total: newData.length,
        limit,
        offset,
        returned: paginated.length,
        data: paginated,
      })
    );
  } catch (err) {
    return addCORSHeaders(
      NextResponse.json(
        {
          status: "error",
          message: (err as Error).message,
        },
        { status: 500 }
      )
    );
  }
}

// Add CORS
function addCORSHeaders(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export function OPTIONS() {
  const res = NextResponse.json({}, { status: 200 });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}
