import { fromArrayBuffer } from "geotiff";
import proj4 from "proj4";
import { depthToRgba } from "@/lib/flood-depth-colors";

proj4.defs(
  "EPSG:32648",
  "+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs",
);

export type LngLat = [number, number];
export type ImageCoordinates = [LngLat, LngLat, LngLat, LngLat];

export interface FloodImageOverlay {
  dataUrl: string;
  coordinates: ImageCoordinates;
  bounds: { west: number; south: number; east: number; north: number };
}

function utmToLngLat(x: number, y: number): LngLat {
  const [lng, lat] = proj4("EPSG:32648", "EPSG:4326", [x, y]);
  return [lng, lat];
}

function utmBboxToImageCoordinates(bbox: [number, number, number, number]): ImageCoordinates {
  const [minX, minY, maxX, maxY] = bbox;
  const topLeft = utmToLngLat(minX, maxY);
  const topRight = utmToLngLat(maxX, maxY);
  const bottomRight = utmToLngLat(maxX, minY);
  const bottomLeft = utmToLngLat(minX, minY);
  return [topLeft, topRight, bottomRight, bottomLeft];
}

/** แปลง GeoTIFF (UTM EPSG:32648) เป็น PNG data URL สำหรับ MapLibre image source */
export async function geotiffToImageOverlay(
  arrayBuffer: ArrayBuffer,
): Promise<FloodImageOverlay> {
  const tiff = await fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();
  const width = image.getWidth();
  const height = image.getHeight();
  const raster = await image.readRasters({ interleave: false });
  const values = raster[0] as ArrayLike<number>;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const imgData = ctx.createImageData(width, height);
  for (let i = 0; i < width * height; i++) {
    const [r, g, b, a] = depthToRgba(Number(values[i]));
    const o = i * 4;
    imgData.data[o] = r;
    imgData.data[o + 1] = g;
    imgData.data[o + 2] = b;
    imgData.data[o + 3] = a;
  }
  ctx.putImageData(imgData, 0, 0);

  const bbox = image.getBoundingBox() as [number, number, number, number];
  const coordinates = utmBboxToImageCoordinates(bbox);
  const [tl, tr, br, bl] = coordinates;

  return {
    dataUrl: canvas.toDataURL("image/png"),
    coordinates,
    bounds: {
      west: Math.min(tl[0], bl[0]),
      south: Math.min(bl[1], br[1]),
      east: Math.max(tr[0], br[0]),
      north: Math.max(tl[1], tr[1]),
    },
  };
}
