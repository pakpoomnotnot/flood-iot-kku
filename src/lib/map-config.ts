// MapTiler key used by the browser to load basemap styles. NEXT_PUBLIC_ variables are
// inlined at build time, so it must be set when running `next build` (see .env.example).
// Restrict this key to the deployed origins in the MapTiler dashboard, since it is
// visible to anyone who opens the site.
export const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY ?? "";
