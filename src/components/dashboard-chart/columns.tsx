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
  {
    accessorKey: "status",
    header: "สถานการณ์น้ำ",
    cell: ({ row }) => {
      const status = row.original.status;

      const color =
        status === "น้ำมาก"
          ? "bg-blue-500"
          : status === "น้ำปกติ"
          ? "bg-green-500"
          : "bg-red-500";

      return (
        <span
          className={`text-white px-3 py-1 rounded-md text-sm ${color}`}
        >
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
