# Water Level Chart Component

## Overview
The `WaterLevelChart` component is a real-time water level monitoring chart that fetches data from the `water_level_15m` API endpoint and displays it in an interactive area chart.

## Features
- **Real-time Data**: Automatically fetches data every 15 minutes
- **Multiple Time Ranges**: Supports 1h, 6h, 24h, and 7d time ranges
- **Station-Specific**: Can display data for specific stations
- **Statistics**: Shows current, average, max, and min values
- **Trend Analysis**: Calculates and displays trend direction
- **Status Indicators**: Color-coded status (normal, warning, critical)
- **Responsive Design**: Adapts to different screen sizes

## Usage

### Basic Usage
```tsx
import WaterLevelChart from '@/components/charts/water-level-chart';

<WaterLevelChart />
```

### With Custom Props
```tsx
<WaterLevelChart 
  stationId="PW01"           // Specific station ID
  timeRange="24h"            // Time range: '1h' | '6h' | '24h' | '7d'
  height={300}               // Chart height in pixels
  showStats={true}           // Show/hide statistics cards
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stationId` | `string` | `undefined` | Specific station ID to display data for |
| `timeRange` | `'1h' \| '6h' \| '24h' \| '7d'` | `'24h'` | Time range for data |
| `height` | `number` | `300` | Chart height in pixels |
| `showStats` | `boolean` | `true` | Whether to show statistics cards |

## Data Structure

The component expects data in the following format from the API:

```typescript
interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    data: Array<{
      id: string;
      payload: {
        timestamp_end: string;
        station_topic: string;
        data_points_count: number;
        avg_air_temp_c: number;
        rain_total_15min: number;
        max_water_level: number;
        topic: string;
        _msgid: string;
      };
      created_at: string;
    }>;
  };
}

interface WaterLevelData {
  timestamp: string;
  water_level: number;
  station_id: string;
  station_name: string;
  status: 'normal' | 'warning' | 'critical';
  temperature?: number;
  rainfall?: number;
  dataPoints?: number;
}
```

## API Integration

The component fetches data from `/api/water_level_15m` with the following query parameters:
- `timeRange`: Time range for data
- `stationId`: Optional station ID filter

## Status Levels
- **Normal**: < 50 cm (Green)
- **Warning**: 50-80 cm (Amber)
- **Critical**: 80+ cm (Red)

## Data Fields
- **max_water_level**: Maximum water level in centimeters
- **avg_air_temp_c**: Average air temperature in Celsius
- **rain_total_15min**: Total rainfall in 15 minutes (mm)
- **data_points_count**: Number of data points collected
- **timestamp_end**: End timestamp of measurement period
- **station_topic**: Station identifier/topic

## Error Handling
- Shows loading spinner while fetching data
- Displays error message if API call fails
- Gracefully handles empty data sets

## Styling
The component uses Tailwind CSS classes and is fully responsive. It includes:
- Gradient backgrounds
- Hover effects
- Status color coding
- Professional chart styling
