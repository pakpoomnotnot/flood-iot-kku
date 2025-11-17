"use client";
import React from 'react';
import { X } from 'lucide-react';
import { PredictionChart, generatePredictionData } from '@/components/charts/prediction-chart';
import { Button } from '@/components/ui/button';

interface Station {
  id: string;
  name: string;
  location: { latitude: number; longitude: number; area: string };
}

interface PredictionModalProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PredictionModal: React.FC<PredictionModalProps> = ({ 
  station, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen || !station) return null;

  // Generate prediction data for the station
  const predictionData = generatePredictionData(station.id, 48);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">กราฟการคาดการณ์</h2>
            <p className="text-sm text-gray-500 mt-1">{station.location.area}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <PredictionChart
            stationName={station.name}
            stationId={station.id}
            data={predictionData}
            unit="ซม."
            height={450}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            ปิด
          </Button>
          <Button onClick={onClose}>
            ตกลง
          </Button>
        </div>
      </div>
    </div>
  );
};

