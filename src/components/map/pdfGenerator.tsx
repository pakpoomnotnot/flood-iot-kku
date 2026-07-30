import { LAKE_CONFIG, getPondStatusThai, type LakeId } from "@/lib/lake-thresholds";
import {
  getPipeLevelStatusThai,
  getRoadLevelStatusThai,
} from "@/lib/water-level-status";
import {
  RAIN_STATIONS,
  RAIN_STATION_DISPLAY_ORDER,
} from "@/lib/rain-stations";
import type { TelemetryApiResponse } from "@/lib/telemetry-types";
import { captureFloodRiskMapSnapshot } from "@/lib/flood-map-snapshot";
import {
  computeOverallSeverity,
  OVERALL_SEVERITY_TEXT,
} from "@/lib/flood-overall-severity";

// ─────────────────────────────────────────────
// Types — ข้อมูลจริงที่ดึงมาประกอบรายงาน
// ─────────────────────────────────────────────
interface LakeApiItem {
  lake_id: string;
  name_th: string;
  status: "ok" | "error" | "no_data";
  water_level?: number;
  water_volume_m3?: number | null;
  capacity_pct?: number | null;
  date_time?: string;
}

interface RainWindowStation {
  station_code: string;
  value: number;
  time: string | null;
}

async function safeJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchReportData() {
  const [lakeJson, pipeJson, roadJson, rain24hJson, rain1hJson] = await Promise.all([
    safeJson<{ lakes: LakeApiItem[] }>("/api/lake"),
    safeJson<TelemetryApiResponse>("/api/water/pipe"),
    safeJson<TelemetryApiResponse>("/api/water/road"),
    safeJson<{ stations: RainWindowStation[] }>("/api/rain/actual?window=24h"),
    safeJson<{ stations: RainWindowStation[] }>("/api/rain/actual?window=1h"),
  ]);

  return {
    lakes: lakeJson?.lakes ?? [],
    pipes: pipeJson?.stations ?? [],
    roads: roadJson?.stations ?? [],
    rain24h: rain24hJson?.stations ?? [],
    rain1h: rain1hJson?.stations ?? [],
  };
}

