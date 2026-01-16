import AuthButtonClient from "./AuthButton.client";
import { cookies } from "next/headers";

export default async function AuthButtonServer({
  brandGradient,
}: {
  brandGradient: string;
}) {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("auth");

  return (
    <AuthButtonClient
      brandGradient={brandGradient}
      isLoggedIn={isLoggedIn}
    />
  );
}
