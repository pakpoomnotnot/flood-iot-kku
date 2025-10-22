"use client";
import React, { FC, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  MapPin, 
  Droplets, 
  ChevronDown,
  Activity,
  TrendingUp,
  Waves,
  Cloud
} from 'lucide-react';

interface SidebarProps {
  width: number;
}

const summaryStats = [
  { 
    id: 1, 
    label: 'สถานีทั้งหมด', 
    value: '29', 
    icon: MapPin, 
    color: 'from-blue-500 to-blue-600',
    iconColor: 'text-blue-400',
    trend: '+2',
    trendLabel: 'เพิ่มขึ้น'
  },
  { 
    id: 2, 
    label: 'แจ้งเตือน', 
    value: '3', 
    icon: AlertTriangle, 
    color: 'from-amber-500 to-amber-600',
    iconColor: 'text-amber-400',
    trend: '-5',
    trendLabel: 'ลดลง'
  },
  { 
    id: 3, 
    label: 'ออนไลน์', 
    value: '27', 
    icon: Activity, 
    color: 'from-green-500 to-green-600',
    iconColor: 'text-green-400',
    trend: '93%',
    trendLabel: 'พร้อมใช้งาน'
  },
  { 
    id: 4, 
    label: 'ระดับน้ำเฉลี่ย', 
    value: '45%', 
    icon: Waves, 
    color: 'from-cyan-500 to-cyan-600',
    iconColor: 'text-cyan-400',
    trend: '+12%',
    trendLabel: 'เพิ่มขึ้น'
  },
];

// ข้อมูลระดับน้ำ 5 อันดับสูงสุด
const waterLevelData = [
  { name: 'บึงแก่นนคร', level: 85, status: 'high' },
  { name: 'บึงทุ่งสร้าง', level: 72, status: 'medium' },
  { name: 'บึงหนองโคตร', level: 68, status: 'medium' },
  { name: 'ประตูน้ำที่ 5', level: 52, status: 'normal' },
  { name: 'สะพานบ้านทุ่ง', level: 38, status: 'normal' },
];

// ข้อมูลสถานะสถานี
const statusData = [
  { name: 'ปกติ', value: 24, color: '#10B981' },
  { name: 'เฝ้าระวัง', value: 3, color: '#F59E0B' },
  { name: 'วิกฤต', value: 2, color: '#EF4444' },
];

// ข้อมูลแนวโน้ม 7 วัน
const trendData = [
  { day: 'จ.', value: 35 },
  { day: 'อ.', value: 42 },
  { day: 'พ.', value: 38 },
  { day: 'พฤ.', value: 45 },
  { day: 'ศ.', value: 52 },
  { day: 'ส.', value: 48 },
  { day: 'อา.', value: 45 },
];

// ข้อมูลประเภทสถานี
const stationTypeData = [
  { type: 'ท่อระบาย', count: 7, color: '#3B82F6', icon: '💧' },
  { type: 'ถนน', count: 9, color: '#EF4444', icon: '⚠️' },
  { type: 'บึง', count: 5, color: '#10B981', icon: '🌊' },
  { type: 'ฝน', count: 8, color: '#8B5CF6', icon: '🌧️' },
];

// --- Sub-Components ---
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  iconColor: string;
  trend: string;
  trendLabel: string;
}

