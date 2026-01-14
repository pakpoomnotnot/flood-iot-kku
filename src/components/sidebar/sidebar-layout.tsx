"use client";
import React, { FC, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import {
  LayoutDashboard,
  AlertTriangle,
  MapPin,
  Droplets,
  ChevronDown,
  Activity,
  TrendingUp,
  Waves,
  Cloud,
  Wifi,
  WifiOff,
  Thermometer,
  Wind,
  Sun,
  Battery,
  Radio,
  Navigation,
  Clock,
} from "lucide-react";
import WaterLevelChart from "../charts/water-level-chart";
import StationDetails from "./station-details";
import { useStation } from "@/contexts/station-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  width: number;
}

// ข้อมูลสถิติหลักจากระบบ KKC-UFM
const summaryStats = [
  {
    id: 1,
    label: "สถานีทั้งหมด",
    value: "29",
    subValue: "(ฝน 8, บึง 5, ท่อ 7, ถนน 9)",
    icon: MapPin,
    color: "from-blue-500 to-blue-600",
    iconColor: "text-blue-400",
    trend: "100%",
    trendLabel: "ติดตั้งครบ",
  },
  {
    id: 2,
    label: "แจ้งเตือนวิกฤต",
    value: "3",
    subValue: "ระดับน้ำสูง",
    icon: AlertTriangle,
    color: "from-red-500 to-red-600",
    iconColor: "text-red-400",
    trend: "สูง",
    trendLabel: "ระดับความเสี่ยง",
  },
  {
    id: 3,
    label: "ออนไลน์",
    value: "27/29",
    subValue: "Telemetry Active",
    icon: Wifi,
    color: "from-green-500 to-green-600",
    iconColor: "text-green-400",
    trend: "93%",
    trendLabel: "พร้อมใช้งาน",
  },
  {
    id: 4,
    label: "ปริมาณฝนวันนี้",
    value: "43.4",
    subValue: "มม.",
    icon: Cloud,
    color: "from-cyan-500 to-cyan-600",
    iconColor: "text-cyan-400",
    trend: "+12 มม.",
    trendLabel: "ในชั่วโมงที่ผ่านมา",
  },
];

// ข้อมูลระดับน้ำตามประเภทสถานี
const waterLevelByType = [
  {
    type: "บึงแก่นนคร",
    level: 85,
    max: 100,
    status: "critical",
    color: "#EF4444",
  },
  {
    type: "บึงทุ่งสร้าง",
    level: 72,
    max: 100,
    status: "warning",
    color: "#F59E0B",
  },
  {
    type: "บึงหนองโคตร",
    level: 68,
    max: 100,
    status: "warning",
    color: "#F59E0B",
  },
  {
    type: "ประตูน้ำ 5",
    level: 52,
    max: 100,
    status: "normal",
    color: "#10B981",
  },
  {
    type: "ท่อระบาย A1",
    level: 45,
    max: 100,
    status: "normal",
    color: "#10B981",
  },
];

// ข้อมูลสถานะสถานีทั้งหมด
const stationStatusData = [
  { name: "ปกติ", value: 24, color: "#10B981" },
  { name: "เฝ้าระวัง", value: 3, color: "#F59E0B" },
  { name: "วิกฤต", value: 2, color: "#EF4444" },
];

// ข้อมูลแนวโน้มฝนและน้ำ 7 วัน (จำลอง)
const weatherTrendData = [
  { day: "จ.", rain: 15.2, water: 35, temp: 26.4 },
  { day: "อ.", rain: 28.5, water: 42, temp: 27.1 },
  { day: "พ.", rain: 12.3, water: 38, temp: 26.8 },
  { day: "พฤ.", rain: 35.7, water: 45, temp: 25.9 },
  { day: "ศ.", rain: 43.4, water: 52, temp: 26.2 },
  { day: "ส.", rain: 22.1, water: 48, temp: 27.5 },
  { day: "อา.", rain: 18.6, water: 45, temp: 26.9 },
];

