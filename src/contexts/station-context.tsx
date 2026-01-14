"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Station location data - ข้อมูลพิกัดสถานี
const STATION_LOCATIONS = {
  SNK_HOSP: { name: "โรงพยาบาลศรีนครินทร์", lat: 16.466, lon: 102.831 },
  KKC_MUN: { name: "เทศบาลนครขอนแก่น", lat: 16.429, lon: 102.829 },
  BKN: { name: "บึงแก่นนคร", lat: 16.419, lon: 102.836 },
  BTS: { name: "บึงทุ่งสร้าง", lat: 16.452, lon: 102.855 },
  NLP: { name: "หนองเลิงเปือย", lat: 16.43, lon: 102.877 },
  BNK: { name: "บึงหนองโคตร", lat: 16.429, lon: 102.805 },
  SIL_MUN: { name: "เทศบาลเมืองศิลา", lat: 16.473, lon: 102.849 },
  UNE_MC: { name: "ศูนย์อุตุนิยมวิทยาภาคตะวันออกเฉียงเหนือตอนบน", lat: 16.463, lon: 102.786 },
  MKO_MUN: { name: "เทศบาลเมืองเก่า", lat: 16.402, lon: 102.788 },
  NEU: { name: "มหาวิทยาลัยภาคตะวันออกเฉียงเหนือ", lat: 16.422, lon: 102.814 },
  UNE_SH: { name: "บ้านพักพนักงานอุตุฯ", lat: 16.446, lon: 102.832 },
  KKC_SP: { name: "อุทยานวิทยาศาสตร์ มหาวิทยาลัยขอนแก่น", lat: 16.456, lon: 102.819 },
  BSV: { name: "หมู่บ้านสีวลี", lat: 16.436, lon: 102.785 },
  RMUTI: { name: "มหาวิทยาลัยราชมงคลอีสาน วิทยาเขตขอนแก่น", lat: 16.434, lon: 102.861 },
  KKC_BL: { name: "โรงเรียนสอนคนตาบอด", lat: 16.442, lon: 102.808 },
};

// Station data interface
interface Station {
  id: string;
  no: number;
  name: string;
  location: { 
    latitude: number; 
    longitude: number; 
    area: string 
  };
  sensors: Array<{
    type: string;
    name: string;
    range: string;
    unit: string;
    frequency: string;
  }>;
}

// Station type configuration
interface StationTypeConfig {
  label: string;
  color: string;
  icon: string;
}

// Mock sensor data interface
interface SensorReading {
  timestamp: string; // forecast_datetime
  value: number; // rainfall_mm or water level
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  leadHour?: number; // lead_hour from model run time
  modelRunTime?: string; // model_run_time
}

interface StationData {
  station: Station | null;
  sensorReadings: {
    [sensorType: string]: SensorReading[];
  };
  lastUpdated: string;
  isOnline: boolean;
  batteryLevel: number;
  signalStrength: number;
}

// Context interface
interface StationContextType {
  selectedStationData: StationData | null;
  setSelectedStationData: (data: StationData | null) => void;
  clearSelectedStation: () => void;
  getStationTypeConfig: (stationType: string) => StationTypeConfig;
  getAllStations: () => Station[];
  getStationsByType: (type: string) => Station[];
  getStationCounts: () => { [key: string]: number; total: number };
  getStationLocation: (stationKey: string) => { name: string; lat: number; lon: number } | null;
}

// Station type configurations
const STATION_TYPE_CONFIGS: { [key: string]: StationTypeConfig } = {
  waterLevelPipe: {
    label: "ท่อระบายน้ำ",
    color: "blue",
    icon: "droplets"
  },
  waterLevelRoad: {
    label: "ระดับน้ำบนถนน",
    color: "red",
    icon: "shieldAlert"
  },
  pondWaterLevel: {
    label: "บึง/หนองน้ำ",
    color: "green",
    icon: "waves"
  },
  rainfallMeasurement: {
    label: "ปริมาณฝน",
    color: "purple",
    icon: "cloudRain"
  }
};

// Generate stations from location data
const generateStationsData = (): Station[] => {
  const stations: Station[] = [];
  let counter = 1;

  // สร้างสถานีจากข้อมูลพิกัด
  Object.entries(STATION_LOCATIONS).forEach(([key, location]) => {
    // กำหนดประเภทสถานีตาม key
    let stationType = 'rainfallMeasurement';
    let sensors = [
      {
        type: 'rainfall',
        name: 'เซนเซอร์วัดปริมาณฝน',
        range: '0-500 mm',
        unit: 'mm',
        frequency: '5 นาที'
      }
    ];

    // ปรับ type และ sensors ตามชื่อสถานี
    if (location.name.includes('บึง') || location.name.includes('หนอง')) {
      stationType = 'pondWaterLevel';
      sensors = [
        {
          type: 'waterLevel',
          name: 'เซนเซอร์วัดระดับน้ำ',
          range: '0-500 cm',
          unit: 'cm',
          frequency: '15 นาที'
        },
        {
          type: 'temperature',
          name: 'เซนเซอร์วัดอุณหภูมิ',
          range: '0-50 °C',
          unit: '°C',
          frequency: '15 นาที'
        }
      ];
    }

    stations.push({
      id: key,
      no: counter++,
      name: location.name,
      location: {
        latitude: location.lat,
        longitude: location.lon,
        area: 'เมืองขอนแก่น, จ.ขอนแก่น'
      },
      sensors
    });
  });

  return stations;
};

