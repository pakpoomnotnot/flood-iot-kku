import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'

    // เรียก API จาก localhost:8080
    const response = await fetch(
      `http://localhost:8080/api/weather?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // ไม่ cache เพื่อให้ได้ข้อมูลล่าสุด
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'ไม่สามารถดึงข้อมูลได้' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ API' },
      { status: 500 }
    )
  }
}