// ข้อมูลประเภทสถานีตาม TOR
const stationTypeData = [
  {
    type: "สถานีฝน",
    count: 8,
    color: "#8B5CF6",
    icon: "🌧️",
    description: "ตรวจวัดปริมาณฝน",
  },
  {
    type: "สถานีบึง",
    count: 5,
    color: "#10B981",
    icon: "🌊",
    description: "ระดับน้ำในบึง",
  },
  {
    type: "สถานีท่อระบาย",
    count: 7,
    color: "#3B82F6",
    icon: "💧",
    description: "ท่อระบายน้ำ",
  },
  {
    type: "สถานีถนน",
    count: 9,
    color: "#EF4444",
    icon: "⚠️",
    description: "น้ำท่วมถนน",
  },
];

// ข้อมูลสถานีสำหรับตาราง (จำลอง)
const stationTableData = [
  {
    station: "บ้านท่านางเลื่อน",
    location: "ต.ชนบท อ.ชนบท",
    river: "ลุ่มน้ำชี",
    level: "161.34",
    bank: "162.1",
    situation: "น้ำมาก",
    trend: "ต่ำกว่าตลิ่ง (ม.) 0.76",
    time: "22:00 น.",
  },
  {
    station: "ชนบท",
    location: "ต.ชนบท อ.ชนบท",
    river: "ลุ่มน้ำชี",
    level: "160.79",
    bank: "161.58",
    situation: "น้ำมาก",
    trend: "ต่ำกว่าตลิ่ง (ม.) 0.79",
    time: "23:00 น.",
  },
  {
    station: "สะพานข้ามสาน้ำเชิญ",
    location: "ต.หนองเรือ อ.หนองเรือ",
    river: "ลุ่มน้ำชี",
    level: "181.85",
    bank: "182.86",
    situation: "น้ำมาก",
    trend: "ต่ำกว่าตลิ่ง (ม.) 1.01",
    time: "23:00 น.",
  },
  {
    station: "เมืองขอนแก่น",
    location: "ต.ท่าพระ อ.เมืองขอนแก่น",
    river: "ลุ่มน้ำชี",
    level: "150.43",
    bank: "153.04",
    situation: "น้ำมาก",
    trend: "ต่ำกว่าตลิ่ง (ม.) 2.61",
    time: "23:00 น.",
  },
  {
    station: "สาเชิญ อ.ชุมแพ",
    location: "ต.ชุมแพ อ.ชุมแพ",
    river: "ลุ่มน้ำชี",
    level: "218.97",
    bank: "221.17",
    situation: "น้ำมาก",
    trend: "ต่ำกว่าตลิ่ง (ม.) 2.20",
    time: "22:00 น.",
  },
  {
    station: "บ้านกุดกว้าง",
    location: "ต.ท่าพระ อ.เมืองขอนแก่น",
    river: "ลุ่มน้ำชี",
    level: "149.58",
    bank: "152.3",
    situation: "น้ำมาก",
    trend: "ต่ำกว่าตลิ่ง (ม.) 2.72",
    time: "22:00 น.",
  },
  {
    station: "แม่น้ำชีบ้านหินกอง",
    location: "ต.บ้านโต้น อ.พระยืน",
    river: "ลุ่มน้ำชี",
    level: "151.44",
    bank: "155.24",
    situation: "น้ำปกติ",
    trend: "ต่ำกว่าตลิ่ง (ม.) 3.80",
    time: "22:00 น.",
  },
];

// ข้อมูล Telemetry แบบเรียลไทม์ (จำลองจาก MQTT)
const telemetryData = {
  station01: {
    time: "09:35:00",
    date: "October 27 2025",
    rain: {
      value: 0,
      total: 43.4,
      daily: 0,
    },
    water: {
      level: 68,
      flow: 0,
      total: 0,
    },
    wind: {
      speed: 0.3,
      direction: 0,
      directionName: "E",
    },
    weather: {
      airTemp: 26.4,
      airHumid: 80.9,
      light: 36318,
    },
    battery: {
      voltage: 13.29,
      current: 240.5,
    },
    system: {
      temp: 32.6,
      humid: 66.2,
      onTime: 9188,
      updateTime: 15,
      rssi: -79,
    },
  },
};

// --- Sub-Components ---
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  color: string;
  iconColor: string;
  trend: string;
  trendLabel: string;
}

