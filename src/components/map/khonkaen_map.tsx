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
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const API_KEY: string = "yYduxrRP3C81U2fRFNIU";

  // ตรวจสอบขนาดหน้าจอ
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/topo-v2/style.json?key=${API_KEY}`,
      center: [102.324578, 9.630004],
      zoom: isMobile ? 4.5 : 5, // ซูมน้อยลงบน mobile
      attributionControl: false,
    });

    map.current.on("load", async () => {
      if (!map.current) return;

      try {
        const response = await fetch("/data/khonkaen.json");
        const geojsonData = await response.json();

        map.current.addSource("khonkaen", {
          type: "geojson",
          data: geojsonData,
        });

        map.current.addLayer({
          id: "khonkaen-fill",
          type: "fill",
          source: "khonkaen",
          paint: {
            "fill-color": "#3b82f6",
            "fill-opacity": 0.3,
          },
        });

        map.current.addLayer({
          id: "khonkaen-outline",
          type: "line",
          source: "khonkaen",
          paint: {
            "line-color": "#2563eb",
            "line-width": 2,
          },
        });

        // ปรับ padding สำหรับ desktop เท่านั้น
        if (sidebarWidth > 0 && !isMobile) {
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
  }, [sidebarWidth, isMobile]);

  useEffect(() => {
    if (map.current && isLoaded) {
      const handle = requestAnimationFrame(() => {
        map.current?.resize();

        // ปรับ padding เฉพาะ desktop
        if (!isMobile && sidebarWidth > 0) {
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
  }, [sidebarWidth, isLoaded, isMobile]);

  return (
    <div className="relative w-full h-screen bg-gray-900">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Info Panel - ปรับขนาดตาม responsive */}
      <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-white rounded shadow p-1 md:p-2 w-24 md:w-32 lg:w-22 z-10 text-[7px] md:text-[8px]">
        <h3 className="text-[7px] md:text-[9px] font-bold text-gray-800 mb-0.5 md:mb-1 border-b pb-0.5">
          สถานการณ์น้ำ
        </h3>

        {/* วันที่ */}
        <div className="mb-0.5 md:mb-1 bg-gray-50 rounded px-0.5 md:px-1 py-0.5">
          <div className="text-[6px] md:text-[7px] text-gray-600 leading-none">
            วันที่
          </div>
          <div className="text-[7px] md:text-[8px] font-semibold text-gray-800 leading-tight">
            {new Date().toLocaleDateString("th-TH", {
              day: "numeric",
              month: "short",
              year: "2-digit",
            })}
          </div>
        </div>

        {/* ระดับน้ำ */}
        <div className="space-y-[2px]">
          <div className="flex items-center justify-between px-0.5 md:px-1 py-[2px] bg-red-50 rounded border-l-2 border-red-500">
            <span className="text-[6px] md:text-[7px] text-gray-700">
              วันนี้
            </span>
            <span className="px-0.5 md:px-1 py-[1px] bg-red-500 text-white text-[5px] md:text-[6px] font-bold rounded">
              ไม่มี
            </span>
          </div>

          <div className="flex items-center justify-between px-0.5 md:px-1 py-[2px] bg-orange-50 rounded border-l-2 border-orange-500">
            <span className="text-[6px] md:text-[7px] text-gray-700">
              พรุ่งนี้
            </span>
            <span className="px-0.5 md:px-1 py-[1px] bg-gray-400 text-white text-[5px] md:text-[6px] font-bold rounded">
              ไม่มี
            </span>
          </div>

          <div className="flex items-center justify-between px-0.5 md:px-1 py-[2px] bg-yellow-50 rounded border-l-2 border-yellow-500">
            <span className="text-[6px] md:text-[7px] text-gray-700 leading-tight">
              {isMobile ? "2 วัน" : "อีก 2 วันข้างหน้า"}
            </span>
            <span className="px-0.5 md:px-1 py-[1px] bg-gray-400 text-white text-[5px] md:text-[6px] font-bold rounded">
              ไม่มี
            </span>
          </div>
        </div>

        {/* หมายเหตุ */}
        <div className="mt-0.5 md:mt-1 border-t pt-0.5">
          <p className="text-[5px] md:text-[6px] text-gray-500 italic leading-none">
            * ทุก 15 นาที
          </p>
        </div>
      </div>

      {/* Loading Overlay - ปรับขนาดตาม responsive */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-800 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="text-white text-sm md:text-lg mt-2 md:mt-4 font-semibold">
              กำลังโหลดแผนที่...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KhonKaenMap