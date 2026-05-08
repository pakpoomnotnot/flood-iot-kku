"use client";

import React, { useEffect, useState } from "react";

// ─── Types ───────────────────────────────────────
interface LakeApiItem {
  lake_id: string;
  status: "ok" | "error" | "no_data";
  water_level?: number;
  water_volume_m3?: number;
  water_area_m2?: number;
  capacity_pct?: number;
  date_time?: string;
}
interface LakesApiResponse {
  fetched_at: string;
  count: number;
  lakes: LakeApiItem[];
}

function fmtPct(p?: number): string {
  if (p == null) return "ไม่พบข้อมูล %";
  return `${p.toFixed(1)} %`;
}
function fmtVol(v?: number): string {
  if (v == null) return "ความจุ XX ล้าน ลบ.ม.";
  if (v >= 1_000_000) return `ความจุ ${(v / 1_000_000).toFixed(3)} ล้าน ลบ.ม.`;
  if (v >= 1_000) return `ความจุ ${(v / 1_000).toFixed(1)} พัน ลบ.ม.`;
  return `ความจุ ${v.toFixed(2)} ลบ.ม.`;
}

// ─── Water fill clip ──────────────────────────────
function waterClipRect(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  pct: number,
) {
  const fillH = (ry * 2 * Math.min(Math.max(pct, 0), 100)) / 100;
  return { x: cx - rx, y: cy + ry - fillH, width: rx * 2, height: fillH };
}

