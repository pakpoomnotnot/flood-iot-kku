"use client";
import React, { useState } from "react";
import MapLibreComponent from "@/components/map/map-defult";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { MainContent } from "@/components/layout/main-content";
import { StationProvider } from "@/contexts/station-context";

const MapView = () => {
  const [activeView, setActiveView] = useState('overview');

  return (
    <StationProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
        {/* Top Header */}
        <DashboardHeader />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Navigation Sidebar */}
          <DashboardNav activeView={activeView} onViewChange={setActiveView} />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col relative overflow-hidden bg-gray-50">
            {/* Show Dashboard-focused layout when in overview, otherwise show map */}
            {activeView === 'overview' ? (
              <div className="flex-1 overflow-auto">
                <MainContent 
                  activeView={activeView}
                  mapComponent={
                    <div className="h-full w-full relative overflow-hidden bg-slate-900 rounded-lg border border-gray-200 shadow-lg">
                      <MapLibreComponent 
                        sidebarWidth={0}
                        isWidth={() => {}} 
                      />
                    </div>
                  }
                />
              </div>
            ) : (
              /* Full map view for other views */
              <main className="flex-1 relative overflow-hidden bg-slate-900">
                <MapLibreComponent 
                  sidebarWidth={0}
                  isWidth={() => {}} 
                />
              </main>
            )}
          </div>
        </div>

      {/* Screen Size Indicator (Development only - ลบออกใน production) */}
      {process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && (
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
    </StationProvider>
  );
};

export default MapView;