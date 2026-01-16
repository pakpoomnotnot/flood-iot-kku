"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthButton({ brandGradient }: { brandGradient: string }) {
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // เช็ค cookie แบบง่าย
    setIsLogin(document.cookie.includes("auth=admin"));
  }, []);

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  if (isLogin) {
    return (
      <button
        onClick={logout}
        className={`ml-2 px-6 py-2.5 ${brandGradient} text-white text-sm font-semibold rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
      >
        สำหรับเจ้าหน้าที่
      </button>
    );
  }

  return (
    <button
        onClick={logout}
        className={`ml-2 px-6 py-2.5 ${brandGradient} text-white text-sm font-semibold rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
      >
        สำหรับเจ้าหน้าที่
      </button>
  );
}
