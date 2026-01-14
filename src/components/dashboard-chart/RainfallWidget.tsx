import React, { useEffect, useState, useMemo } from 'react';
import { BsCloudRainFill } from 'react-icons/bs';

// Types for API response
interface StationData {
  [key: string]: number;
}

interface RainData {
  file: string;
  datetime: string;
  datetime_ts: number;
  stations: StationData;
}

interface ApiResponse {
  status: string;
  total: number;
  limit: number;
  offset: number;
  returned: number;
  data: RainData[];
}

interface RainfallItem {
  name: string;
  value: string;
  rawValue: number;
}

const RainfallWidget = () => {
  const [rainData, setRainData] = useState<RainData | null>(null);
  console.log("raindata", rainData)
  const [isLoading, setIsLoading] = useState(true);

  // Station name mapping - memoized
  const stationNames = useMemo((): Record<string, string> => ({
    "SNK_HOSP": "โรงพยาบาลศรีนครินทร์",
    "KKC_MUN": "เทศบาลนครขอนแก่น",
    "BKN": "บึงแก่นนคร",
    "BTS": "บึงทุ่งสร้าง",
    "NLP": "หนองเล็งเปีย",
    "BNK": "บึงหนองโคตร",
    "SIL_MUN": "เทศบาลเมืองศิลา",
    "UNE_MC": "ศูนย์อุตุฯ ภาคตะวันออกเฉียงเหนือตอนบน",
    "MKO_MUN": "เทศบาลเมืองเก่า",
    "NEU": "มหาวิทยาลัยภาคตะวันออกเฉียงเหนือ",
    "UNE_SH": "บ้านพักพนักงานอุตุฯ",
    "KKC_SP": "อุทยานวิทยาศาสตร์ มข.",
    "BSV": "หมู่บ้านสีวลี",
    "RMUTI": "มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน",
    "KKC_BL": "โรงเรียนสอนคนตาบอด"
  }), []);

  // Calculate top 3 rainfall stations - memoized
  const topRainfall = useMemo((): RainfallItem[] => {
    if (!rainData) {
      return [];
    }

    const stations = rainData.stations;
    const rainfallArray: RainfallItem[] = [];

    Object.entries(stations).forEach(([station, value]) => {
      // Clean station name (remove \r if exists)
      const cleanStation = station.replace(/\r/g, "");
      const stationName = stationNames[cleanStation] || cleanStation;
      
      rainfallArray.push({
        name: stationName,
        value: value.toFixed(1),
        rawValue: value
      });
    });

    // Sort by rainfall amount (descending) and take top 3
    return rainfallArray
      .sort((a, b) => b.rawValue - a.rawValue)
      .slice(0, 3);
  }, [rainData, stationNames]);

  // Check if there's any rain
  const hasRain = useMemo(() => {
    return topRainfall.length > 0 && topRainfall[0].rawValue > 0;
  }, [topRainfall]);

  // Fetch data from API
  useEffect(() => {
    const fetchRainData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/rain");
        const data = await response.json();

        if (data.max_1h && data.max_1h.length > 0) {
          // แปลง array จาก API ให้เป็นรูปแบบ RainData
          const stations: StationData = {};
          data.max_1h.forEach((item: any) => {
            // ใช้ station_name เป็น key เลย
            stations[item.station_name] = item.value;
          });

          setRainData({
            file: "",
            datetime: "",
            datetime_ts: Date.now(),
            stations: stations
          });
        } else {
          setRainData(null);
        }
      } catch (error) {
        console.error("Error fetching rain data:", error);
        setRainData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRainData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchRainData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-full h-auto items-center justify-center rounded-lg border border-none p-0.5 lg:p-1 bg-white">
      <div className="flex flex-col w-full text-xs">
        
        {/* ส่วนหัว: ไอคอนและข้อความ */}
        <div className="flex flex-row items-start mb-0.5 pt-0.5 lg:mb-1 lg:pt-1"> 
          <BsCloudRainFill 
            className="w-4 h-4 lg:w-7 lg:h-7 mr-1 lg:mr-2"
          />
          <div className="flex flex-col text-[0.6rem] lg:text-sm font-semibold text-black leading-tight">
            <div className="whitespace-nowrap">ฝนสะสม 1 ชม. ที่ผ่านมา</div>
          </div>
        </div>
        
        <hr className="border-t border-[#f0f0f0] my-0.5 lg:my-1" />
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="text-gray-500 text-[0.55rem] lg:text-xs">
              กำลังโหลดข้อมูล...
            </div>
          </div>
        )}

        {/* No rain message */}
        {!isLoading && !hasRain && (
          <div className="flex items-center justify-center py-4">
            <div className="text-gray-600 text-[0.55rem] lg:text-xs font-medium">
              ยังไม่มีฝนตกขณะนี้
            </div>
          </div>
        )}

        {/* ข้อมูลปริมาณฝน - Top 3 */}
        {!isLoading && hasRain && topRainfall.map((item, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-row items-center justify-between py-0 lg:py-0.5"> 
              <div className="text-black font-medium text-[0.55rem] lg:text-xs">
                {item.name}
              </div>
              <div className="bg-[#e0f2fe] text-[#0369a1] text-[0.5rem] lg:text-[0.65rem] font-bold px-1 lg:px-1.5 py-[0.5px] lg:py-[1px] rounded-md">
                {item.value} มม.
              </div>
            </div>
            {/* Divider ระหว่างรายการ ยกเว้นรายการสุดท้าย */}
            {index < topRainfall.length - 1 && (
              <hr className="border-t border-[#f0f0f0] my-0.5 lg:my-1" />
            )}
          </React.Fragment>
        ))}
        
      </div>
    </div>
  );
};

export default RainfallWidget;