// Create context
const StationContext = createContext<StationContextType | undefined>(undefined);

// Provider component
export const StationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedStationData, setSelectedStationData] = useState<StationData | null>(null);
  const stations = generateStationsData();

  const clearSelectedStation = () => {
    setSelectedStationData(null);
  };

  const getStationTypeConfig = (stationType: string): StationTypeConfig => {
    return STATION_TYPE_CONFIGS[stationType] || {
      label: "อื่นๆ",
      color: "gray",
      icon: "tag"
    };
  };

  const getAllStations = (): Station[] => {
    return stations;
  };

  const getStationsByType = (type: string): Station[] => {
    return stations.filter(station => {
      // ตรวจสอบจาก sensors ว่าเป็นประเภทไหน
      const hasSensorType = station.sensors.some(sensor => {
        if (type === 'pondWaterLevel' && sensor.type === 'waterLevel') return true;
        if (type === 'rainfallMeasurement' && sensor.type === 'rainfall') return true;
        return false;
      });
      return hasSensorType;
    });
  };

  const getStationCounts = () => {
    const counts: { [key: string]: number; total: number } = { total: stations.length };
    
    counts.pondWaterLevel = stations.filter(s => 
      s.sensors.some(sensor => sensor.type === 'waterLevel')
    ).length;
    
    counts.rainfallMeasurement = stations.filter(s => 
      s.sensors.some(sensor => sensor.type === 'rainfall')
    ).length;

    return counts;
  };

  const getStationLocation = (stationKey: string) => {
    return STATION_LOCATIONS[stationKey as keyof typeof STATION_LOCATIONS] || null;
  };

  return (
    <StationContext.Provider value={{
      selectedStationData,
      setSelectedStationData,
      clearSelectedStation,
      getStationTypeConfig,
      getAllStations,
      getStationsByType,
      getStationCounts,
      getStationLocation
    }}>
      {children}
    </StationContext.Provider>
  );
};

// Hook to use the context
export const useStation = () => {
  const context = useContext(StationContext);
  if (context === undefined) {
    throw new Error('useStation must be used within a StationProvider');
  }
  return context;
};

// Helper to get station type from station
export const getStationTypeFromStation = (station: Station): string => {
  if (station.sensors.some(s => s.type === 'waterLevel')) {
    return 'pondWaterLevel';
  }
  if (station.sensors.some(s => s.type === 'rainfall')) {
    return 'rainfallMeasurement';
  }
  return 'unknown';
};

// Helper to get station by ID
export const getStationById = (stationId: string): Station | null => {
  const stations = generateStationsData();
  return stations.find(s => s.id === stationId) || null;
};

// Mock data generator
export const generateMockStationData = (station: Station): StationData => {
  const modelRunTime = new Date(); // Current time as model run time
  const sensorReadings: { [sensorType: string]: SensorReading[] } = {};

  // Generate mock data for each sensor
  station.sensors.forEach(sensor => {
    const readings: SensorReading[] = [];
    const baseValue = getBaseValueForSensor(sensor.type);
    
    // Generate 500 hours of forecast data (hourly) - matching API response
    for (let i = 0; i < 500; i++) {
      const forecastTime = new Date(modelRunTime.getTime() + i * 60 * 60 * 1000); // Each hour forward
      const leadHour = i; // Hours from model run time
      
      // Add some variation to the data
      const variation = (Math.random() - 0.5) * 20; // ±10% variation
      const value = Math.max(0, baseValue + variation);
      
      readings.push({
        timestamp: forecastTime.toISOString(), // forecast_datetime
        value: Math.round(value * 10) / 10, // rainfall_mm or water level
        unit: sensor.unit,
        status: getStatusFromValue(sensor.type, value),
        leadHour: leadHour, // lead_hour
        modelRunTime: modelRunTime.toISOString() // model_run_time
      });
    }
    
    sensorReadings[sensor.type] = readings;
  });

  return {
    station,
    sensorReadings,
    lastUpdated: modelRunTime.toISOString(),
    isOnline: Math.random() > 0.1, // 90% chance of being online
    batteryLevel: Math.floor(Math.random() * 40) + 60, // 60-100%
    signalStrength: Math.floor(Math.random() * 30) + 70 // 70-100%
  };
};

// Helper functions
const getBaseValueForSensor = (sensorType: string): number => {
  switch (sensorType) {
    case 'waterLevel':
      return 25; // cm
    case 'floodLevel':
      return 15; // cm
    case 'rainfall':
      return Math.random() * 5; // mm
    case 'temperature':
      return 28; // °C
    case 'humidity':
      return 75; // %
    case 'windSpeed':
      return 5; // m/s
    case 'flowSpeed':
      return 2; // m/s
    default:
      return 50;
  }
};

const getStatusFromValue = (sensorType: string, value: number): 'normal' | 'warning' | 'critical' => {
  switch (sensorType) {
    case 'waterLevel':
    case 'floodLevel':
      if (value >= 80) return 'critical';
      if (value >= 50) return 'warning';
      return 'normal';
    case 'rainfall':
      if (value >= 20) return 'critical';
      if (value >= 10) return 'warning';
      return 'normal';
    case 'temperature':
      if (value >= 40 || value <= 10) return 'critical';
      if (value >= 35 || value <= 15) return 'warning';
      return 'normal';
    default:
      return 'normal';
  }
};