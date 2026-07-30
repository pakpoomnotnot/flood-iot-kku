"use client";

import React, { useState } from "react";
import MapLibreComponent from "@/components/map/map-defult";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { MainContent } from "@/components/layout/main-content";
import { StationProvider } from "@/contexts/station-context";
import WaterTable from "@/components/dashboard-chart/dashbaord-table";
import MapComponent from "@/components/map/map_rain";
import MapComponentSwamp from "@/components/map/map_swamp";
import MapComponentDrainage from "@/components/map/map_drainage";
import MapComponentRoads from "@/components/map/map_road";
import MapComponentAnalytics from "@/components/map/map_analytics";
import MapComponentFlood from "@/components/map/map_flood_area";
import FloodDashboard from "@/components/map/map_help";
import { DashboardNavAdmin } from "@/components/layout/dashboard-nav-admin";
import {
  RAINFALL_TABS,
  useMapViewData,
  deriveRainWindow,
  type RainfallTab,
} from "./use-map-view-data";

const RainfallTabBar = ({
  activeTab,
  onTabChange,
}: {
  activeTab: RainfallTab;
  onTabChange: (tab: RainfallTab) => void;
}) => (
  <div className="flex w-full border-b border-gray-200 bg-white">
    {RAINFALL_TABS.map((tab) => (
      <button
        key={tab.key}
        onClick={() => onTabChange(tab.key)}
        className={`
          relative flex-1 px-2 py-3 text-xs font-medium transition-all duration-200
          whitespace-nowrap overflow-hidden text-ellipsis
          ${
            activeTab === tab.key
              ? "text-[#A73B24] border-b-2 border-[#A73B24]"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent"
          }
        `}
        title={tab.label}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

const MapViewAdmin = () => {
  const [activeView, setActiveView] = useState("overview");
  const [showTable, setShowTable] = useState(false);
  const {
    rainfallTab,
    setRainfallTab,
    getCurrentData,
    getTableMode,
    getTelemetryCategory,
  } = useMapViewData();

  const getMapComponent = () => {
    switch (activeView) {
      case "rainfall":
        return <MapComponent />;
      case "ponds":
        return <MapComponentSwamp />;
      case "drainage":
        return <MapComponentDrainage />;
      case "roads":
        return <MapComponentRoads />;
      case "analysis":
        return <MapComponentAnalytics />;
      case "mapflood":
        return <MapComponentFlood />;
      case "alertanoncement":
        return <FloodDashboard />;
      default:
        return <MapComponent />;
    }
  };

  return (
    <StationProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-[#f8f5f3]">
        <DashboardHeader />

        <div className="flex flex-1 overflow-hidden">
          <DashboardNavAdmin activeView={activeView} onViewChange={setActiveView} />

          <div className="relative flex flex-1 flex-col overflow-hidden bg-[#fffaf7]">
            {activeView === "overview" ? (
              <div className="flex-1 overflow-auto">
                <MainContent
                  activeView={activeView}
                  mapComponent={
                    <div className="relative h-full w-full overflow-hidden rounded-lg border border-[#ead0c7] bg-slate-900 shadow-inner">
                      <MapLibreComponent sidebarWidth={0} isWidth={() => {}} />
                    </div>
                  }
                />
              </div>
            ) : activeView === "analysis" ||
              activeView === "mapflood" ||
              activeView === "alertanoncement" ? (
              <main className="flex h-full w-full flex-col overflow-hidden bg-white p-2 sm:p-4">
                <div className="h-full w-full rounded-xl border border-[#ead0c7] bg-slate-900 shadow-inner">
                  {getMapComponent()}
                </div>
              </main>
            ) : (
              <main className="flex h-full w-full flex-col overflow-hidden bg-white p-2 sm:p-4 lg:flex-row lg:gap-4">
                <div className="mb-2 flex gap-2 lg:hidden">
                  <button
                    onClick={() => setShowTable(false)}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      !showTable ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    แผนที่
                  </button>
                  <button
                    onClick={() => setShowTable(true)}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      showTable ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    ตารางข้อมูล
                  </button>
                </div>

                <div
                  className={`h-[100vh] w-full rounded-xl border border-[#ead0c7] bg-slate-900 shadow-inner lg:h-full lg:w-1/2 ${
                    showTable ? "hidden lg:block" : "block"
                  }`}
                >
                  {getMapComponent()}
                </div>

                <div
                  className={`flex h-[50vh] w-full flex-col overflow-hidden rounded-xl border border-[#ead0c7] bg-white shadow-sm lg:h-full lg:w-1/2 ${
                    !showTable ? "hidden lg:flex" : "flex"
                  }`}
                >
                  {activeView === "rainfall" && (
                    <RainfallTabBar activeTab={rainfallTab} onTabChange={setRainfallTab} />
                  )}

                  <div className="min-h-0 flex-1 overflow-auto">
                    <WaterTable
                      data={getCurrentData(activeView)}
                      mode={getTableMode(activeView)}
                      telemetryCategory={getTelemetryCategory(activeView)}
                      rainfallWindow={
                        activeView === "rainfall" ? deriveRainWindow(rainfallTab) : undefined
                      }
                    />
                  </div>
                </div>
              </main>
            )}
          </div>
        </div>
      </div>
    </StationProvider>
  );
};

export default MapViewAdmin;
