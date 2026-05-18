// app/api/rain-summary/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // เรียก API ภายนอก
    const response = await fetch("http://10.198.110.39:9001/rain/max-summary");
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch data: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // return data กลับไปยัง client
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
