import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Fail closed: without configured credentials nobody can log in.
  if (!adminUsername || !adminPassword) {
    return NextResponse.json(
      { message: "Login is not configured" },
      { status: 503 }
    );
  }

  const { username, password } = await req.json();

  if (username !== adminUsername || password !== adminPassword) {
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
