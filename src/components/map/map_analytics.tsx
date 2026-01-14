"use client";

import React, { useEffect, useRef, useState, FC } from "react";
import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
import * as GeoTIFF from "geotiff";
import proj4 from "proj4";
import "maplibre-gl/dist/maplibre-gl.css";

// ตั้งค่าการแปลงพิกัด: UTM Zone 47N (WGS84) -> WGS84 Lat/Lng
const UTM_47N = "+proj=utm +zone=47 +datum=WGS84 +units=m +no_defs";
const WGS84 = "EPSG:4326";

type ScenarioNumber = 1 | 2 | 3;

const MapComponentFixed: FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapLibreMap | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeScenario, setActiveScenario] = useState<ScenarioNumber>(1);
  const [status, setStatus] = useState("");

  const rasterFiles: Record<ScenarioNumber, { path: string }> = {
    1: { path: "/data/raster/Depth26SEP2022230000TerrainMergedInputs.tif" },
    2: { path: "/data/raster/Depth02SEP2019230000TerrainMergedInputs.tif" },
    3: { path: "/data/raster/Depth15AUG2025130000TerrainMergedInputs.tif" }
  };

  const renderTiffToCanvas = async (url: string) => {
    setStatus("กำลังประมวลผลพิกัดและข้อมูลไฟล์...");
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("ไม่สามารถเข้าถึงไฟล์ได้");
      
      const arrayBuffer = await response.arrayBuffer();
      const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      
      const width = image.getWidth();
      const height = image.getHeight();
      
      // อ่านข้อมูล Raster (ใช้ readRasters แทน readRGB เพื่อดึงค่าความลึกจริง)
      const rasters = await image.readRasters();
      const values = rasters[0] as Float32Array;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const imageData = ctx.createImageData(width, height);
      
      // วาดสีตามค่าความลึก (ตัวอย่าง: ยิ่งลึกยิ่งน้ำเงิน)
      for (let i = 0; i < values.length; i++) {
        const val = values[i];
        const idx = i * 4;
        if (val > 0.05 && val < 100) { // ตัดค่า Error/NoData ออก
          imageData.data[idx] = 30;     // R
          imageData.data[idx + 1] = 144;  // G
          imageData.data[idx + 2] = 255;  // B
          imageData.data[idx + 3] = 200;  // Alpha
        } else {
          imageData.data[idx + 3] = 0;    // โปร่งใส
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // --- ส่วนการจัดการพิกัด (UTM to WGS84) ---
      let bbox = image.getBoundingBox(); // [minX, minY, maxX, maxY]
      
      // เช็คว่า bbox เป็น UTM หรือไม่ (ถ้าค่า x > 180 แสดงว่าเป็นเมตร)
      if (Math.abs(bbox[0]) > 180) {
        console.log("Detected UTM coordinates, converting to Lat/Lng...");
        const minCorner = proj4(UTM_47N, WGS84, [bbox[0], bbox[1]]);
        const maxCorner = proj4(UTM_47N, WGS84, [bbox[2], bbox[3]]);
        bbox = [minCorner[0], minCorner[1], maxCorner[0], maxCorner[1]];
      }

      setStatus("");
      return { url: canvas.toDataURL(), bbox };
    } catch (err: any) {
      console.error("Error:", err);
      setStatus("Error: ไฟล์ TIFF มีการบีบอัดที่ไม่รองรับ หรือพิกัดผิดพลาด");
      return null;
    }
  };

  const updateMapLayer = async () => {
    if (!map.current || !isLoaded) return;

    const file = rasterFiles[activeScenario];
    const result = await renderTiffToCanvas(file.path);
    if (!result) return;

    const sourceId = "tiff-source";
    if (map.current.getLayer("tiff-layer")) map.current.removeLayer("tiff-layer");
    if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

    const coords: [[number, number], [number, number], [number, number], [number, number]] = [
      [result.bbox[0], result.bbox[3]], // TL
      [result.bbox[2], result.bbox[3]], // TR
      [result.bbox[2], result.bbox[1]], // BR
      [result.bbox[0], result.bbox[1]]  // BL
    ];

    map.current.addSource(sourceId, {
      type: "image",
      url: result.url,
      coordinates: coords
    });

    map.current.addLayer({
      id: "tiff-layer",
      type: "raster",
      source: sourceId,
      paint: { "raster-opacity": 0.8 }
    });

    map.current.fitBounds([
      [result.bbox[0], result.bbox[1]], 
      [result.bbox[2], result.bbox[3]]
    ], { padding: 50 });
  };

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://api.maptiler.com/maps/topo-v2/style.json?key=yYduxrRP3C81U2fRFNIU",
      center: [102.82, 16.44],
      zoom: 12
    });
    map.current.on("load", () => setIsLoaded(true));
  }, []);

  useEffect(() => {
    if (isLoaded) updateMapLayer();
  }, [isLoaded, activeScenario]);

  return (
    <div className="relative w-full h-[600px] border-2 border-slate-200 rounded-xl shadow-inner">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur p-2 rounded shadow-lg flex gap-2">
          {([1, 2, 3] as const).map((n) => (
            <button 
              key={n} 
              onClick={() => setActiveScenario(n)} 
              className={`px-4 py-2 rounded font-bold transition ${activeScenario === n ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
            >
              Case {n}
            </button>
          ))}
        </div>
        {status && <div className="bg-red-500 text-white text-[10px] px-3 py-1 rounded-full shadow-lg self-start">{status}</div>}
      </div>
    </div>
  );
};

export default MapComponentFixed;