"use client";
import React from 'react';
import WaterLevelChart from './water-level-chart';

/**
 * Test component to demonstrate the WaterLevelChart with actual API data structure
 */
const WaterLevelTest: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Water Level Chart Test</h1>
        <p className="text-gray-600 mb-8">
          Testing the WaterLevelChart component with the actual API data structure from water_level_15m
        </p>
        
        {/* Test 1: General Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">1. General Water Level Chart (All Stations)</h2>
          <WaterLevelChart 
            timeRange="24h"
            height={300}
            showStats={true}
          />
        </div>

        {/* Test 2: Station-Specific Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Station-Specific Chart (บึงแก่นนคร)</h2>
          <WaterLevelChart 
            stationId="PW01"
            timeRange="24h"
            height={250}
            showStats={true}
          />
        </div>

        {/* Test 3: Multiple Charts Grid */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Multiple Stations Comparison</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">บึงแก่นนคร (PW01)</h3>
              <WaterLevelChart 
                stationId="PW01"
                timeRange="6h"
                height={200}
                showStats={false}
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">บึงทุ่งสร้าง (PW02)</h3>
              <WaterLevelChart 
                stationId="PW02"
                timeRange="6h"
                height={200}
                showStats={false}
              />
            </div>
          </div>
        </div>

        {/* Data Structure Info */}
        <div className="bg-blue-50 rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📊 Expected Data Structure</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>API Endpoint:</strong> /api/water_level_15m</p>
            <p><strong>Data Fields:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code>payload.max_water_level</code> - ระดับน้ำสูงสุด (เซนติเมตร)</li>
              <li><code>payload.avg_air_temp_c</code> - อุณหภูมิเฉลี่ย (องศาเซลเซียส)</li>
              <li><code>payload.rain_total_15min</code> - ปริมาณฝน 15 นาที (มิลลิเมตร)</li>
              <li><code>payload.data_points_count</code> - จำนวนจุดข้อมูล</li>
              <li><code>payload.timestamp_end</code> - เวลาสิ้นสุดการวัด</li>
              <li><code>payload.station_topic</code> - รหัสสถานี</li>
            </ul>
            <p className="mt-3"><strong>Status Thresholds:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>ปกติ: &lt; 50 ซม.</li>
              <li>เฝ้าระวัง: 50-80 ซม.</li>
              <li>วิกฤต: &gt; 80 ซม.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterLevelTest;
