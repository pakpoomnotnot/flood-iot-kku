# Flood IoT KKU

A flood monitoring and early-warning dashboard for Khon Kaen City, Thailand. It was built for the KKC-UFM project (Khon Kaen City Urban Flood Management) and brings together live IoT telemetry, rainfall forecasts, and flood simulation results on an interactive map so that city staff and the public can see current conditions at a glance.

The user interface is in Thai.

## What it does

The app reads data produced by a network of field sensors and by numerical models, and presents it in several views:

- **Overview**: summary of current rainfall, temperature, total water stored in the lakes, and the number of telemetry stations that are online.
- **Rainfall**: live rain gauge readings from 15 stations, shown as 1-hour, 3-hour and 24-hour accumulations, with 15-minute charts and model forecast charts. Marker colors follow severity thresholds.
- **Lake water level**: water level and storage status for the city's lakes, compared against configured bank and warning levels.
- **Drainage**: water level in storm drain pipes (with percent of pipe capacity) and in open canals, switchable between pipe and canal views on both the map and the table.
- **Road water level**: flood depth on road surfaces at monitored locations.
- **Flood risk areas** (login required): simulated flood depth maps rendered from GeoTIFF/COG files, with a PDF report export.
- **Flood protection guidance** (login required): guidance for preparing for and responding to flooding.
- **Radar**: embedded tambon-level weather radar.

Every map view has a matching data table and per-station history charts.

## Data sources

All data comes from an internal data server (configured with `DATA_SERVER_URL`) that exposes files under `/transfer_data/`:

| Data | Description |
|---|---|
| Telemetry (MQTT export) | CSV files per station for lake, pipe, road and rain sensors, appended continuously from MQTT messages. |
| Rain forecast | CSV files produced by a regional weather model run (2 km grid, 48 hour horizon), published every 3 hours. |
| HMS / RAS results | Hydrologic model output (flow, reservoir) and HEC-RAS flood depth maps as GeoTIFF. |

The server only needs to be reachable from the machine that runs this app. Browsers never contact it directly: the Next.js API routes in `src/app/api` fetch and process the files, and the front end calls those routes.

More detail is in [docs/mqtt-data-source.md](docs/mqtt-data-source.md) and [docs/rain-forecast-data-source.md](docs/rain-forecast-data-source.md).

### Rainfall calculation

Rain gauges report a cumulative counter that can reset unexpectedly (for example when a device reboots). Window totals are therefore computed from the difference between consecutive 15-minute readings, counting a reset as "the new value since reset" instead of a negative number. The window always ends at the latest timestamp present in the data rather than at the current wall-clock time, so a delayed upload does not make the chart look stale. See `src/app/api/lib/rainActualSource.ts`.

## Tech stack

- Next.js 15 (App Router, Turbopack) with React 19 and TypeScript
- Tailwind CSS 4 and Radix UI primitives
- MapLibre GL JS for maps, with MapTiler basemaps
- Recharts for charts, TanStack Table for tables
- GeoTIFF / COG rendering for flood depth layers
- Docker and nginx for deployment

## Project structure

```
src/
  app/            Pages (/, /map, /dashboard, /login, /water-way) and API routes
    api/          Server-side endpoints that read the data server (rain, lake, water, flood-maps, flow)
  components/     Map views, tables, charts, layout and UI components
  sections/       Page-level compositions (map view, landing page)
  lib/            Station metadata, severity thresholds, shared helpers, server and map config
  hooks/          Data-fetching hooks
docs/             Notes on the upstream data formats
nginx/            Reverse proxy configuration for the Docker deployment
```

## Getting started

Requirements: Node.js 18.18 or newer and npm.

```bash
npm install
cp .env.example .env     # then fill in the values, see below
npm run dev
```

The dev server listens on http://localhost:3000. Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
```

## Configuration

All secrets and deployment-specific addresses are provided through environment variables. Copy `.env.example` to `.env` (which is ignored by git) and set:

| Variable | Used by | Description |
|---|---|---|
| `DATA_SERVER_URL` | server | Origin of the internal data server, for example `http://host:port`, without a trailing slash. Required for any live data. |
| `NEXT_PUBLIC_MAPTILER_API_KEY` | browser | MapTiler API key for the basemaps. It is inlined at build time, so set it before `npm run build`. |
| `ADMIN_USERNAME` | server | Username for the `/login` page. |
| `ADMIN_PASSWORD` | server | Password for the `/login` page. Login is disabled while either credential is empty. |

The MapTiler key is visible to anyone who loads the site. Restrict it to your own domains in the MapTiler dashboard.

## Docker deployment

The `docker-compose.yml` file runs the app behind nginx with TLS on port 3443.

1. Create `.env` as described above. Compose reads it automatically and refuses to start if a required variable is missing.
2. Place the TLS certificate and private key at `nginx/certs/server.crt` and `nginx/certs/server.key`. This directory is ignored by git and excluded from the Docker build context.
3. Build and start:

```bash
docker compose build
docker compose up -d
```

`NEXT_PUBLIC_MAPTILER_API_KEY` is passed to the image as a build argument. If you change it, rebuild the image. The other variables are read at runtime.

## Security notes

- Never commit `.env` or anything under `nginx/certs/`.
- Authentication is a single admin account stored in environment variables. The session cookie is a plain flag rather than a signed token, so anyone who sets it by hand passes the check. Treat it as a convenience gate for hiding menu items, not as protection for sensitive data, and replace it with signed sessions or an identity provider before relying on it.
- The data server address is not exposed to browsers; flood map files are streamed through `/api/flood-maps/cog`.