const HecRasFinalCode = () => {
  const [lakes, setLakes] = useState<LakeApiItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/lake");
        if (!res.ok) return;
        const json: LakesApiResponse = await res.json();
        setLakes(json.lakes);
      } catch {}
    };
    fetchData();
    const id = setInterval(fetchData, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const getLake = (id: string) => lakes.find((l) => l.lake_id === id);

  // ── helper สร้าง water fill + ข้อความสำหรับบึง ──
  const pondData = (lakeId: string) => {
    const d = getLake(lakeId);
    const pct = d?.status === "ok" ? (d.capacity_pct ?? 0) : 0;
    const vol = d?.status === "ok" ? d.water_volume_m3 : undefined;
    return { pct, vol };
  };

  // ── บึงทุ่งสร้าง (cx=840, cy=140, rx=80, ry=80) ──
  const tungsang = pondData("Lake_02");
  const tungsangClip = waterClipRect(840, 140, 80, 80, tungsang.pct);

  // ── บึงหนองโคตร (cx=250, cy=650, rx=70, ry=70) ──
  const nongkhot = pondData("Lake_05");
  const nongkhotClip = waterClipRect(250, 650, 70, 70, nongkhot.pct);

  // ── บึงแก่นนคร (cx=783, cy=580, rx=60, ry=60) ──
  const kaennakhon = pondData("Lake_03");
  const kaennakhonClip = waterClipRect(783, 580, 60, 60, kaennakhon.pct);

  // ── หนองเลิงเปือย (cx=950, cy=300, rx=49, ry=49) ──
  const loengpueai = pondData("Lake_06");
  const loengpueaiClip = waterClipRect(950, 300, 49, 49, loengpueai.pct);

  return (
    <div className="p-0 bg-slate-50 min-h-screen flex flex-col items-center font-sans">
      <div className="bg-white p-0 rounded-xl shadow-lg w-full max-w-[1100px] border border-slate-200">
        <svg viewBox="0 0 1000 850" className="w-full h-auto bg-white">
          <defs>
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

            {/* clip น้ำแต่ละบึง */}
            <clipPath id="clip-tungsang">
              <rect
                x={tungsangClip.x}
                y={tungsangClip.y}
                width={tungsangClip.width}
                height={tungsangClip.height}
              />
            </clipPath>
            <clipPath id="clip-nongkhot">
              <rect
                x={nongkhotClip.x}
                y={nongkhotClip.y}
                width={nongkhotClip.width}
                height={nongkhotClip.height}
              />
            </clipPath>
            <clipPath id="clip-kaennakhon">
              <rect
                x={kaennakhonClip.x}
                y={kaennakhonClip.y}
                width={kaennakhonClip.width}
                height={kaennakhonClip.height}
              />
            </clipPath>
            <clipPath id="clip-loengpueai">
              <rect
                x={loengpueaiClip.x}
                y={loengpueaiClip.y}
                width={loengpueaiClip.width}
                height={loengpueaiClip.height}
              />
            </clipPath>

            {/* clip น้ำ 75% เดิม (ใช้กับ nongkhot เดิม ไม่ใช้แล้ว) */}
            <clipPath id="pond-water-75">
              <rect x="180" y="615" width="140" height="105" />
            </clipPath>
          </defs>

          <style>{`
            .pipe-main { stroke: #0ea5e9; stroke-width: 24; fill: none; stroke-linejoin: round; }
            .pond-flat { fill: #dbeafe; stroke: #60a5fa; stroke-width: 2; opacity: 0.6; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15)); }
            .text-main { font-size: 16px; font-weight: bold; fill: #000; }
            .text-sub { font-size: 13px; fill: #334155; font-weight: 500; }
            .text-pipe { font-size: 12px; font-style: italic; fill: #1e40af; font-weight: bold; }
            .dashed-line { stroke: #64748b; stroke-width: 3; stroke-dasharray: 8, 6; fill: none; }
            .node-point { fill: #2563eb; stroke: white; stroke-width: 3; }
            .node-place { fill: #c41411; stroke: white; stroke-width: 2; }
          `}</style>

          {/* ══════════════════════════════
              หนองเลิงเปือย
          ══════════════════════════════ */}
          {/* น้ำ */}
          <ellipse
            cx="950"
            cy="300"
            rx="49"
            ry="49"
            fill="#225fee"
            clipPath="url(#clip-loengpueai)"
            opacity="0.7"
          />
          {/* ขอบ */}
          <ellipse cx="950" cy="300" rx="49" ry="49" className="pond-flat" />
          <text x="935" y="280" className="text-[12px]">
            {fmtPct(getLake("Lake_06")?.capacity_pct)}
          </text>
          <text x="904" y="300" className="text-main">
            หนองเลิงเปือย
          </text>
          <text x="905" y="315" className="text-[10px]">
            {fmtVol(getLake("Lake_06")?.water_volume_m3)}
          </text>

          {/* ══════════════════════════════
              ห้วยพระคือ (Outlet) — UI เดิม
          ══════════════════════════════ */}
          <rect x="865" y="550" width="40" height="250" fill="#22d3ee" rx="5" />
          <text
            x="885"
            y="630"
            className="text-main"
            style={{ writingMode: "vertical-rl" }}
          >
            ห้วยพระคือ
          </text>

          {/* ══════════════════════════════
              บึงทุ่งสร้าง
          ══════════════════════════════ */}
          {/* น้ำ */}
          <ellipse
            cx="840"
            cy="140"
            rx="80"
            ry="80"
            fill="#225fee"
            clipPath="url(#clip-tungsang)"
            opacity="0.7"
          />
          {/* ขอบ */}
          <ellipse cx="840" cy="140" rx="80" ry="80" className="pond-flat" />
          <text x="820" y="125" className="text-[12px]">
            {fmtPct(getLake("Lake_02")?.capacity_pct)}
          </text>
          <text x="805" y="145" className="text-main">
            บึงทุ่งสร้าง
          </text>
          <text x="795" y="160" className="text-[10px]">
            {fmtVol(getLake("Lake_02")?.water_volume_m3)}
          </text>

          {/* ══════════════════════════════
              บึงหนองโคตร
          ══════════════════════════════ */}
          {/* น้ำ */}
          <ellipse
            cx="250"
            cy="650"
            rx="70"
            ry="70"
            fill="#225fee"
            clipPath="url(#clip-nongkhot)"
            opacity="0.7"
          />
          {/* ขอบ */}
          <ellipse cx="250" cy="650" rx="70" ry="70" className="pond-flat" />
          <text x="234" y="630" className="text-[12px]">
            {fmtPct(getLake("Lake_05")?.capacity_pct)}
          </text>
          <text x="204" y="650" className="text-main">
            บึงหนองโคตร
          </text>
          <text x="200" y="670" className="text-[10px]">
            {fmtVol(getLake("Lake_05")?.water_volume_m3)}
          </text>

          {/* ══════════════════════════════
              บึงแก่นนคร
          ══════════════════════════════ */}
          {/* น้ำ */}
          <ellipse
            cx="783"
            cy="580"
            rx="60"
            ry="60"
            fill="#225fee"
            clipPath="url(#clip-kaennakhon)"
            opacity="0.7"
          />
          {/* ขอบ */}
          <ellipse cx="783" cy="580" rx="60" ry="60" className="pond-flat" />
          <text x="765" y="560" className="text-[12px]">
            {fmtPct(getLake("Lake_03")?.capacity_pct)}
          </text>
          <text x="745" y="580" className="text-main">
            บึงแก่นนคร
          </text>
          <text x="735" y="600" className="text-[10px]">
            {fmtVol(getLake("Lake_03")?.water_volume_m3)}
          </text>

          {/* ══════════════════════════════
              ท่อระบายน้ำ & ลูกศร — UI เดิมทั้งหมด
          ══════════════════════════════ */}
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

          <path d="M 920 140 L 950 140" className="pipe-main" />
          <path d="M 950 128 L 950 242" className="pipe-main" />
          <path d="M 880 230 L 950 230" className="pipe-main" />
          <path d="M 885 218 L 885 490" className="pipe-main" />

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

          <path d="M 210 310 L 210 589" className="pipe-main" />
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

          <path d="M 300 310 L 300 590" className="pipe-main" />
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

          <path d="M 300 480 L 840 480 L 840 220" className="pipe-main" />
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
          <path
            d="M 950 180 L 950 220"
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

          <path d="M 700 400 L 830 400" className="pipe-main" />
          <path
            d="M 730 400 L 800 400"
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

          <path d="M 885 490 L 885 550" stroke="#ef4444" strokeWidth="8" />

          {/* Node points */}
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

            {/* ชื่อสถานที่ — เดิมทั้งหมด */}
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

            {/* ชื่อท่อ — เดิมทั้งหมด */}
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
            <text
              x="700"
              y="380"
              className="text-pipe"
              style={{ fontSize: "12px" }}
            >
              ท่อระบายน้ำข้างเซนทรัล
            </text>
          </g>

          {/* สถานที่สำคัญ — เดิม */}
          <circle cx="505" cy="59" r="6" className="node-place" />
          <circle cx="685" cy="505" r="6" className="node-place" />
          <text x="640" y="530" className="text-sub text-right">
            ศูนย์การค้าเซ็นทรัล
          </text>
          <circle cx="580" cy="450" r="6" className="node-place" />
          <text x="550" y="432" className="text-sub text-right">
            ตึก TRUE
          </text>
          <circle cx="580" cy="680" r="6" className="node-place" />
          <text x="558" y="662" className="text-sub text-right">
            Makro
          </text>
        </svg>

        {/* Legend — เดิม */}
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
            <div className="w-4 h-4 rounded-full bg-[#c41411] border border-white"></div>{" "}
            สถาที่สำคัญ
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
