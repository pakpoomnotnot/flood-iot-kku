"use client";
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart, ReferenceLine } from 'recharts';
import { TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PredictionData {
  time: string;
  predicted: number;
  actual?: number;
  upperBound?: number;
  lowerBound?: number;
}

interface PredictionChartProps {
  stationName: string;
  stationId: string;
  data: PredictionData[];
  unit?: string;
  height?: number;
}

export const PredictionChart: React.FC<PredictionChartProps> = ({ 
  stationName, 
  stationId,
  data, 
  unit = 'ซม.',
  height = 400 
}) => {
  // Calculate statistics
  const currentValue = data[0]?.predicted || 0;
  const maxPredicted = Math.max(...data.map(d => d.predicted));
  const minPredicted = Math.min(...data.map(d => d.predicted));
  const avgPredicted = data.reduce((sum, d) => sum + d.predicted, 0) / data.length;

  // Determine risk level
  const getRiskLevel = (value: number) => {
    if (value >= 80) return { level: 'วิกฤต', color: '#EF4444' };
    if (value >= 50) return { level: 'เฝ้าระวัง', color: '#F59E0B' };
    return { level: 'ปกติ', color: '#10B981' };
  };

  const risk = getRiskLevel(currentValue);

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-2 sm:px-6 py-3 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg font-bold truncate">{stationName}</CardTitle>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">รหัสสถานี: {stationId}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <span className="text-xs sm:text-sm font-semibold text-gray-700">การคาดการณ์</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 py-0 sm:py-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
            <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">ค่าปัจจุบัน</p>
            <p className="text-base sm:text-xl font-bold text-blue-600">{currentValue.toFixed(1)} {unit}</p>
            <span className={`text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full mt-0.5 sm:mt-1 inline-block ${
              risk.level === 'วิกฤต' ? 'bg-red-100 text-red-700' :
              risk.level === 'เฝ้าระวัง' ? 'bg-amber-100 text-amber-700' :
              'bg-green-100 text-green-700'
            }`}>
              {risk.level}
            </span>
          </div>
          <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
            <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">ค่าเฉลี่ย</p>
            <p className="text-base sm:text-xl font-bold text-gray-700">{avgPredicted.toFixed(1)} {unit}</p>
          </div>
          <div className="text-center p-2 sm:p-3 bg-red-50 rounded-lg">
            <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">สูงสุด</p>
            <p className="text-base sm:text-xl font-bold text-red-600">{maxPredicted.toFixed(1)} {unit}</p>
          </div>
          <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
            <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">ต่ำสุด</p>
            <p className="text-base sm:text-xl font-bold text-green-600">{minPredicted.toFixed(1)} {unit}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full" style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 10', 'dataMax + 10']}
                tickFormatter={(value) => `${value}`}
                width={35}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderColor: '#e5e7eb', 
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  padding: '8px',
                  fontSize: '12px'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px', fontSize: '11px' }}
                formatter={(value: number | undefined, name: string | undefined) => {
                  // ✅ แก้ไข: เพิ่ม type guard
                  if (value === undefined || value === null || name === undefined) {
                    return ['N/A', 'Unknown'];
                  }
                  
                  if (name === 'predicted') return [`${value.toFixed(1)} ${unit}`, 'คาดการณ์'];
                  if (name === 'upperBound') return [`${value.toFixed(1)} ${unit}`, 'บน'];
                  if (name === 'lowerBound') return [`${value.toFixed(1)} ${unit}`, 'ล่าง'];
                  if (name === 'actual') return [`${value.toFixed(1)} ${unit}`, 'จริง'];
                  return [value.toString(), name];
                }}
              />
              
              {/* Confidence interval */}
              {data[0]?.upperBound && data[0]?.lowerBound && (
                <>
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    stroke="none"
                    fill="url(#confidenceGradient)"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    stroke="none"
                    fill="url(#confidenceGradient)"
                    fillOpacity={0.3}
                  />
                </>
              )}
              
              {/* Actual data line (if available) */}
              {data[0]?.actual !== undefined && (
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 3 }}
                  strokeDasharray="5 5"
                />
              )}
              
              {/* Prediction line */}
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#predictionGradient)"
                dot={{ fill: '#3B82F6', r: 3 }}
                activeDot={{ r: 5, fill: '#2563eb' }}
              />
              
              {/* Threshold lines */}
              <ReferenceLine y={80} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={1.5} />
              <ReferenceLine y={50} stroke="#F59E0B" strokeDasharray="3 3" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 mt-3 sm:mt-4 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 sm:w-4 h-0.5 bg-blue-600"></div>
            <span className="text-gray-600">คาดการณ์</span>
          </div>
          {data[0]?.actual !== undefined && (
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 sm:w-4 h-0.5 bg-green-600 border-dashed"></div>
              <span className="text-gray-600">จริง</span>
            </div>
          )}
          {data[0]?.upperBound && (
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 sm:w-4 h-2 bg-purple-200 rounded"></div>
              <span className="text-gray-600">ช่วงความเชื่อมั่น</span>
            </div>
          )}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 sm:w-4 h-0.5 bg-red-500 border-dashed"></div>
            <span className="text-gray-600 whitespace-nowrap">วิกฤต (80{unit})</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 sm:w-4 h-0.5 bg-amber-500 border-dashed"></div>
            <span className="text-gray-600 whitespace-nowrap">เฝ้าระวัง (50{unit})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to generate prediction data
export const generatePredictionData = (stationId: string, hours: number = 48): PredictionData[] => {
  const now = new Date();
  const data: PredictionData[] = [];
  
  // Start with current value (simulated)
  let currentValue = 45 + Math.random() * 20; // Random between 45-65
  
  for (let i = 0; i < hours; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hour = time.getHours();
    
    // Simulate prediction with some variation
    // Higher values during night/early morning (simulating rain accumulation)
    const timeFactor = hour >= 2 && hour <= 6 ? 1.2 : hour >= 14 && hour <= 18 ? 1.1 : 1.0;
    const randomVariation = (Math.random() - 0.5) * 5;
    
    currentValue = Math.max(0, currentValue + randomVariation * timeFactor);
    
    // Add some trend (gradual increase for demonstration)
    if (i > 24) {
      currentValue += 0.3; // Gradual increase after 24 hours
    }
    
    const predicted = Math.max(0, currentValue);
    const confidence = 5 + Math.random() * 3; // Confidence interval
    
    data.push({
      time: time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      predicted: Math.round(predicted * 10) / 10,
      upperBound: Math.round((predicted + confidence) * 10) / 10,
      lowerBound: Math.round((predicted - confidence) * 10) / 10,
      // Show actual data for first 12 hours (past data)
      ...(i < 12 ? { actual: Math.round((predicted + (Math.random() - 0.5) * 2) * 10) / 10 } : {})
    });
  }
  
  return data;
}