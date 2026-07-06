export const FLOOD_MAP_BASE_URL =
  process.env.FLOOD_MAP_BASE_URL ||
  "http://10.101.111.123:8080/transfer_data/floodmap_result_ras";

export interface FloodMapFrame {
  id: string;
  runFolder: string;
  filename: string;
  datetime: string;
  displayLabel: string;
  timeLabel: string;
  proxyPath: string;
}

export interface FloodMapDayGroup {
  dayKey: string;
  dayLabel: string;
  weekday: string;
  frames: FloodMapFrame[];
}

/** แปลงชื่อโฟลเดอร์ YYYYMMDD_HHMM → Date */
export function parseRunFolderTimestamp(folder: string): Date {
  const clean = folder.replace(/\/$/, "");
  const [datePart, timePart] = clean.split("_");
  const y = datePart.slice(0, 4);
  const m = datePart.slice(4, 6);
  const d = datePart.slice(6, 8);
  const hh = timePart.slice(0, 2);
  const mm = timePart.slice(2, 4);
  return new Date(`${y}-${m}-${d}T${hh}:${mm}:00+07:00`);
}

/** ดึงรายชื่อโฟลเดอร์รันโมเดลจาก Apache directory listing */
export function parseRunFoldersFromHtml(html: string): string[] {
  const folders: string[] = [];
  const regex = /href="(\d{8}_\d{4}\/)"/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    folders.push(match[1].replace(/\/$/, ""));
  }
  return folders;
}

export function parseTifFilesFromHtml(html: string): string[] {
  const files = new Set<string>();
  const regex = /href="(MaxDepth_\d{8}\.tif)"/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    files.add(match[1]);
  }
  return [...files];
}

export function formatFrameLabel(date: Date): string {
  return date.toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDayLabel(date: Date): string {
  return date.toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
  });
}

export function formatDayShortLabel(date: Date): string {
  return date.toLocaleString("th-TH", { weekday: "short" });
}

export function formatTimeLabel(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}:00`;
}

/** จัดกลุ่มโฟลเดอร์รันตามวัน */
export function groupFoldersByDay(folders: string[]): Map<string, string[]> {
  const byDay = new Map<string, string[]>();
  for (const folder of folders) {
    const dayKey = folder.split("_")[0];
    const list = byDay.get(dayKey) ?? [];
    list.push(folder);
    byDay.set(dayKey, list);
  }
  for (const [key, list] of byDay) {
    byDay.set(key, list.sort());
  }
  return byDay;
}

export function buildFrame(runFolder: string, filename: string): FloodMapFrame {
  const dt = parseRunFolderTimestamp(runFolder);
  return {
    id: `${runFolder}/${filename}`,
    runFolder,
    filename,
    datetime: dt.toISOString(),
    displayLabel: formatFrameLabel(dt),
    timeLabel: formatTimeLabel(dt),
    proxyPath: `${runFolder}/${filename}`,
  };
}

/** เลือกไฟล์ MaxDepth ล่าสุดในโฟลเดอร์รัน */
export function pickBestTifFile(runFolder: string, files: string[]): string | null {
  if (files.length === 0) return null;
  const runDate = runFolder.split("_")[0];
  const preferred = `MaxDepth_${runDate}.tif`;
  if (files.includes(preferred)) return preferred;
  return [...files].sort().reverse()[0];
}

export async function resolveTifForFolder(runFolder: string): Promise<string | null> {
  const res = await fetch(`${FLOOD_MAP_BASE_URL}/${runFolder}/`, {
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) return null;
  return pickBestTifFile(runFolder, parseTifFilesFromHtml(await res.text()));
}

async function mapConcurrent<T, R>(
  items: T[],
  mapper: (item: T) => Promise<R | null>,
  concurrency = 10,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(mapper));
    for (const item of batchResults) {
      if (item !== null) results.push(item);
    }
  }
  return results;
}

export async function fetchFloodMapTimeseries(days = 7): Promise<FloodMapDayGroup[]> {
  const res = await fetch(`${FLOOD_MAP_BASE_URL}/`, {
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`Failed to list flood maps: ${res.status}`);
  }

  const html = await res.text();
  const cutoff = Date.now() - days * 24 * 3_600_000;

  const recentFolders = parseRunFoldersFromHtml(html).filter(
    (folder) => parseRunFolderTimestamp(folder).getTime() >= cutoff,
  );

  const foldersByDay = groupFoldersByDay(recentFolders);
  const sortedDayKeys = [...foldersByDay.keys()].sort();

  const groups: FloodMapDayGroup[] = [];

  for (const dayKey of sortedDayKeys) {
    const folders = foldersByDay.get(dayKey) ?? [];
    const frames = await mapConcurrent(folders, async (runFolder) => {
      const filename = await resolveTifForFolder(runFolder);
      if (!filename) return null;
      return buildFrame(runFolder, filename);
    });

    if (frames.length === 0) continue;

    const sortedFrames = frames.sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    );
    const refDate = parseRunFolderTimestamp(sortedFrames[0].runFolder);

    groups.push({
      dayKey,
      dayLabel: formatDayLabel(refDate),
      weekday: formatDayShortLabel(refDate),
      frames: sortedFrames,
    });
  }

  return groups;
}
