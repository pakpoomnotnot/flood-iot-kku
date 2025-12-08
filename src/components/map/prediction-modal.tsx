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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-5xl sm:mx-4 max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between z-10 shrink-0">
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              กราฟการคาดการณ์
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">
              {station.name} - {station.location.area}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 sm:h-8 sm:w-8 shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 sm:p-6">
            <div className="w-full overflow-x-auto">
              <PredictionChart
                stationName={station.name}
                stationId={station.id}
                data={predictionData}
                unit="ซม."
                height={280}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-end gap-2 sm:gap-3 shrink-0">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="text-sm px-4 h-9 sm:h-10 flex-1 sm:flex-initial"
          >
            ปิด
          </Button>
          <Button 
            onClick={onClose}
            className="text-sm px-4 h-9 sm:h-10 flex-1 sm:flex-initial"
          >
            ตกลง
          </Button>
        </div>
      </div>
    </div>
  );
};