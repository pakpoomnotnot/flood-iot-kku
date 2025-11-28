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
    <aside className="w-56 bg-white/95 border-r border-[#ead0c7] h-full flex flex-col">
      <nav className="flex-1 py-3">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all",
                    isActive
                      ? "bg-[#a73824]/10 text-[#a73824] shadow-sm"
                      : "text-[#4c3b37] hover:bg-[#f8efec] hover:text-[#a73824]"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isActive ? "text-[#a73824]" : "text-[#b38a80]"
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

