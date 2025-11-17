"use client";
import React from 'react';
import { 
  LayoutDashboard, 
  CloudRain, 
  Waves, 
  Gauge, 
  Navigation, 
  BarChart3 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'ภาพรวม', icon: LayoutDashboard },
  { id: 'rainfall', label: 'ข้อมูลฝน', icon: CloudRain },
  { id: 'ponds', label: 'หนอง/บึง', icon: Waves },
  { id: 'drainage', label: 'ท่อระบาย', icon: Gauge },
  { id: 'roads', label: 'ผิวถนน', icon: Navigation },
  { id: 'analysis', label: 'ผลวิเคราะห์ด้วยแบบจำลอง', icon: BarChart3 },
];

interface DashboardNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const DashboardNav: React.FC<DashboardNavProps> = ({ 
  activeView, 
  onViewChange 
}) => {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 h-full flex flex-col">
      <nav className="flex-1 py-2">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-xs font-medium transition-all",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isActive ? "text-blue-600" : "text-gray-500"
                  )} />
                  <span className="text-left leading-tight">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