const StatCard: FC<StatCardProps> = ({ icon: Icon, label, value, color, iconColor, trend, trendLabel }) => (
  <div className="group relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-200">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${color} shadow-lg`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="text-right">
        <span className="text-xs text-gray-500 font-medium">{trendLabel}</span>
        <p className="text-xs font-semibold text-green-600">{trend}</p>
      </div>
    </div>
    <div>
      <p className="text-xs text-gray-600 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        {value}
      </p>
    </div>
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
  </div>
);

// Station Type Card
interface StationTypeCardProps {
  type: string;
  count: number;
  color: string;
  icon: string;
}

const StationTypeCard: FC<StationTypeCardProps> = ({ type, count, color, icon }) => (
  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all duration-200">
    <div className="flex items-center gap-3">
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-sm"
        style={{ backgroundColor: `${color}15` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700">{type}</p>
        <p className="text-xs text-gray-500">สถานี</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-xl font-bold" style={{ color }}>{count}</p>
    </div>
  </div>
);

// --- Main Sidebar Component ---
const DashboardSidebar: FC<SidebarProps> = ({ width }) => {
  const [timeRange, setTimeRange] = useState('24h');

  return (
    <aside 
      className="bg-gradient-to-b from-gray-50 to-gray-50 text-gray-800 h-screen flex flex-col overflow-hidden"
      style={{ width: `${width}px` }}
    >
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
        <div className="p-6 space-y-6">
          
          {/* === Header === */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <div>
                <a href='/' className="text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
                  Dashboard
                </a>
                <p className="text-xs text-gray-500">KKC-UFM System</p>
              </div>
            </div>
            <div className="relative">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white border border-gray-200 text-sm rounded-lg py-2 pl-3 pr-9 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors cursor-pointer"
              >
                <option value="24h">24 ชม.</option>
                <option value="7d">7 วัน</option>
                <option value="30d">30 วัน</option>
              </select>
              <ChevronDown className="h-4 w-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>
          </div>

          {/* === Summary Stats Grid === */}
          <div className="grid grid-cols-2 gap-3">
            {summaryStats.map(stat => (
              <StatCard 
                key={stat.id} 
                icon={stat.icon} 
                label={stat.label} 
                value={stat.value} 
                color={stat.color}
                iconColor={stat.iconColor}
                trend={stat.trend}
                trendLabel={stat.trendLabel}
              />
            ))}
          </div>

          {/* === Station Types === */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                ประเภทสถานี
              </h3>
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-semibold">
                {stationTypeData.reduce((sum, item) => sum + item.count, 0)} สถานี
              </span>
            </div>
            <div className="space-y-2">
              {stationTypeData.map((item, idx) => (
                <StationTypeCard 
                  key={idx}
                  type={item.type}
                  count={item.count}
                  color={item.color}
                  icon={item.icon}
                />
              ))}
            </div>
          </div>

          {/* === Water Level Chart === */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
              <Droplets className="h-4 w-4 mr-2 text-blue-600" />
              5 อันดับระดับน้ำสูงสุด
            </h3>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart 
                  data={waterLevelData} 
                  layout="vertical" 
                  margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderColor: '#e5e7eb', 
                      borderRadius: '0.75rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e5e7eb'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Bar 
                    dataKey="level" 
                    radius={[0, 8, 8, 0]} 
                    barSize={16}
                  >
                    {waterLevelData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.status === 'high' ? '#EF4444' : 
                          entry.status === 'medium' ? '#F59E0B' : 
                          '#3B82F6'
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* === Trend Chart === */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
              แนวโน้มระดับน้ำ 7 วัน
            </h3>
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer>
                <LineChart 
                  data={trendData} 
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#94a3b8" 
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderColor: '#e5e7eb', 
                      borderRadius: '0.75rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e5e7eb'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6, fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* === Status Pie Chart === */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-blue-600" />
              สถานะโดยรวม
            </h3>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderColor: '#e5e7eb', 
                      borderRadius: '0.75rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e5e7eb'
                    }}
                  />
                  <Legend 
                    iconSize={10}
                    iconType="circle"
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* === Quick Actions === */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
            <h3 className="text-sm font-bold mb-3 flex items-center">
              <Cloud className="h-4 w-4 mr-2" />
              การแจ้งเตือนล่าสุด
            </h3>
            <div className="space-y-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all cursor-pointer">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-300 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">ระดับน้ำสูง</p>
                    <p className="text-xs opacity-90 truncate">บึงแก่นนคร - 85%</p>
                  </div>
                  <span className="text-xs opacity-75 whitespace-nowrap">5 นาที</span>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all cursor-pointer">
                <div className="flex items-start gap-2">
                  <Droplets className="h-4 w-4 text-cyan-300 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">ฝนตกหนัก</p>
                    <p className="text-xs opacity-90 truncate">เขตเทศบาลนครขอนแก่น</p>
                  </div>
                  <span className="text-xs opacity-75 whitespace-nowrap">15 นาที</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;