export async function fetchCsvData(BASE: string, pattern: RegExp) {
  const res = await fetch(BASE);
  const html = await res.text();

  const files = [...html.matchAll(pattern)].map(m => m[0]);

  if (files.length === 0) return null;

  const latest = files.sort().reverse()[0];
  const csvRes = await fetch(BASE + latest);
  const csvText = await csvRes.text();

  const lines = csvText.trim().split("\n");

  const columns = lines[0].split(",");

  const rows = lines.slice(1).map(line => {
    const values = line.split(",");
    let obj: Record<string, any> = {};

    columns.forEach((col, i) => {
      const num = Number(values[i]);
      obj[col] = isNaN(num) ? values[i] : num;
    });

    return obj;
  });

  return {
    updated: latest,
    columns,
    rows,
  };
}
