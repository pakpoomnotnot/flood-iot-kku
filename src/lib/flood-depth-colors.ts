/** สีตาม legend ระดับน้ำท่วม (ม.) */
const DEPTH_STOPS: [number, [number, number, number]][] = [
  [0.0,  [0x81, 0xd4, 0xfa]],
  [0.11, [0xd0, 0xf8, 0xce]],
  [0.23, [0x7c, 0xb3, 0x42]],
  [0.34, [0xfd, 0xd8, 0x35]],
  [0.46, [0xf5, 0x7f, 0x17]],
  [0.57, [0x8d, 0x6e, 0x63]],
  [0.69, [0xbf, 0x36, 0x0c]],
];

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

export function depthToRgba(depthM: number): [number, number, number, number] {
  if (!Number.isFinite(depthM) || depthM <= 0.001) {
    return [0, 0, 0, 0];
  }

  for (let i = DEPTH_STOPS.length - 1; i >= 0; i--) {
    if (depthM >= DEPTH_STOPS[i][0]) {
      const [r, g, b] = DEPTH_STOPS[i][1];
      return [r, g, b, 210];
    }
  }

  const next = DEPTH_STOPS[1];
  const [r0, g0, b0] = DEPTH_STOPS[0][1];
  const t = Math.min(1, depthM / next[0]);
  return [lerp(r0, next[1][0], t), lerp(g0, next[1][1], t), lerp(b0, next[1][2], t), 200];
}
