"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, Droplets } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MainContentProps {
  activeView: string;
  mapComponent?: React.ReactNode;
}

export const MainContent: React.FC<MainContentProps> = ({ activeView, mapComponent }) => {
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 space-y-4">
      {/* Special Watch Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 48 Hours Ahead */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">
              พื้นที่เฝ้าระวังพิเศษ 48 ชั่วโมง ล่วงหน้า
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-700 mb-2">
                  No areas at risk of flooding from accumulated rainfall.
                </p>
                <p className="text-xs text-gray-500">
                  Last updated: November 4, 2568, 18:00
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 72 Hours Ahead */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">
              พื้นที่เฝ้าระวังพิเศษ 72 ชั่วโมง ล่วงหน้า
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-700 mb-2">
                  No areas at risk of flooding from accumulated rainfall.
                </p>
                <p className="text-xs text-gray-500">
                  Last updated: November 4, 2568, 18:00
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Water Levels in Specific Reservoirs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">
              ปริมาณน้ำ บึงหนองโคตร
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">71%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-orange-500 h-3 rounded-full transition-all"
                  style={{ width: '71%' }}
                />
              </div>
              <p className="text-xs text-gray-500">
                Last updated: 2025-11-04
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">
              ปริมาณน้ำ บึงแก่นนคร
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">71%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-orange-500 h-3 rounded-full transition-all"
                  style={{ width: '71%' }}
                />
              </div>
              <p className="text-xs text-gray-500">
                Last updated: 2025-11-04
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">
              ปริมาณน้ำ บึงทุ่งสร้าง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">71%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-orange-500 h-3 rounded-full transition-all"
                  style={{ width: '71%' }}
                />
              </div>
              <p className="text-xs text-gray-500">
                Last updated: 2025-11-04
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map in the Middle - Dashboard Focus */}
      {mapComponent && (
        <div className="w-full" style={{ height: '500px' }}>
          {mapComponent}
        </div>
      )}

      {/* Accumulated Rainfall in Last 1 Hour */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">
            ฝนสะสม 1 ชม. ที่ผ่านมา
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1">เทศบาลนคร</p>
                <p className="text-xl font-bold text-gray-900">2.0</p>
                <p className="text-xs text-gray-500 mt-1">มม.</p>
              </div>
              <Droplets className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1">บึงแก่นนคร</p>
                <p className="text-xl font-bold text-gray-900">1.6</p>
                <p className="text-xs text-gray-500 mt-1">มม.</p>
              </div>
              <Droplets className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1">บึงทุ่งสร้าง</p>
                <p className="text-xl font-bold text-gray-900">0.8</p>
                <p className="text-xs text-gray-500 mt-1">มม.</p>
              </div>
              <Droplets className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Charts Section - Based on images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Water Level in Ponds/Reservoirs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">
              สถานีวัดระดับน้ำในหนองน้ำ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-center h-32">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-orange-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-700">10</span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-red-600">น้ำล้นตลิ่ง</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-600">น้ำมาก</span>
                  <span className="font-semibold">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-600">น้ำปกติ</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400">น้ำน้อย</span>
                  <span className="font-semibold">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">ไม่มีข้อมูล</span>
                  <span className="font-semibold">0</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rainfall Measurement Stations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">
              สถานีวัดปริมาณฝน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-center h-32">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-gray-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-700">27</span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-red-800">ฝนตกหนักมาก</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-600">ฝนตกหนัก</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-600">ฝนตกปานกลาง</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400">ฝนตกเล็กน้อย</span>
                  <span className="font-semibold">7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">ไม่มีฝน</span>
                  <span className="font-semibold">20</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Water Level in Drainage Pipes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">
              สถานีวัดระดับน้ำในท่อ (10 สถานี)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-center h-32">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-orange-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-700">10</span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-red-600">วิกฤต</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-600">แจ้งเตือน</span>
                  <span className="font-semibold">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-yellow-500">เฝ้าระวัง</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-600">ปกติ</span>
                  <span className="font-semibold">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">ไม่มีข้อมูล</span>
                  <span className="font-semibold">0</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Road Surface Flood Level */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">
              สถานีวัดระดับน้ำท่วมผิวถนน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-center h-32">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-orange-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-700">10</span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-red-600">วิกฤต</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-600">แจ้งเตือน</span>
                  <span className="font-semibold">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-yellow-500">เฝ้าระวัง</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-600">ปกติ</span>
                  <span className="font-semibold">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">ไม่มีข้อมูล</span>
                  <span className="font-semibold">0</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