export const generateOfficialPDFReport = async (): Promise<void> => {
  try {
    const { default: jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    const d = new Date();
    const dateStr = d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = d.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const { lakes, pipes, roads, rain24h, rain1h } = await fetchReportData();
    const floodMapImage = await captureFloodRiskMapSnapshot();

    const overall = computeOverallSeverity(lakes, pipes, roads);
    const reportNo = `${d.getDate()}${d.getMonth() + 1}${d.getFullYear()}-${d.getHours()}${d.getMinutes()}`;

    const rain24hByCode = new Map(rain24h.map((s) => [s.station_code, s]));
    const rain1hByCode = new Map(rain1h.map((s) => [s.station_code, s]));

    const swampData = Object.keys(LAKE_CONFIG).map((lakeId) => {
      const lake = lakes.find((l) => l.lake_id === lakeId);
      const cfg = LAKE_CONFIG[lakeId as LakeId];
      const ok = lake?.status === "ok";
      return {
        name: lake?.name_th ?? lakeId,
        capacity: cfg.maxLevel,
        current: ok ? lake!.water_level!.toFixed(2) : "-",
        volume: ok && lake?.water_volume_m3 != null ? (lake.water_volume_m3 / 1_000_000).toFixed(3) : "-",
        percent: ok && lake?.capacity_pct != null ? lake.capacity_pct.toFixed(1) : "-",
        status: ok ? getPondStatusThai(lakeId, lake!.water_level) : "ไม่มีข้อมูล",
      };
    });

    const drainageMonitoring = pipes.map((p) => ({
      location: p.name_th,
      subdistrict: p.location?.area ?? "-",
      level: p.status === "ok" ? p.water_level_m!.toFixed(2) : "-",
      status: p.status === "ok" ? getPipeLevelStatusThai(p.water_level_m) : "ไม่มีข้อมูล",
      time: p.date_time ?? "-",
    }));

    const roadFloodMonitoring = roads.map((r) => ({
      location: r.name_th,
      subdistrict: r.location?.area ?? "-",
      level: r.status === "ok" ? r.water_level_m!.toFixed(2) : "-",
      status: r.status === "ok" ? getRoadLevelStatusThai(r.water_level_m) : "ไม่มีข้อมูล",
      time: r.date_time ?? "-",
    }));

    const rainRows = RAIN_STATION_DISPLAY_ORDER.map((code) => {
      const meta = RAIN_STATIONS[code];
      const r24 = rain24hByCode.get(code);
      const r1 = rain1hByCode.get(code);
      return {
        code,
        name: meta.name,
        lat: meta.lat,
        lon: meta.lon,
        daily: r24 ? r24.value.toFixed(1) : "-",
        hourly: r1 ? r1.value.toFixed(1) : "-",
      };
    });

    const el = document.createElement("div");
    el.style.cssText = `
      position: absolute;
      left: -9999px;
      width: 794px;
      padding: 45px 35px;
      background: white;
      font-family: 'Sarabun', 'Noto Sans Thai', Arial, sans-serif;
      color: #000;
      font-size: 12px;
      line-height: 1.4;
    `;

    el.innerHTML = `
      <div style="margin-bottom: 20px;">
  <div
    style="
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 6px;
    "
  >
    <div style="display: flex; gap: 6px;">
      <img src="/uni.png" style="height: 48px;" />
      <img src="/w_ch.png" style="height: 44px;" />
      <img src="/tsri.svg" style="height: 44px;" />
      <img src="/kku.png" style="height: 48px;" />
    </div>

    <div style="width: 1px; height: 16px; background: #666;"></div>

    <div style="text-align: left;">
      <div style="font-size: 18px; font-weight: bold; line-height: 1.2;">
        รายงานการเฝ้าระวังติดตามสถานการณ์น้ำและความช่วยเหลือ
      </div>
      <div style="font-size: 14px; font-weight: bold;">
        ศูนย์บัญชาการน้ำและการสนับสนุนการตัดสินใจ — ระบบเตือนภัยน้ำท่วมเมืองขอนแก่น
      </div>
    </div>
  </div>

  <div style="text-align: center;">
    <div style="font-size: 12px; margin-bottom: 2px;">
      เทศบาลนครขอนแก่น
    </div>
    <div style="font-size: 10px; color: #333;">
      ข้อมูลจากสถานีโทรมาตร MQTT แบบเรียลไทม์ — สร้างรายงานอัตโนมัติ ณ เวลาที่ระบุด้านล่าง
    </div>
  </div>
</div>

      <div style="background: #f0f0f0; border: 1px solid #333; padding: 8px 12px; margin-bottom: 18px;">
        <table style="width: 100%;">
          <tr>
            <td style="font-size: 11px; font-weight: bold;">รายงานฉบับที่ ${reportNo}</td>
            <td style="font-size: 11px; font-weight: bold; text-align: right;">เวลา ${timeStr} น. วันที่ ${dateStr}</td>
          </tr>
        </table>
      </div>

      <div style="font-size: 11px; margin-bottom: 15px; font-weight: bold;">
        เรียน ผู้บริหารและหน่วยงานที่เกี่ยวข้อง
      </div>

      <div style="margin-bottom: 18px;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; background: #e8e8e8; padding: 6px 10px; border-left: 4px solid #333;">
          1. บทสรุปสถานการณ์น้ำ — สถานะโดยรวม: ${OVERALL_SEVERITY_TEXT[overall.level]}
        </div>
        <div style="font-size: 11px; padding: 0 10px; text-align: justify; line-height: 1.7;">
          <p style="margin: 6px 0; text-indent: 40px;">
            สถานการณ์น้ำในพื้นที่เทศบาลนครขอนแก่น ณ วันที่ ${dateStr} เวลา ${timeStr} น.
            จากข้อมูลสถานีโทรมาตรทั้งหมด ${lakes.length} บึง ${pipes.length} จุดวัดระดับน้ำในท่อระบายน้ำ
            และ ${roads.length} จุดวัดระดับน้ำท่วมผิวถนน ประเมินสถานะโดยรวมอยู่ในระดับ
            <strong>${OVERALL_SEVERITY_TEXT[overall.level]}</strong>
          </p>
          ${
            overall.reasons.length > 0
              ? `<p style="margin: 6px 0; text-indent: 40px;">ประเด็นที่ต้องเฝ้าระวัง: ${overall.reasons.slice(0, 5).join(", ")}</p>`
              : `<p style="margin: 6px 0; text-indent: 40px;">ระดับน้ำในบึง ท่อระบายน้ำ และผิวถนนทุกจุดอยู่ในเกณฑ์ปกติ ระบบระบายน้ำสามารถรองรับได้ตามปกติ</p>`
          }
        </div>
      </div>

      ${
        floodMapImage
          ? `
      <div style="margin-bottom: 18px; page-break-inside: avoid;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; background: #e8e8e8; padding: 6px 10px; border-left: 4px solid #333;">
          2. แผนที่ดาวเทียมพื้นที่เสี่ยงน้ำท่วม (แบบจำลอง HEC-RAS)
        </div>
        <div style="text-align: center; margin: 8px 10px;">
          <img src="${floodMapImage}" style="width: 100%; max-width: 700px; border: 1px solid #999; border-radius: 4px;" />
          <p style="font-size: 9px; color: #666; margin-top: 4px;">
            ภาพจากแผนที่ดาวเทียม (Hybrid) ซ้อนทับผลการจำลองความลึกน้ำท่วมล่าสุดของระบบ
          </p>
        </div>
      </div>`
          : `
      <div style="margin-bottom: 18px;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; background: #e8e8e8; padding: 6px 10px; border-left: 4px solid #333;">
          2. แผนที่ดาวเทียมพื้นที่เสี่ยงน้ำท่วม
        </div>
        <p style="font-size: 11px; padding: 0 10px; color: #666;"><em>ไม่สามารถโหลดภาพแผนที่ได้ในขณะสร้างรายงานนี้</em></p>
      </div>`
      }

      <div style="margin-bottom: 40px;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; background: #e8e8e8; padding: 6px 10px; border-left: 4px solid #333;">
          3. ปริมาณฝนสะสม (ข้อมูลจริงจาก MQTT)
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 0 10px; font-size: 10px;">
          <thead>
            <tr style="background: #d0d0d0;">
              <th style="border: 1px solid #666; padding: 6px; text-align: center; font-weight: bold; width: 70px;">รหัสสถานี</th>
              <th style="border: 1px solid #666; padding: 6px; text-align: left; font-weight: bold;">ชื่อสถานี</th>
              <th style="border: 1px solid #666; padding: 6px; text-align: center; font-weight: bold; width: 80px;">ฝน 1 ชม.<br/>(มม.)</th>
              <th style="border: 1px solid #666; padding: 6px; text-align: center; font-weight: bold; width: 80px;">ฝนสะสม 24 ชม.<br/>(มม.)</th>
            </tr>
          </thead>
          <tbody>
            ${rainRows
              .map(
                (station, idx) => `
              <tr style="${idx % 2 === 0 ? "background: #f5f5f5;" : ""}">
                <td style="border: 1px solid #999; padding: 5px; text-align: center;">${station.code}</td>
                <td style="border: 1px solid #999; padding: 5px;">${station.name}</td>
                <td style="border: 1px solid #999; padding: 5px; text-align: center; font-weight: bold;">${station.hourly}</td>
                <td style="border: 1px solid #999; padding: 5px; text-align: center; font-weight: bold;">${station.daily}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 18px;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; background: #e8e8e8; padding: 6px 10px; border-left: 4px solid #333;">
          4. สถานการณ์น้ำในบึงและแหล่งเก็บกักน้ำ (ข้อมูลจริง)
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 0 10px; font-size: 10px;">
          <thead>
            <tr style="background: #d0d0d0;">
              <th style="border: 1px solid #666; padding: 5px; text-align: left; font-weight: bold;">ชื่อบึง</th>
              <th style="border: 1px solid #666; padding: 5px; text-align: center; font-weight: bold;">ระดับน้ำขอบบึง<br/>(ม.รทก.)</th>
              <th style="border: 1px solid #666; padding: 5px; text-align: center; font-weight: bold;">ระดับน้ำปัจจุบัน<br/>(ม.รทก.)</th>
              <th style="border: 1px solid #666; padding: 5px; text-align: center; font-weight: bold;">ปริมาตรน้ำ<br/>(ล้าน ลบ.ม.)</th>
              <th style="border: 1px solid #666; padding: 5px; text-align: center; font-weight: bold;">เปอร์เซ็นต์<br/>ความจุ (%)</th>
              <th style="border: 1px solid #666; padding: 5px; text-align: center; font-weight: bold;">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            ${swampData
              .map(
                (swamp, idx) => `
              <tr style="${idx % 2 === 0 ? "background: #f5f5f5;" : ""}">
                <td style="border: 1px solid #999; padding: 5px;">${swamp.name}</td>
                <td style="border: 1px solid #999; padding: 5px; text-align: center;">${swamp.capacity}</td>
                <td style="border: 1px solid #999; padding: 5px; text-align: center; font-weight: bold;">${swamp.current}</td>
                <td style="border: 1px solid #999; padding: 5px; text-align: center;">${swamp.volume}</td>
                <td style="border: 1px solid #999; padding: 5px; text-align: center;">${swamp.percent}</td>
                <td style="border: 1px solid #999; padding: 5px; text-align: center; font-weight: bold;">${swamp.status}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 18px; page-break-inside: avoid;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; background: #e8e8e8; padding: 6px 10px; border-left: 4px solid #333;">
          5. ระบบตรวจวัดระดับน้ำในท่อระบายน้ำ (ข้อมูลจริง)
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 0 10px; font-size: 9px;">
          <thead>
            <tr style="background: #d0d0d0;">
              <th style="border: 1px solid #666; padding: 4px; text-align: left; font-weight: bold; width: 220px;">จุดตรวจวัด</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold;">ตำแหน่ง</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 60px;">ระดับน้ำ<br/>(ม.)</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 70px;">สถานะ</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 110px;">เวลาตรวจวัดล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            ${drainageMonitoring
              .map(
                (item, idx) => `
              <tr style="${idx % 2 === 0 ? "background: #f5f5f5;" : ""}">
                <td style="border: 1px solid #999; padding: 4px; font-size: 8px;">${item.location}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center;">${item.subdistrict}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center; font-weight: bold;">${item.level}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center; font-weight: bold;">${item.status}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center;">${item.time}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 18px; page-break-inside: avoid;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; background: #e8e8e8; padding: 6px 10px; border-left: 4px solid #333;">
          6. ระบบตรวจวัดน้ำท่วมบนผิวถนน (ข้อมูลจริง)
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 0 10px; font-size: 9px;">
          <thead>
            <tr style="background: #d0d0d0;">
              <th style="border: 1px solid #666; padding: 4px; text-align: left; font-weight: bold; width: 220px;">จุดตรวจวัด</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold;">ตำแหน่ง</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 60px;">ระดับน้ำ<br/>(ม.)</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 70px;">สถานะ</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 110px;">เวลาตรวจวัดล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            ${roadFloodMonitoring
              .map(
                (item, idx) => `
              <tr style="${idx % 2 === 0 ? "background: #f5f5f5;" : ""}">
                <td style="border: 1px solid #999; padding: 4px;">${item.location}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center;">${item.subdistrict}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center; font-weight: bold;">${item.level}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center; font-weight: bold;">${item.status}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center;">${item.time}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 54px; font-size: 11px; text-align: center;">
        <p style="margin: 5px 0;">จึงเรียนมาเพื่อโปรดทราบ</p>
        <div style="margin-top: 40px;">
          <p style="margin: 3px 0;">ระบบสร้างรายงานอัตโนมัติ — ศูนย์บัญชาการน้ำและการสนับสนุนการตัดสินใจ</p>
          <p style="margin: 3px 0;">ระบบสนับสนุนการเตือนภัยและแนวทางการป้องกันน้ำท่วมในเขตเมืองขอนแก่น</p>
        </div>
      </div>
    `;

    document.body.appendChild(el);
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });
    document.body.removeChild(el);

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `รายงานประจำวัน_${d.getFullYear()}-${String(
      d.getMonth() + 1,
    ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}_${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง");
  }
};
