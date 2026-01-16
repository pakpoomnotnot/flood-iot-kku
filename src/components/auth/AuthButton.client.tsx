"use client";

import Link from "next/link";

export default function AuthButtonClient({
  brandGradient,
  isLoggedIn,
}: {
  brandGradient: string;
  isLoggedIn: boolean;
}) {
  if (isLoggedIn) {
    return (
      <form action="/api/logout" method="post">
        <button
          className={`ml-2 px-6 py-2.5 ${brandGradient} text-white text-sm font-semibold rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
        >
          ออกจากระบบ
        </button>
      </form>
    );
  }

  return (
    <Link
      href="/login"
      className={`ml-2 px-6 py-2.5 ${brandGradient} text-white text-sm font-semibold rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
    >
      เข้าสู่ระบบ
    </Link>
  );
}
