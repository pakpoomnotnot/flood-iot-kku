// Server-side configuration read from environment variables (see .env.example).
// Values are read lazily, at request time, so `next build` does not need them.
// Server only: never import this from a client component.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Origin of the internal data server (no trailing slash), e.g. http://host:port */
export function dataServerUrl(): string {
  return requireEnv("DATA_SERVER_URL").replace(/\/+$/, "");
}

/** URL under the data server's /transfer_data/ directory. */
export function transferDataUrl(subPath: string): string {
  return `${dataServerUrl()}/transfer_data/${subPath}`;
}
