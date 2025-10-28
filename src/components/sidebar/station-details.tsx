"use client";
import React from 'react';
import { 
  MapPin, 
  Droplets, 
  Thermometer, 
  CloudRain, 
  Wind, 
  Activity, 
  Battery, 
  Wifi, 
  WifiOff,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { useStation } from '@/contexts/station-context';

interface StationDetailsProps {
  onClose?: () => void;
}

const StationDetails: React.FC<StationDetailsProps> = ({ onClose }) => {
  const { selectedStationData, clearSelectedStation } = useStation();

  if (!selectedStationData) return null;

  const { station, sensorReadings, lastUpdated, isOnline, batteryLevel, signalStrength } = selectedStationData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-amber-600 bg-amber-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getSensorIcon = (sensorType: string) => {
    switch (sensorType) {
      case 'waterLevel':
      case 'floodLevel':
        return <Droplets className="h-4 w-4" />;
      case 'temperature':
        return <Thermometer className="h-4 w-4" />;
      case 'rainfall':
        return <CloudRain className="h-4 w-4" />;
      case 'windSpeed':
      case 'windDirection':
        return <Wind className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getLatestReading = (sensorType: string) => {
    const readings = sensorReadings[sensorType];
    if (!readings || readings.length === 0) return null;
    return readings[readings.length - 1];
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClose = () => {
    clearSelectedStation();
    if (onClose) onClose();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-800">{station?.name}</h3>
            {onClose && (
              <button
                onClick={handleClose}
                className="ml-auto p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2">{station?.location.area}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
              {station?.id}
            </span>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isOnline ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
            }`}>
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
            </div>
          </div>
        </div>
      </div>

      {/* Station Status */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <Battery className="h-4 w-4 text-gray-600 mx-auto mb-1" />
          <p className="text-xs text-gray-500">แบตเตอรี่</p>
          <p className="text-sm font-bold text-gray-700">{batteryLevel}%</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <Activity className="h-4 w-4 text-gray-600 mx-auto mb-1" />
          <p className="text-xs text-gray-500">สัญญาณ</p>
          <p className="text-sm font-bold text-gray-700">{signalStrength}%</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <Clock className="h-4 w-4 text-gray-600 mx-auto mb-1" />
          <p className="text-xs text-gray-500">อัพเดท</p>
          <p className="text-sm font-bold text-gray-700">{formatTime(lastUpdated)}</p>
        </div>
      </div>

      {/* Sensor Readings */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Activity className="h-4 w-4" />
          ข้อมูลเซนเซอร์ล่าสุด
        </h4>
        
        {station?.sensors.map((sensor, index) => {
          const latestReading = getLatestReading(sensor.type);
          if (!latestReading) return null;

          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-gray-600">
                  {getSensorIcon(sensor.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{sensor.name}</p>
                  <p className="text-xs text-gray-500">{sensor.unit}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {latestReading.value} {latestReading.unit}
                </p>
                <div className={`flex items-center gap-1 ${getStatusColor(latestReading.status)} px-2 py-1 rounded-full text-xs font-medium`}>
                  {getStatusIcon(latestReading.status)}
                  {latestReading.status === 'critical' ? 'วิกฤต' : 
                   latestReading.status === 'warning' ? 'เฝ้าระวัง' : 'ปกติ'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
            ดูรายละเอียด
          </button>
          <button className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors">
            ประวัติข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationDetails;
