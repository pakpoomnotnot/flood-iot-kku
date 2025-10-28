"use client";
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from 'recharts';
import { Droplets, TrendingUp, AlertTriangle, Activity } from 'lucide-react';

interface WaterLevelData {
  timestamp: string;
  water_level: number;
  station_id: string;
  station_name: string;
  status: 'normal' | 'warning' | 'critical';
  temperature?: number;
  rainfall?: number;
  dataPoints?: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    data: Array<{
      id: string;
      payload: {
        timestamp_end: string;
        station_topic: string;
        data_points_count: number;
        avg_air_temp_c: number;
        rain_total_15min: number;
        max_water_level: number;
        topic: string;
        _msgid: string;
      };
      created_at: string;
    }>;
  };
}

interface WaterLevelChartProps {
  stationId?: string;
  timeRange?: '1h' | '6h' | '24h' | '7d';
  height?: number;
  showStats?: boolean;
}

const WaterLevelChart: React.FC<WaterLevelChartProps> = ({ 
  stationId, 
  timeRange = '24h', 
  height = 300,
  showStats = true 
}) => {
  const [data, setData] = useState<WaterLevelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    current: 0,
    average: 0,
    max: 0,
    min: 0,
    trend: 'stable' as 'up' | 'down' | 'stable'
  });

  useEffect(() => {
    fetchWaterLevelData();
    
    // Set up real-time updates every 15 minutes
    const interval = setInterval(fetchWaterLevelData, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [stationId, timeRange]);

  const fetchWaterLevelData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        timeRange,
        ...(stationId && { stationId })
      });
      
      const response = await fetch(`/api/water_level_15m?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch water level data');
      }
      
      const result: ApiResponse = await response.json();
      
      // Transform data for chart
      const chartData = result.data?.data?.map((item) => ({
        timestamp: new Date(item.payload.timestamp_end).toLocaleTimeString('th-TH', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        water_level: item.payload.max_water_level || 0,
        station_id: item.payload.station_topic || 'unknown',
        station_name: getStationName(item.payload.station_topic),
        status: getStatusFromLevel(item.payload.max_water_level),
        temperature: item.payload.avg_air_temp_c,
        rainfall: item.payload.rain_total_15min,
        dataPoints: item.payload.data_points_count
      })) || [];
      
      setData(chartData);
      
      // Calculate stats
      if (chartData.length > 0) {
        const levels = chartData.map((d: WaterLevelData) => d.water_level);
        const current = levels[levels.length - 1] || 0;
        const average = levels.reduce((sum: number, level: number) => sum + level, 0) / levels.length;
        const max = Math.max(...levels);
        const min = Math.min(...levels);
        
        // Calculate trend
        const firstHalf = levels.slice(0, Math.floor(levels.length / 2));
        const secondHalf = levels.slice(Math.floor(levels.length / 2));
        const firstAvg = firstHalf.reduce((sum: number, level: number) => sum + level, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum: number, level: number) => sum + level, 0) / secondHalf.length;
        
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (secondAvg > firstAvg + 5) trend = 'up';
        else if (secondAvg < firstAvg - 5) trend = 'down';
        
        setStats({
          current,
          average: Math.round(average),
          max,
          min,
          trend
        });
      }
      
    } catch (err) {
      console.error('Error fetching water level data:', err);
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const getStationName = (stationTopic: string): string => {
    // Map station topics to readable names based on your station data
    const stationNames: { [key: string]: string } = {
      'aggregate_trigger': 'สถานีรวม',
      'WP01': 'ซอยเทพารักษ์',
      'WP02': 'ถนนหมอชาญอุทิศ',
      'WP03': 'หน้าร้านจิ้มจุ่มริมคลอง',
      'PW01': 'บึงแก่นนคร',
      'PW02': 'บึงทุ่งสร้าง',
      'PW03': 'สะพานบ้านทุ่งเศรษฐี',
      'RF01': 'โรงพยาบาลศรีนครินทร์',
      'RF02': 'เทศบาลนครขอนแก่น'
    };
    
    return stationNames[stationTopic] || stationTopic;
  };

  const getStatusFromLevel = (level: number): 'normal' | 'warning' | 'critical' => {
    // Adjust thresholds based on your actual water level data (in cm)
    if (level >= 80) return 'critical';
    if (level >= 50) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'up': return 'เพิ่มขึ้น';
      case 'down': return 'ลดลง';
      default: return 'คงที่';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-center h-64 text-red-500">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <Droplets className="h-4 w-4 mr-2 text-blue-600" />
          ระดับน้ำ 15 นาที
          {stationId && <span className="ml-2 text-xs text-gray-500">({stationId})</span>}
        </h3>
        <div className="flex items-center space-x-2">
          {getTrendIcon(stats.trend)}
          <span className="text-xs text-gray-600">{getTrendText(stats.trend)}</span>
        </div>
      </div>

      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">ปัจจุบัน</p>
            <p className="text-lg font-bold text-blue-600">{stats.current.toFixed(1)} ซม.</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">เฉลี่ย</p>
            <p className="text-lg font-bold text-gray-700">{stats.average.toFixed(1)} ซม.</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">สูงสุด</p>
            <p className="text-lg font-bold text-red-600">{stats.max.toFixed(1)} ซม.</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">ต่ำสุด</p>
            <p className="text-lg font-bold text-green-600">{stats.min.toFixed(1)} ซม.</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ width: '100%', height: `${height}px` }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#94a3b8" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `${value} ซม.`}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'white', 
                borderColor: '#e5e7eb', 
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}
              labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
              formatter={(value: number, name: string, props: any) => {
                const data = props.payload;
                return [
                  <div key="tooltip" className="space-y-1">
                    <div className="font-semibold text-blue-600">{`${value} ซม.`}</div>
                    <div className="text-xs text-gray-600">ระดับน้ำสูงสุด</div>
                    {data.temperature && (
                      <div className="text-xs text-gray-500">อุณหภูมิ: {data.temperature.toFixed(1)}°C</div>
                    )}
                    {data.rainfall !== undefined && (
                      <div className="text-xs text-gray-500">ฝน: {data.rainfall} มม.</div>
                    )}
                    {data.dataPoints && (
                      <div className="text-xs text-gray-500">ข้อมูล: {data.dataPoints} จุด</div>
                    )}
                  </div>
                ];
              }}
            />
            <Area
              type="monotone"
              dataKey="water_level"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#waterGradient)"
              dot={{ fill: '#3B82F6', r: 3 }}
              activeDot={{ r: 5, fill: '#2563eb' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Status Legend */}
      <div className="flex items-center justify-center space-x-4 mt-3 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600">ปกติ (&lt;50 ซม.)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-gray-600">เฝ้าระวัง (50-80 ซม.)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-600">วิกฤต (80+ ซม.)</span>
        </div>
      </div>
    </div>
  );
};

export default WaterLevelChart;
