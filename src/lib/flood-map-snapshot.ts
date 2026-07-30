"use client";

import maplibregl from "maplibre-gl";
import type { FloodMapDayGroup } from "@/lib/flood-map-catalog";
import { geotiffToImageOverlay } from "@/lib/flood-geotiff-render";

const MAPTILER_KEY = "yYduxrRP3C81U2fRFNIU";
const HYBRID_STYLE_URL = `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`;

/**
 * ถ่ายภาพแผนที่ดาวเทียม + overlay พื้นที่เสี่ยงน้ำท่วม (เฟรมล่าสุด) เป็น PNG data URL
 * สำหรับฝังลงรายงาน PDF — เรนเดอร์ maplibre ใน container ที่ซ่อนไว้นอกจอ แล้วรอจน tile
 * และ overlay โหลดครบ (idle) ก่อน capture canvas แล้วเก็บกวาดทิ้ง
 *
 * คืนค่า null ถ้าไม่มีเฟรมพื้นที่เสี่ยงน้ำท่วม หรือโหลดไม่สำเร็จ (ไม่ throw — ให้ตัวเรียกเลือก
 * แสดงข้อความ "ไม่มีข้อมูล" แทนรูปแทน)
 */
export async function captureFloodRiskMapSnapshot(): Promise<string | null> {
  try {
    const tsRes = await fetch("/api/flood-maps/timeseries?days=1");
    if (!tsRes.ok) return null;
    const tsJson: { dayGroups: FloodMapDayGroup[] } = await tsRes.json();
    const lastDay = tsJson.dayGroups?.[tsJson.dayGroups.length - 1];
    const frame = lastDay?.frames?.[lastDay.frames.length - 1];
    if (!frame) return null;

    const cogRes = await fetch(
      `/api/flood-maps/cog?path=${encodeURIComponent(frame.proxyPath)}`,
    );
    if (!cogRes.ok) return null;
    const overlay = await geotiffToImageOverlay(await cogRes.arrayBuffer());

    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:900px;height:600px;";
    document.body.appendChild(container);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const map = new maplibregl.Map({
          container,
          style: HYBRID_STYLE_URL,
          center: [102.835, 16.432],
          zoom: 11,
          attributionControl: false,
          canvasContextAttributes: { preserveDrawingBuffer: true },
          interactive: false,
        });

        const timeout = setTimeout(() => {
          map.remove();
          reject(new Error("แผนที่โหลดไม่ทันเวลา"));
        }, 20_000);

        map.on("load", () => {
          map.addSource("flood-snapshot-source", {
            type: "image",
            url: overlay.dataUrl,
            coordinates: overlay.coordinates,
          });
          map.addLayer({
            id: "flood-snapshot-layer",
            type: "raster",
            source: "flood-snapshot-source",
            paint: { "raster-opacity": 0.85 },
          });
          map.fitBounds(
            [
              [overlay.bounds.west, overlay.bounds.south],
              [overlay.bounds.east, overlay.bounds.north],
            ],
            { padding: 20, duration: 0 },
          );

          map.once("idle", () => {
            clearTimeout(timeout);
            try {
              const url = map.getCanvas().toDataURL("image/png");
              map.remove();
              resolve(url);
            } catch (e) {
              map.remove();
              reject(e);
            }
          });
        });

        map.on("error", (e) => {
          clearTimeout(timeout);
          map.remove();
          reject(e.error ?? new Error("โหลดแผนที่ไม่สำเร็จ"));
        });
      });

      return dataUrl;
    } finally {
      container.remove();
    }
  } catch (e) {
    console.error("captureFloodRiskMapSnapshot error:", e);
    return null;
  }
}
