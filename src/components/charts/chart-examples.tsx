"use client";
import React from 'react';
import WaterLevelChart from './water-level-chart';

/**
 * Example component showing different ways to use the WaterLevelChart
 */
const ChartExamples: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Water Level Chart Examples</h1>
      
      {/* Example 1: Basic Chart */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">1. Basic Chart (All Stations)</h2>
        <WaterLevelChart />
      </div>

      {/* Example 2: Station-Specific Chart */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">2. Station-Specific Chart (บึงแก่นนคร)</h2>
        <WaterLevelChart 
          stationId="PW01"
          timeRange="24h"
          height={250}
          showStats={true}
        />
      </div>

      {/* Example 3: Compact Chart without Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">3. Compact Chart (No Stats)</h2>
        <WaterLevelChart 
          timeRange="6h"
          height={200}
          showStats={false}
        />
      </div>

      {/* Example 4: Long-term Trend */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">4. Long-term Trend (7 Days)</h2>
        <WaterLevelChart 
          timeRange="7d"
          height={300}
          showStats={true}
        />
      </div>

      {/* Example 5: Multiple Charts in Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">5. Multiple Stations Grid</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WaterLevelChart 
            stationId="PW01"
            timeRange="24h"
            height={200}
            showStats={false}
          />
          <WaterLevelChart 
            stationId="PW02"
            timeRange="24h"
            height={200}
            showStats={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartExamples;
