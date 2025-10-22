"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import MapLibreComponent from "@/components/map/map-defult";
import DashboardSidebar from "@/components/sidebar/sidebar-layout";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";

const MapView = () => {
  // State สำหรับ sidebar
  const [sidebarWidth, setSidebarWidth] = useState(384); // 24rem = 384px
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isResizing = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // กำหนดความกว้างต่ำสุดและสูงสุด
  const minWidth = 288; // 18rem
  const maxWidth = 768; // 48rem
  const collapsedWidth = 0; // ซ่อนเต็มที่

  // ตรวจสอบขนาดหน้าจอ
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // < md
      setIsTablet(width >= 768 && width < 1024); // md to lg
      
      // ปรับ sidebar width ตามขนาดหน้าจอ
      if (width < 768) {
        // Mobile: ซ่อน sidebar by default
        setSidebarWidth(0);
        setIsCollapsed(true);
      } else if (width >= 768 && width < 1024) {
        // Tablet: ขนาดเล็กลง
        setSidebarWidth(320);
        setIsCollapsed(false);
      } else {
        // Desktop: ขนาดปกติ
        if (sidebarWidth === 0) {
          setSidebarWidth(384);
          setIsCollapsed(false);
        }
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const startResizing = useCallback((e: React.MouseEvent) => {
    if (isMobile) return; // ไม่ให้ resize บน mobile
    e.preventDefault();
    isResizing.current = true;
  }, [isMobile]);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing.current && !isMobile) {
      let newWidth = e.clientX;
      
      // จำกัดความกว้างไม่ให้เกิน min/max
      if (newWidth < minWidth) newWidth = minWidth;
      if (newWidth > maxWidth) newWidth = maxWidth;

      setSidebarWidth(newWidth);
      setIsCollapsed(false);
    }
  }, [isMobile, minWidth, maxWidth]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // Toggle sidebar
  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      if (isCollapsed) {
        setSidebarWidth(isTablet ? 320 : 384);
        setIsCollapsed(false);
      } else {
        setSidebarWidth(collapsedWidth);
        setIsCollapsed(true);
      }
    }
  };

  // Close mobile sidebar เมื่อคลิกนอก sidebar
  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 relative">
      
      {/* Mobile Menu Button - แสดงเฉพาะบน mobile */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Toggle Menu"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
      )}

      {/* Desktop/Tablet Toggle Button */}
      {/* {!isMobile && (
        <button
          onClick={toggleSidebar}
          className={`
            fixed top-1/2 -translate-y-1/2 z-50 
            p-2 bg-white rounded-r-lg shadow-lg 
            hover:shadow-xl transition-all duration-300
            ${isCollapsed ? 'left-0' : `left-[${sidebarWidth}px]`}
          `}
          style={{ left: isCollapsed ? '0px' : `${sidebarWidth}px` }}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-700" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          )}
        </button>
      )} */}

      {/* Mobile Overlay - ลบออกเพราะ sidebar เต็มจอแล้ว */}

      {/* Sidebar Container */}
      <div
        className={`
          ${isMobile ? 'fixed inset-0 z-40' : 'relative'}
          transition-transform duration-300 ease-in-out
          ${isMobile && !isMobileSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
        style={{
          width: isMobile ? '100vw' : `${sidebarWidth}px`
        }}
      >
        {/* Close Button for Mobile */}
        {/* {isMobile && isMobileSidebarOpen && (
          <button
            onClick={closeMobileSidebar}
            className="absolute top-6 right-6 z-[60] p-3 bg-red-500 hover:bg-red-600 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
            aria-label="Close Menu"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        )} */}

        <DashboardSidebar 
          width={isMobile ? (isMobileSidebarOpen ? window.innerWidth : 0) : sidebarWidth} 
        />
      </div>

      {/* Resizer Handle (Desktop/Tablet only) */}
      {!isMobile && !isCollapsed && (
        <div 
          className="w-2 cursor-col-resize bg-slate-700 hover:bg-blue-500 transition-colors duration-200 flex-shrink-0"
          onMouseDown={startResizing}
          aria-hidden="true"
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-1 h-12 bg-slate-500 rounded-full" />
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <main className="flex-1 relative overflow-hidden">
        <MapLibreComponent 
          sidebarWidth={
            isMobile 
              ? (isMobileSidebarOpen ? window.innerWidth : 0) 
              : sidebarWidth
          }
          isWidth = {setSidebarWidth} 
        />
      </main>

      {/* Mobile Bottom Info Bar (Optional) */}
      {isMobile && !isMobileSidebarOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg">
          <p className="text-xs font-medium text-gray-700">
            แตะปุ่มเมนูเพื่อดูข้อมูล
          </p>
        </div>
      )}

      {/* Screen Size Indicator (Development only - ลบออกใน production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50 px-3 py-1 bg-black/70 text-white text-xs rounded-full font-mono">
          <span className="sm:hidden">XS</span>
          <span className="hidden sm:inline md:hidden">SM</span>
          <span className="hidden md:inline lg:hidden">MD</span>
          <span className="hidden lg:inline xl:hidden">LG</span>
          <span className="hidden xl:inline 2xl:hidden">XL</span>
          <span className="hidden 2xl:inline">2XL</span>
          <span className="ml-2">{window.innerWidth}px</span>
        </div>
      )}

    </div>
  );
};

export default MapView;