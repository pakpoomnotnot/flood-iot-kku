import MapView from "@/sections/map-view/map-view";
import React from "react";
import { cookies } from "next/headers";

const page = async () => {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("auth")?.value === "true";

  return (
    <div>
      <MapView isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default page;
