// ----------------------------
// WaterLevelCard Component
// ----------------------------
interface WaterLevelCardProps {
  percent: number;
  title: string;
  subtitle: string;
  location: string;
  date: string;
}

const WaterLevelCard = ({ percent, title, subtitle, location, date }: WaterLevelCardProps) => {
  return (
    <div className="w-full h-full bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center">
      
      {/* ไอคอนและเปอร์เซ็นต์ */}
      <div className="flex items-center gap-2 mb-3">
        {/* ไอคอนหยดน้ำ */}
        <div className="relative">
          <svg width="30" height="40" viewBox="0 0 40 50" className="text-gray-400">
            <path 
              d="M20 0 L0 30 Q0 50 20 50 Q40 50 40 30 Z" 
              fill="currentColor"
            />
          </svg>
        </div>
        
        {/* ไอคอนคลื่น */}
        <svg width="30" height="25" viewBox="0 0 40 30" className="text-blue-500">
          <path 
            d="M0 15 Q5 10 10 15 Q15 20 20 15 Q25 10 30 15 Q35 20 40 15" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3"
          />
          <path 
            d="M0 22 Q5 17 10 22 Q15 27 20 22 Q25 17 30 22 Q35 27 40 22" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3"
          />
        </svg>
        
        {/* เปอร์เซ็นต์ */}
        <span className="text-3xl font-bold text-blue-600">{percent}%</span>
      </div>

      {/* ข้อความ */}
      <div className="text-center">
        <p className="text-xs text-gray-700 mb-1">{title}</p>
        <p className="text-lg font-bold text-blue-600 leading-tight">{subtitle}</p>
        <p className="text-lg font-bold text-blue-600 mb-2 leading-tight">{location}</p>
        <p className="text-[10px] text-gray-500">{date}</p>
      </div>

    </div>
  );
};

// ----------------------------
// Main Component
// ----------------------------
export default function WaterLevelCards() {
  const cards = [
    {
      percent: 71,
      title: "ปริมาณน้ำ",
      subtitle: "บึงหนอง",
      location: "โคตร",
      date: "ล่าสุด 2025-11-04"
    },
    {
      percent: 71,
      title: "ปริมาณน้ำ",
      subtitle: "บึงแก่น",
      location: "นคร",
      date: "ล่าสุด 2025-11-04"
    },
    {
      percent: 71,
      title: "ปริมาณน้ำ",
      subtitle: "บึงทุ่ง",
      location: "สร้าง",
      date: "ล่าสุด 2025-11-04"
    }
  ];

  return (
    <div className="w-full h-d bg-gray-100 p-4">
      <div className="w-full h-[30%] bg-black/20 flex flex-row gap-4 p-4">
        
        {/* ส่วนซ้าย - 3 การ์ด */}
        <div className="w-1/2 flex flex-row gap-3">
          {cards.map((card, index) => (
            <div key={index} className="w-4/12">
              <WaterLevelCard {...card} />
            </div>
          ))}
        </div>

        {/* ส่วนขวา - 2 ช่อง */}
        <div className="w-1/2 flex flex-row gap-3">
          <div className="w-1/2 bg-white rounded-lg shadow-md flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-600">2.1</span>
          </div>
          <div className="w-1/2 bg-white rounded-lg shadow-md flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-600">2.2</span>
          </div>
        </div>

      </div>
    </div>
  );
}