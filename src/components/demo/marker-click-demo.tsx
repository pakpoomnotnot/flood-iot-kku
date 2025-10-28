"use client";
import React from 'react';
import { MapPin, MousePointer, Eye } from 'lucide-react';

/**
 * Demo component showing how the marker click feature works
 */
const MarkerClickDemo: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marker Click Feature Demo</h1>
        <p className="text-gray-600 mb-8">
          Click on any marker on the map to see its data displayed in the dashboard sidebar
        </p>
        
        {/* Feature Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MousePointer className="h-5 w-5 text-blue-600" />
            How It Works
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Click Any Marker</h3>
                <p className="text-sm text-gray-600">Click on any station marker on the map (blue, red, green, or purple dots)</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Data Appears in Sidebar</h3>
                <p className="text-sm text-gray-600">The station details will automatically appear in the dashboard sidebar with real-time mock data</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">View Sensor Data</h3>
                <p className="text-sm text-gray-600">See current sensor readings, battery level, signal strength, and status indicators</p>
              </div>
            </div>
          </div>
        </div>

        {/* Station Types */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Station Types Available
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">💧</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">ท่อระบายน้ำ (WP)</h3>
                <p className="text-sm text-gray-600">วัดระดับน้ำและความเร็วการไหล</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">⚠️</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">ระดับน้ำบนถนน (WR)</h3>
                <p className="text-sm text-gray-600">เตือนภัยน้ำท่วมบนถนน</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🌊</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">บึง/หนองน้ำ (PW)</h3>
                <p className="text-sm text-gray-600">วัดระดับน้ำและข้อมูลลม</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🌧️</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">ปริมาณฝน (RF)</h3>
                <p className="text-sm text-gray-600">วัดฝน อุณหภูมิ และความชื้น</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mock Data Info */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Mock Data Features
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Real-time Simulation:</strong> Each station generates realistic sensor data with 15-minute intervals</p>
            <p><strong>Status Indicators:</strong> Normal, Warning, and Critical status based on sensor thresholds</p>
            <p><strong>Station Health:</strong> Battery level, signal strength, and online/offline status</p>
            <p><strong>Sensor Types:</strong> Water level, temperature, rainfall, wind speed, humidity, and flow speed</p>
            <p><strong>Data History:</strong> 24 hours of historical data for trend analysis</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-3">🚀 Try It Now!</h3>
          <div className="text-sm text-amber-800 space-y-2">
            <p>1. Navigate to the map view</p>
            <p>2. Look for colored markers on the map</p>
            <p>3. Click on any marker to see its data in the sidebar</p>
            <p>4. Try different station types to see various sensor data</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkerClickDemo;
