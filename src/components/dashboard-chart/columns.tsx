// components/water-table/columns.ts
import { ColumnDef } from "@tanstack/react-table";

interface WaterLevel {
  station: string;
  location: string;
  basin: string;
  level: number;
  bankLevel: number;
  status: string;
  diff: number;
  time: string;
}

export const columns: ColumnDef<WaterLevel>[] = [
  {
    accessorKey: "station",
    header: "สถานี",
  },
  {
    accessorKey: "location",
    header: "ที่ตั้ง",
  },
  {
    accessorKey: "basin",
    header: "ลุ่มน้ำ/คลอง",
  },
  {
    accessorKey: "level",
    header: "ระดับน้ำ (ม.รทก.)",
  },
  {
    accessorKey: "bankLevel",
    header: "ระดับตลิ่ง (ม.รทก.)",
  },

  // 🎨 เงื่อนไขสีของสถานะทั้งหมด
  {
    accessorKey: "status",
    header: "สถานการณ์น้ำ",
    cell: ({ row }) => {
      const status = row.original.status;

      const color =
        status === "น้ำท่วม"
          ? "bg-red-700 text-white"
        : status === "สูง"
          ? "bg-red-500 text-white"
        : status === "กลาง"
          ? "bg-yellow-400 text-black"
        : status === "ต่ำ"
          ? "bg-blue-400 text-white"
        : status === "ปกติ"
          ? "bg-green-500 text-white"
        : status === "น้ำมาก"
          ? "bg-blue-600 text-white"
        : status === "น้ำปกติ"
          ? "bg-green-600 text-white"
        : status === "น้ำน้อย"
          ? "bg-yellow-500 text-black"
        : "bg-gray-300 text-black"; // fallback

      return (
        <span className={`px-2 py-1 rounded-md text-sm font-medium ${color}`}>
          {status}
        </span>
      );
    },
  },

  {
    accessorKey: "diff",
    header: "ต่ำกว่าตลิ่ง (ม.)",
  },
  {
    accessorKey: "time",
    header: "เวลา",
  },
];
