"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Droplets } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Dashboard from "../dashboard-chart/dashboard-chart";

interface MainContentProps {
  activeView: string;
  mapComponent?: React.ReactNode;
}

export const MainContent: React.FC<MainContentProps> = ({
  activeView,
  mapComponent,
}) => {
  const [activeTab, setActiveTab] = useState<"level" | "volume">("level");

  return (
    <div className="w-full h-full p-4 flex flex-row gap-2">
      <div className="w-[40%] flex flex-col h-full space-y-2">
        <div className="w-full h-1/2">
          <div className="w-full h-full flex flex-col gap-2">
            <div className="flex flex-col border border-red-200 h-1/2 bg-red-500/40 w-full rounded-md">
              <div className="w-full h-2/10 p-1 flex items-center">
                <span className="text-white text-xs font-semibold">
                  พื้นที่เฝ้าระวังพิเศษ 48 ชั่วโมง ล่วงหน้า
                </span>
              </div>
              <div className="w-full h-8/10 bg-red-50 flex justify-center items-center">
                <div className="p-1">
                  <div className="text-xs font-extralight text-gray-600">
                    ไม่มีพื้นที่เสี่ยงน้ำท่วมจากฝนตกสะสม
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - 72 ชั่วโมง */}
            <div className="flex flex-col border border-orange-200 h-1/2 bg-orange-500/40 w-full rounded-md">
              <div className="w-full h-2/10 p-1 flex items-center">
                <span className="text-white text-xs font-semibold">
                  พื้นที่เฝ้าระวังพิเศษ 72 ชั่วโมง ล่วงหน้า
                </span>
              </div>
              <div className="w-full h-8/10 bg-orange-50 flex justify-center items-center">
                <div className="p-1">
                  <div className="text-xs font-extralight text-gray-600">
                    ไม่มีพื้นที่เสี่ยงน้ำท่วมจากฝนตกสะสม
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-1/2">
          {mapComponent && <div className="w-full h-full">{mapComponent}</div>}
        </div>
      </div>
      <div className="w-full h-ful">
        <div className="w-full h-[30%] bg-white flex flex-row">
          <div className="w-1/2 flex flex-row">
            {/* <div className="w-4/12">1</div>
            <div className="w-4/12">2</div>
            <div className="w-4/12">3</div> */}
          </div>
          <div className="w-1/2 flex flex-row">
            {/* <div className="w-1/2">2.1</div>
            <div className="w-1/2">2.2</div> */}
          </div>
        </div>
        <Dashboard />
        {/* <div className="w-full h-[70%]">
          <div>2</div>
        </div> */}
      </div>
    </div>
  );
};