const StatCard: FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  iconColor,
  trend,
  trendLabel,
}) => (
  <div className="group relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-200">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${color} shadow-lg`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="text-right">
        <span className="text-xs text-gray-500 font-medium">{trendLabel}</span>
        <p className="text-xs font-semibold text-blue-600">{trend}</p>
      </div>
    </div>
    <div>
      <p className="text-xs text-gray-600 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        {value}
      </p>
      {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
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
  description: string;
}

const StationTypeCard: FC<StationTypeCardProps> = ({
  type,
  count,
  color,
  icon,
  description,
}) => (
  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all duration-200 group">
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform"
        style={{ backgroundColor: `${color}15` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700">{type}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-xl font-bold" style={{ color }}>
        {count}
      </p>
      <p className="text-xs text-gray-400">สถานี</p>
    </div>
  </div>
);

// Water Level Progress Bar
interface WaterLevelBarProps {
  type: string;
  level: number;
  max: number;
  status: "normal" | "warning" | "critical";
  color: string;
}

const WaterLevelBar: FC<WaterLevelBarProps> = ({
  type,
  level,
  max,
  status,
  color,
}) => {
  const percentage = (level / max) * 100;

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-gray-700">{type}</span>
        <span className="text-xs font-bold" style={{ color }}>
          {level}%
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-gray-400">
          {status === "critical"
            ? "🔴 วิกฤต"
            : status === "warning"
            ? "🟡 เฝ้าระวัง"
            : "🟢 ปกติ"}
        </span>
        <span className="text-xs text-gray-400">Max: {max}%</span>
      </div>
    </div>
  );
};

// Telemetry Info Card
const TelemetryInfoCard: FC = () => {
  const data = telemetryData.station01;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center">
          <Radio className="h-4 w-4 mr-2 text-blue-600" />
          Telemetry Station 01
        </h3>
        <div className="flex items-center gap-1 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 font-semibold">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* อุณหภูมิอากาศ */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-50 rounded-lg p-3 border border-orange-100">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-gray-600 font-medium">อุณหภูมิ</span>
          </div>
          <p className="text-lg font-bold text-orange-600">
            {data.weather.airTemp}°C
          </p>
        </div>

        {/* ความชืน */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-gray-600 font-medium">ความชื้น</span>
          </div>
          <p className="text-lg font-bold text-blue-600">
            {data.weather.airHumid}%
          </p>
        </div>

        {/* ความเร็วลม */}
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-50 rounded-lg p-3 border border-cyan-100">
          <div className="flex items-center gap-2 mb-1">
            <Wind className="h-4 w-4 text-cyan-500" />
            <span className="text-xs text-gray-600 font-medium">ลม</span>
          </div>
          <p className="text-lg font-bold text-cyan-600">
            {data.wind.speed} m/s
          </p>
          <p className="text-xs text-gray-500">{data.wind.directionName}</p>
        </div>

        {/* แบตเตอรี่ */}
        <div className="bg-gradient-to-br from-green-50 to-green-50 rounded-lg p-3 border border-green-100">
          <div className="flex items-center gap-2 mb-1">
            <Battery className="h-4 w-4 text-green-500" />
            <span className="text-xs text-gray-600 font-medium">แบตเตอรี่</span>
          </div>
          <p className="text-lg font-bold text-green-600">
            {data.battery.voltage}V
          </p>
          <p className="text-xs text-gray-500">{data.battery.current} mA</p>
        </div>
      </div>

      {/* สัญญาณ WiFi */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-blue-600" />
          <span className="text-xs text-gray-600">RSSI Signal</span>
        </div>
        <span className="text-xs font-bold text-blue-600">
          {data.system.rssi} dBm
        </span>
      </div>

      {/* เวลาอัพเดท */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-xs text-gray-600">Update Every</span>
        </div>
        <span className="text-xs font-bold text-gray-600">
          {data.system.updateTime} min
        </span>
      </div>
    </div>
  );
};

// --- Main Sidebar Component ---
const DashboardSidebar: FC<SidebarProps> = ({ width }) => {
  const [timeRange, setTimeRange] = useState("24h");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <aside
      className="bg-gradient-to-b from-gray-50 to-white text-gray-800 h-screen flex flex-col overflow-hidden border-r border-gray-200"
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
                <a
                  href="/"
                  className="text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent"
                >
                  KKC-UFM
                </a>
                <p className="text-xs text-gray-500">Urban Flood Management</p>
              </div>
            </div>
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white border border-gray-200 text-sm rounded-lg py-2 pl-3 pr-9 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 transition-colors cursor-pointer"
              >
                <option value="1h">1 ชม.</option>
                <option value="24h">24 ชม.</option>
                <option value="7d">7 วัน</option>
                <option value="30d">30 วัน</option>
              </select>
              <ChevronDown className="h-4 w-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>
          </div>

          {/* === Selected Station Details === */}
          <StationDetails />

          {/* === Current Time === */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90 mb-1">เวลาปัจจุบัน</p>
                <p className="text-2xl font-bold">
                  {currentTime.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {currentTime.toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Clock className="h-12 w-12 opacity-20" />
            </div>
          </div>

          {/* === Summary Stats Grid === */}
          <div className="grid grid-cols-2 gap-3">
            {summaryStats.map((stat) => (
              <StatCard
                key={stat.id}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                subValue={stat.subValue}
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
                ประเภทสถานีตรวจวัด
              </h3>
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-semibold">
                {stationTypeData.reduce((sum, item) => sum + item.count, 0)}{" "}
                สถานี
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
                  description={item.description}
                />
              ))}
            </div>
          </div>

          {/* === Water Level Status === */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
              <Waves className="h-4 w-4 mr-2 text-blue-600" />
              ระดับน้ำ 5 อันดับสูงสุด
            </h3>
            <div>
              {waterLevelByType.map((item, idx) => (
                <WaterLevelBar
                  key={idx}
                  type={item.type}
                  level={item.level}
                  max={item.max}
                  status={item.status as "normal" | "warning" | "critical"}
                  color={item.color}
                />
              ))}
            </div>
          </div>

          {/* === Telemetry Information === */}
          <TelemetryInfoCard />

          {/* === Weather & Water Trend Chart === */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
              แนวโน้มฝน-น้ำ 7 วัน
            </h3>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <AreaChart
                  data={weatherTrendData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                      backgroundColor: "white",
                      borderColor: "#e5e7eb",
                      borderRadius: "0.75rem",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                    formatter={(value, name) => {
                      if (typeof value !== "number") return ["", ""];

                      return name === "rain"
                        ? [`${value} มม.`, "ฝน"]
                        : name === "water"
                        ? [`${value}%`, "ระดับน้ำ"]
                        : [value, name];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rain"
                    stroke="#8B5CF6"
                    fillOpacity={1}
                    fill="url(#colorRain)"
                  />
                  <Area
                    type="monotone"
                    dataKey="water"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorWater)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <span className="text-xs text-gray-600">ปริมาณฝน (มม.)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-xs text-gray-600">ระดับน้ำ (%)</span>
              </div>
            </div>
          </div>

          {/* === Temperature Trend === */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
              <Thermometer className="h-4 w-4 mr-2 text-orange-600" />
              อุณหภูมิ 7 วัน
            </h3>
            <div style={{ width: "100%", height: 150 }}>
              <ResponsiveContainer>
                <LineChart
                  data={weatherTrendData}
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
                    domain={[24, 28]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderColor: "#e5e7eb",
                      borderRadius: "0.75rem",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e5e7eb",
                    }}
                    formatter={(value) =>
                      value == null
                        ? ["", "อุณหภูมิ"]
                        : [`${value}°C`, "อุณหภูมิ"]
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#F97316"
                    strokeWidth={3}
                    dot={{ fill: "#F97316", r: 4 }}
                    activeDot={{ r: 6, fill: "#EA580C" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* === Status Pie Chart === */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-blue-600" />
              สถานะสถานีโดยรวม
            </h3>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stationStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stationStatusData.map((entry, index) => (
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
                      backgroundColor: "white",
                      borderColor: "#e5e7eb",
                      borderRadius: "0.75rem",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e5e7eb",
                    }}
                    formatter={(value) =>
                      value == null ? ["", ""] : [`${value} สถานี`, ""]
                    }
                  />
                  <Legend
                    iconSize={10}
                    iconType="circle"
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* === Station Data Table === */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                ระดับน้ำ
              </h3>
              <span className="text-xs text-gray-500">ปริมาณน้ำ</span>
            </div>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-[10px] font-bold text-gray-700 h-8 py-1">
                      สถานี
                    </TableHead>
                    <TableHead className="text-[10px] font-bold text-gray-700 h-8 py-1">
                      ที่ตั้ง
                    </TableHead>
                    <TableHead className="text-[10px] font-bold text-gray-700 h-8 py-1">
                      แม่น้ำ/คลอง
                    </TableHead>
                    <TableHead className="text-[10px] font-bold text-gray-700 h-8 py-1">
                      ระดับน้ำ (ม.รทก.)
                    </TableHead>
                    <TableHead className="text-[10px] font-bold text-gray-700 h-8 py-1">
                      ระดับตลิ่ง (ม.รทก.)
                    </TableHead>
                    <TableHead className="text-[10px] font-bold text-gray-700 h-8 py-1">
                      สถานการณ์น้ำ
                    </TableHead>
                    <TableHead className="text-[10px] font-bold text-gray-700 h-8 py-1">
                      แนวโน้ม
                    </TableHead>
                    <TableHead className="text-[10px] font-bold text-gray-700 h-8 py-1">
                      เวลา
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stationTableData.map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-gray-50">
                      <TableCell className="text-[10px] py-2 font-medium text-gray-900">
                        {row.station}
                      </TableCell>
                      <TableCell className="text-[10px] py-2 text-gray-600">
                        {row.location}
                      </TableCell>
                      <TableCell className="text-[10px] py-2 text-gray-600">
                        {row.river}
                      </TableCell>
                      <TableCell className="text-[10px] py-2 text-gray-900 font-semibold">
                        {row.level}
                      </TableCell>
                      <TableCell className="text-[10px] py-2 text-gray-600">
                        {row.bank}
                      </TableCell>
                      <TableCell className="text-[10px] py-2">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            row.situation === "น้ำมาก"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {row.situation}
                        </span>
                      </TableCell>
                      <TableCell className="text-[10px] py-2 text-gray-600">
                        {row.trend}
                      </TableCell>
                      <TableCell className="text-[10px] py-2 text-gray-500">
                        {row.time}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* === Latest Alerts === */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-4 text-white">
            <h3 className="text-sm font-bold mb-3 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              การแจ้งเตือนล่าสุด
            </h3>
            <div className="space-y-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all cursor-pointer">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-300 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">ระดับน้ำวิกฤต</p>
                    <p className="text-xs opacity-90 truncate">
                      บึงแก่นนคร - 85% (เกินเกณฑ์)
                    </p>
                  </div>
                  <span className="text-xs opacity-75 whitespace-nowrap">
                    5 นาที
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all cursor-pointer">
                <div className="flex items-start gap-2">
                  <Droplets className="h-4 w-4 text-cyan-300 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">ฝนตกหนัก</p>
                    <p className="text-xs opacity-90 truncate">
                      43.4 มม. - สถานีฝน S01
                    </p>
                  </div>
                  <span className="text-xs opacity-75 whitespace-nowrap">
                    15 นาที
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all cursor-pointer">
                <div className="flex items-start gap-2">
                  <WifiOff className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">สถานีออฟไลน์</p>
                    <p className="text-xs opacity-90 truncate">
                      ท่อระบาย T04 - ขาดการติดต่อ
                    </p>
                  </div>
                  <span className="text-xs opacity-75 whitespace-nowrap">
                    1 ชม.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* === System Info === */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">
              ข้อมูลระบบ
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">เวอร์ชัน</span>
                <span className="font-semibold text-gray-800">
                  KKC-UFM v2.12
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">อัพเดทล่าสุด</span>
                <span className="font-semibold text-gray-800">
                  {currentTime.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">รอบการอัพเดท</span>
                <span className="font-semibold text-gray-800">ทุก 10 นาที</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">โปรโตคอล</span>
                <span className="font-semibold text-gray-800">
                  MQTT, HTTP/HTTPS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
