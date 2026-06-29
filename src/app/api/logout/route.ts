import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });

  res.cookies.set("auth", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
