import { NextRequest, NextResponse } from "next/server";
import { FLOOD_MAP_BASE_URL } from "@/lib/flood-map-catalog";

/** Proxy COG GeoTIFF พร้อมรองรับ HTTP Range (จำเป็นสำหรับ COG protocol) */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  if (!path || path.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const targetUrl = `${FLOOD_MAP_BASE_URL}/${path}`;
  const range = req.headers.get("range");

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        Accept: "image/tiff,*/*",
        ...(range ? { Range: range } : {}),
      },
      signal: AbortSignal.timeout(60_000),
    });

    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json(
        { error: `Upstream ${upstream.status}`, url: targetUrl },
        { status: upstream.status },
      );
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      upstream.headers.get("content-type") ?? "image/tiff",
    );
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Headers", "Range");
    headers.set("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges, Content-Length");
    headers.set("Accept-Ranges", upstream.headers.get("accept-ranges") ?? "bytes");

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    const contentRange = upstream.headers.get("content-range");
    if (contentRange) headers.set("Content-Range", contentRange);

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proxy failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range",
      "Access-Control-Max-Age": "86400",
    },
  });
}
