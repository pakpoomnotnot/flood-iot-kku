"use client";
import React, { useEffect, useRef, useState, FC } from "react";
import { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapProps {
  sidebarWidth?: number;
}

const KhonKaenMap: FC<MapProps> = ({ sidebarWidth = 0 }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const API_KEY: string = "yYduxrRP3C81U2fRFNIU";

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/topo-v2/style.json?key=${API_KEY}`,
      center: [102.324578, 9.630004], // จุดกึ่งกลางภาคอีสาน
      zoom: 5, // ซูมระดับที่เห็นภาคอีสานทั้งหมด
      attributionControl: false,
    });

    map.current.on("load", async () => {
      if (!map.current) return;

      try {
        // โหลด GeoJSON
        const response = await fetch("/data/khonkaen.json");
        const geojsonData = await response.json();

        // เพิ่ม source
        map.current.addSource("khonkaen", {
          type: "geojson",
          data: geojsonData,
        });

        // เพิ่ม layer สำหรับ polygon (fill)
        map.current.addLayer({
          id: "khonkaen-fill",
          type: "fill",
          source: "khonkaen",
          paint: {
            "fill-color": "#3b82f6",
            "fill-opacity": 0.3,
          },
        });

        // เพิ่ม layer สำหรับ outline
        map.current.addLayer({
          id: "khonkaen-outline",
          type: "line",
          source: "khonkaen",
          paint: {
            "line-color": "#2563eb",
            "line-width": 2,
          },
        });

        // ปรับ padding ถ้ามี sidebar
        if (sidebarWidth > 0) {
          map.current.easeTo({
            padding: { left: sidebarWidth },
            duration: 0,
          });
        }

        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading GeoJSON:", error);
        setIsLoaded(true);
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [sidebarWidth]);

  useEffect(() => {
    if (map.current && isLoaded) {
      const handle = requestAnimationFrame(() => {
        map.current?.resize();
        
        // ปรับ padding เมื่อ sidebar เปลี่ยน
        if (sidebarWidth > 0) {
          map.current?.easeTo({
            padding: { left: sidebarWidth },
            duration: 300,
          });
        } else {
          map.current?.easeTo({
            padding: { left: 0, right: 0, top: 0, bottom: 0 },
            duration: 300,
          });
        }
      });
      return () => cancelAnimationFrame(handle);
    }
  }, [sidebarWidth, isLoaded]);

  return (
    <div className="relative w-full h-screen bg-gray-900">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-800 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-white text-lg mt-4 font-semibold">
              กำลังโหลดแผนที่...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KhonKaenMap;