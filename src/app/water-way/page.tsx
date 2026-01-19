import React from "react";

const HecRasFinalCode = () => {
  return (
    <div className="p-6 bg-slate-50 min-h-screen flex flex-col items-center font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-[1100px] border border-slate-200">
        {/* <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          แผนผังโครงข่ายระบายน้ำ HEC-RAS (Complete Data & Updated UI)
        </h2> */}

        <svg viewBox="0 0 1000 850" className="w-full h-auto bg-white">
          <defs>
            {/* หัวลูกศรสีเขียว */}
            <marker
              id="greenArrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
            </marker>
          </defs>

          <style>
            {`
    .pipe-main {
      stroke: #0ea5e9;
      stroke-width: 24;
      fill: none;
      stroke-linejoin: round;
    }

    .pond-flat {
  fill: #dbeafe;
  stroke: #60a5fa;
  stroke-width: 2;
  opacity: 0.6;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
}


    .text-main {
      font-size: 16px;   /* จาก 22 → 16 */
      font-weight: bold;
      fill: #000;
    }

    .text-sub {
      font-size: 13px;   /* จาก 18 → 13 */
      fill: #334155;
      font-weight: 500;
    }

    .text-pipe {
      font-size: 12px;   /* จาก 16 → 12 */
      font-style: italic;
      fill: #1e40af;
      font-weight: bold;
    }

    .dashed-line {
      stroke: #64748b;
      stroke-width: 3;
      stroke-dasharray: 8, 6;
      fill: none;
    }

    .node-point {
      fill: #2563eb;
      stroke: white;
      stroke-width: 3;
    }
  `}
          </style>

          {/* --- ห้วยพระคือ (Outlet) --- */}
          <rect x="940" y="50" width="40" height="550" fill="#22d3ee" rx="5" />
          <text
            x="965"
            y="320"
            className="text-main"
            style={{ writingMode: "vertical-rl" }}
          >
            ห้วยพระคือ
          </text>

          {/* --- บ่อน้ำ (Ponds) --- */}
          <ellipse cx="840" cy="140" rx="80" ry="80" className="pond-flat" />
          <text x="805" y="110" className="text-[12px]">
            ไม่พบข้อมูล %
          </text>
          <text x="805" y="150" className="text-main">
            บึงทุ่งสร้าง
          </text>
          <text x="795" y="170" className="text-[10px]">
            ความจุ XX ล้าน ลบ.ม.
          </text>

          <defs>
            {/* clip สำหรับน้ำ 75% (อิงตำแหน่งบึงใหม่) */}
            <clipPath id="pond-water-75">
              <rect
                x="180" // cx - rx = 250 - 70
                y="615" // คำนวณใหม่
                width="140" // rx * 2
                height="105" // 75%
              />
            </clipPath>
          </defs>

          {/* น้ำ 75% */}
          <ellipse
            cx="250"
            cy="650"
            rx="70"
            ry="70"
            fill="#225fee"
            clipPath="url(#pond-water-75)"
          />

          {/* ขอบบ่อ */}
          <ellipse cx="250" cy="650" rx="70" ry="70" className="pond-flat" />

          {/* ข้อความ */}
          <text x="223" y="620" className="text-[12px] font-bold">
            ความจุ 78 %
          </text>
          <text x="203" y="650" className="text-main">
            บึงหนองโคตร
          </text>
          <text x="200" y="670" className="text-[10px]">
            ความจุ 2.58 ล้าน ลบ.ม.
          </text>

          <ellipse cx="783" cy="580" rx="60" ry="60" className="pond-flat" />
          <text x="748" y="555" className="text-[12px]">
            ไม่พบข้อมูล %
          </text>
          <text x="742" y="585" className="text-main">
            บึงแก่นนคร
          </text>
          <text x="742" y="600" className="text-[10px]">
            ความจุ XX ล้าน ลบ.ม.
          </text>

          {/* --- เส้นท่อระบายน้ำ (Blue 200%) & ลูกศรทิศทาง (Green) --- */}

          {/* สายที่ 1 & 2 (เหนือ) */}
          <path d="M 600 40 L 600 140" className="pipe-main" />
          <path
            d="M 600 70 L 600 110"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            markerEnd="url(#greenArrow)"
          >
            <animate
              attributeName="opacity"
              values="1;0.2;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>

          <path d="M 400 140 L 760 140" className="pipe-main" />
          <path
            d="M 450 140 L 650 140"
            stroke="#22c55e"
            strokeWidth="3"
            markerEnd="url(#greenArrow)"
          >
            <animate
              attributeName="opacity"
              values="1;0.2;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>

          {/* สายที่ 5 (มะลิวัลย์) */}
          <path d="M 50 300 L 480 300" className="pipe-main" />
          <path
            d="M 80 300 L 240 300"
            stroke="#22c55e"
            strokeWidth="3"
            markerEnd="url(#greenArrow)"
          >
            <animate
              attributeName="opacity"
              values="1;0.2;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M 450 300 L 280 300"
            stroke="#22c55e"
            strokeWidth="3"
            markerEnd="url(#greenArrow)"
          >
            <animate
              attributeName="opacity"
              values="1;0.2;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>

          {/* ท่อไทยพิพัฒน์ & บ้านคำไฮ */}
          <path d="M 210 310 L 210 560" className="pipe-main" />
          <path
            d="M 210 380 L 210 460"
            stroke="#22c55e"
            strokeWidth="3"
            markerEnd="url(#greenArrow)"
          >
            <animate
              attributeName="opacity"
              values="1;0.2;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>

          <path d="M 300 310 L 300 560" className="pipe-main" />
          <path
            d="M 300 380 L 300 460"
            stroke="#22c55e"
            strokeWidth="3"
            markerEnd="url(#greenArrow)"
          >
            <animate
              attributeName="opacity"
              values="1;0.2;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>

          {/* สายที่ 4 & ท่อหลัก */}
          <path d="M 300 480 L 840 480 L 840 220 " className="pipe-main" />

          <path
            d="M 650 480 L 750 480"
            stroke="#22c55e"
            strokeWidth="3"
            markerEnd="url(#greenArrow)"
          >
            <animate
              attributeName="opacity"
              values="1;0.2;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M 380 480 L 480 480"
            stroke="#22c55e"
            strokeWidth="3"
            markerEnd="url(#greenArrow)"
          >
            <animate
              attributeName="opacity"
              values="1;0.2;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M 840 450 L 840 280"
            stroke="#22c55e"
            strokeWidth="3"
            markerEnd="url(#greenArrow)"
          >
            <animate
              attributeName="opacity"
              values="1;0.2;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>

          {/* สายที่ 3 (ประชาสโมสร) */}
          <path d="M 640 380 L 640 480" className="pipe-main" />
          <path
            d="M 640 400 L 640 450"
            stroke="#22c55e"
            strokeWidth="3"
            markerEnd="url(#greenArrow)"
          >
            <animate
              attributeName="opacity"
              values="1;0.2;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>

          {/* สายที่ 6 & 7 (ใต้) */}
          <path d="M 380 750 L 380 550" className="pipe-main" />
          <path
            d="M 380 720 L 380 620"
            stroke="#22c55e"
            strokeWidth="3"
            markerEnd="url(#greenArrow)"
          >
            <animate
              attributeName="opacity"
              values="1;0.2;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>

          <path d="M 198 550 L 480 550 L 600 480" className="pipe-main" />
          <path
            d="M 520 525 L 580 490"
            stroke="#22c55e"
            strokeWidth="3"
            markerEnd="url(#greenArrow)"
          >
            <animate
              attributeName="opacity"
              values="1;0.2;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>

          <path d="M 250 780 L 620 780 L 620 480" className="pipe-main" />
          <path
            d="M 350 780 L 550 780"
            stroke="#22c55e"
            strokeWidth="3"
            markerEnd="url(#greenArrow)"
          >
            <animate
              attributeName="opacity"
              values="1;0.2;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>

          <path d="M 780 520 L 780 480" className="pipe-main" />

          <path d="M 318 653 L 370 653" className="pipe-main" />

          {/* จุดออกไปห้วยพระคือ (Red) */}
          <path d="M 922 140 L 940 140" stroke="#ef4444" strokeWidth="8" />

          {/* --- ข้อความและจุด Node --- */}
          <g>
            {[
              { x: 600, y: 40, n: 1 },
              { x: 400, y: 140, n: 2 },
              { x: 640, y: 380, n: 3 },
              { x: 480, y: 300, n: 4 },
              { x: 50, y: 300, n: 5 },
              { x: 380, y: 750, n: 6 },
              { x: 250, y: 780, n: 7 },
            ].map((node) => (
              <g key={node.n}>
                <circle cx={node.x} cy={node.y} r="9" className="node-point" />
                <text
                  x={node.x}
                  y={node.y}
                  fill="white"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {node.n}
                </text>
              </g>
            ))}

            {/* ชื่อสถานที่ */}
            <text x="450" y="45" className="text-sub text-right">
              มหาวิทยาลัยขอนแก่น
            </text>
            <text x="330" y="145" className="text-sub">
              กังสดาล
            </text>
            <text x="15" y="275" className="text-sub">
              บ้านสันติสุข
            </text>
            <text x="110" y="275" className="text-sub">
              บ้านแก่นพยอม
            </text>
            <text x="270" y="275" className="text-sub">
              สีฐาน
            </text>
            <text x="380" y="275" className="text-sub">
              บ้านสามเหลี่ยม
            </text>
            <text x="590" y="330" className="text-sub">
              บ้านไทยประเสริฐ
            </text>
            <text x="130" y="430" className="text-sub">
              บ้านหัวทุ่ง
            </text>
            <text x="325" y="430" className="text-sub">
              บ้านคำไฮ
            </text>
            <text x="450" y="430" className="text-sub">
              บ้านศรีฐาน
            </text>
            <text x="660" y="90" className="text-sub">
              หลังศูนย์ราชการ
            </text>
            <text x="810" y="40" className="text-sub">
              บ้านจอมพล
            </text>
            <text x="100" y="550" className="text-sub">
              บ้านโคกฟันโปง
            </text>
            <text x="460" y="660" className="text-sub">
              ลุ่มน้ำย่อย
            </text>
            <text x="330" y="810" className="text-sub">
              บ้านกังวาน
            </text>
            <text x="470" y="810" className="text-sub">
              บ้านสินไพลิน
            </text>
            <text x="760" y="680" className="text-sub">
              บ้านตูม
            </text>
            {/* <text x="880" y="350" className="text-main">เมืองขอนแก่น</text> */}

            {/* ชื่อท่อ */}
            <text
              x="625"
              y="10"
              className="text-pipe"
              style={{ writingMode: "vertical-rl" }}
            >
              ท่อระบายน้ำมิตรภาพ 2
            </text>
            <text x="410" y="120" className="text-pipe">
              ท่อระบายน้ำกังสดาลไปยังทุ่งสร้าง
            </text>
            <text x="80" y="340" className="text-pipe">
              ท่อระบายน้ำมะลิวัลย์
            </text>
            <text
              x="240"
              y="362"
              className="text-pipe"
              style={{ writingMode: "vertical-rl" }}
            >
              ท่อระบายน้ำไทยพิพัฒน์
            </text>
            <text
              x="271"
              y="365"
              className="text-pipe"
              style={{ writingMode: "vertical-rl" }}
            >
              ท่อระบายน้ำบ้านคำไฮ
            </text>
            <text x="350" y="510" className="text-pipe">
              ท่อระบายน้ำศรีจันทร์
            </text>
            <text
              x="670"
              y="340"
              className="text-pipe"
              style={{ writingMode: "vertical-rl" }}
            >
              ท่อระบายน้ำประชาสโมสร
            </text>
            <text x="420" y="575" className="text-pipe">
              คลองระบายน้ำบึงหนองโคตร
            </text>
            <text
              x="405"
              y="600"
              className="text-pipe"
              style={{ writingMode: "vertical-rl" }}
            >
              ท่อระบายน้ำหนองโคตร
            </text>
            <text x="440" y="760" className="text-pipe">
              ท่อระบายน้ำบ้านกอก
            </text>
            <text
              x="650"
              y="650"
              className="text-pipe"
              style={{ writingMode: "vertical-rl" }}
            >
              ท่อระบายน้ำมิตรภาพ 1
            </text>
            <text
              x="710"
              y="460"
              className="text-pipe"
              style={{ fontSize: "12px" }}
            >
              ท่อระบายน้ำหลัก
            </text>
          </g>

          {/* เส้นประสถาปัตยกรรม (ความสัมพันธ์) */}
          {/* <g className="dashed-line">
            <line x1="680" y1="140" x2="680" y2="105" />
            <line x1="850" y1="100" x2="850" y2="75" />
            <line x1="180" y1="520" x2="140" y2="520" />
            <line x1="780" y1="720" x2="780" y2="750" />
            <line x1="480" y1="410" x2="480" y2="365" />
          </g> */}
        </svg>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs font-bold">
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 bg-[#0ea5e9] rounded-sm"></div> ท่อระบายน้ำ
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-[#22c55e] relative">
              <div className="absolute -right-1 -top-[2px] border-l-4 border-l-[#22c55e] border-y-[3px] border-y-transparent"></div>
            </div>{" "}
            ทิศทางการไหล
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-600 border border-white"></div>{" "}
            จุดเริ่มต้น 
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 border border-blue-800 opacity-80 rounded-full"></div>{" "}
            แหล่งน้ำ/บึง
          </div>
        </div>
      </div>
    </div>
  );
};

export default HecRasFinalCode;
