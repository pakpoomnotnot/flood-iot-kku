"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

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

// Mock sensor data interface
interface SensorReading {
  timestamp: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
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
}

// Create context
const StationContext = createContext<StationContextType | undefined>(undefined);

// Provider component
export const StationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedStationData, setSelectedStationData] = useState<StationData | null>(null);

  const clearSelectedStation = () => {
    setSelectedStationData(null);
  };

  return (
    <StationContext.Provider value={{
      selectedStationData,
      setSelectedStationData,
      clearSelectedStation
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

// Mock data generator
export const generateMockStationData = (station: Station): StationData => {
  const now = new Date();
  const sensorReadings: { [sensorType: string]: SensorReading[] } = {};

  // Generate mock data for each sensor
  station.sensors.forEach(sensor => {
    const readings: SensorReading[] = [];
    const baseValue = getBaseValueForSensor(sensor.type);
    
    // Generate 24 hours of data (every 15 minutes)
    for (let i = 0; i < 96; i++) {
      const timestamp = new Date(now.getTime() - (95 - i) * 15 * 60 * 1000);
      const variation = (Math.random() - 0.5) * 20; // ±10% variation
      const value = Math.max(0, baseValue + variation);
      
      readings.push({
        timestamp: timestamp.toISOString(),
        value: Math.round(value * 10) / 10,
        unit: sensor.unit,
        status: getStatusFromValue(sensor.type, value)
      });
    }
    
    sensorReadings[sensor.type] = readings;
  });

  return {
    station,
    sensorReadings,
    lastUpdated: now.toISOString(),
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
