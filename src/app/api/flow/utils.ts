export const baseUrl =
  "http://10.101.111.123:8080/transfer_data/flow_result_hms/1hr_3km_f72hr/";

export async function loadCsvFiles(prefix: string) {
  const html = await fetch(baseUrl).then((res) => res.text());

  // filter files by prefix
  let files = [...html.matchAll(/href="([^"]+\.csv)"/g)]
    .map((m) => m[1])
    .filter((f) => f.startsWith(prefix));

  if (files.length === 0) return [];

  const allRows: any[] = [];

  for (const file of files) {
    const url = baseUrl + file;
    const text = await fetch(url).then((r) => r.text());

    const lines = text.trim().split("\n");
    const header = lines[0].split(",");

    const rows = lines.slice(1).map((line) => {
      const cols = line.split(",");

      return {
        file,
        datetime: cols[0],
        datetime_ts: new Date(cols[0]).getTime(),
        data: Object.fromEntries(
          header.slice(1).map((h, i) => [h, parseFloat(cols[i + 1])])
        ),
      };
    });

    allRows.push(...rows);
  }

  // sort by latest datetime
  allRows.sort((a, b) => b.datetime_ts - a.datetime_ts);

  return allRows;
}

// Add CORS
export function withCORS(res: Response) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}
