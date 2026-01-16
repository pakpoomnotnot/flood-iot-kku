"use client";
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CloudRain, 
  Waves, 
  Gauge, 
  Navigation, 
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'ภาพรวม', icon: LayoutDashboard },
  { id: 'rainfall', label: 'ปริมาณน้ำฝน', icon: CloudRain },
  { id: 'ponds', label: 'ระดับน้ำในบึง', icon: Waves },
  { id: 'drainage', label: 'ระบบตรวจวัดระดับน้ำในทางระบายน้ำ', icon: Gauge },
  { id: 'roads', label: 'ระบบตรวจวัดน้ำท่วมถนน', icon: Navigation },
  // { id: 'analysis', label: 'ผลวิเคราะห์ด้วยแบบจำลอง', icon: BarChart3 },
  { id: 'mapflood', label: 'พื้นที่เสี่ยงน้ำท่วม', icon: Waves },
  { id: 'alertanoncement', label: 'แนวทางป้องกันภัยน้ำท่วม', icon: Gauge },
];

interface DashboardNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const DashboardNavAdmin: React.FC<DashboardNavProps> = ({ 
  activeView, 
  onViewChange 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
    setIsMobileMenuOpen(false); // ปิดเมนูหลังเลือก (mobile)
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#a73824] text-white shadow-lg transition-all hover:bg-[#8c2d1a] lg:hidden"
        aria-label="เปิดเมนู"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar + Mobile Slide-in Menu */}
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-[#ead0c7] bg-white/95 transition-transform duration-300 lg:relative lg:w-56 lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-[#ead0c7] p-4 lg:hidden">
          <h2 className="text-lg font-bold text-[#2c120c]">เมนู</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded-full p-1 hover:bg-[#f8efec]"
          >
            <X className="h-5 w-5 text-[#4c3b37]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all lg:text-xs",
                      isActive
                        ? "bg-[#a73824]/10 text-[#a73824] shadow-sm"
                        : "text-[#4c3b37] hover:bg-[#f8efec] hover:text-[#a73824]"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0 lg:h-4 lg:w-4",
                      isActive ? "text-[#a73824]" : "text-[#b38a80]"
                    )} />
                    <span className="text-left leading-tight">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile Footer Info */}
        <div className="border-t border-[#ead0c7] p-4 lg:hidden">
          <div className="text-xs text-[#6f4a41]">
            <p className="font-semibold">ระบบเตือนภัยน้ำท่วม</p>
            <p className="mt-1">เมืองขอนแก่น</p>
          </div>
        </div>
      </aside>

      {/* Bottom Navigation Bar (Alternative Mobile Layout) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 hidden border-t border-[#ead0c7] bg-white/95 backdrop-blur-sm sm:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all",
                  isActive
                    ? "text-[#a73824]"
                    : "text-[#8c6a61] hover:text-[#a73824]"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-[#a73824]" : "text-[#b38a80]"
                )} />
                <span className="text-[9px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};