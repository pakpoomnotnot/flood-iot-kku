import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (username !== "admin" || password !== "12345678") {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ message: "Login success" });

  res.cookies.set("auth", "true", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
