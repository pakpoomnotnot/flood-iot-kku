// app/api/flood-maps/route.ts
import { NextRequest, NextResponse } from 'next/server';

const FLOOD_MAP_BASE_URL = 'http://10.101.111.123:8080/transfer_data/floodmap_result_ras';

// Define available flood map scenarios
export interface FloodMapScenario {
  id: number;
  date: string;
  displayName: string;
  filename: string;
  fileUrl: string;
}

const FLOOD_SCENARIOS: FloodMapScenario[] = [
  {
    id: 1,
    date: '2019-09-02',
    displayName: '2 ก.ย. 2562 (อดีต)',
    filename: 'Depth (02SEP2019 23 00 00).Terrain.MergedInputs.tif',
    fileUrl: `${FLOOD_MAP_BASE_URL}/Depth%20(02SEP2019%2023%2000%2000).Terrain.MergedInputs.tif`
  },
  {
    id: 2,
    date: '2022-09-26',
    displayName: '26 ก.ย. 2565 (อดีต)',
    filename: 'Depth (26SEP2022 23 00 00).Terrain.MergedInputs.tif',
    fileUrl: `${FLOOD_MAP_BASE_URL}/Depth%20(26SEP2022%2023%2000%2000).Terrain.MergedInputs.tif`
  },
  {
    id: 3,
    date: '2025-08-15',
    displayName: '15 ส.ค. 2568 (พยากรณ์)',
    filename: 'Depth (15AUG2025 23 00 00).Terrain.MergedInputs.tif',
    fileUrl: `${FLOOD_MAP_BASE_URL}/Depth%20(15AUG2025%2023%2000%2000).Terrain.MergedInputs.tif`
  }
];

// GET: List available scenarios
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const scenarioId = searchParams.get('scenario');

  try {
    // Proxy GeoTIFF file
    if (action === 'proxy' && scenarioId) {
      const scenario = FLOOD_SCENARIOS.find(s => s.id === parseInt(scenarioId));
      if (!scenario) {
        return NextResponse.json(
          { error: 'Scenario not found' },
          { status: 404 }
        );
      }

      console.log('Proxying GeoTIFF:', scenario.fileUrl);

      try {
        // Fetch the GeoTIFF file with proper headers
        const response = await fetch(scenario.fileUrl, {
          method: 'GET',
          headers: {
            'Accept': 'image/tiff,*/*',
            'User-Agent': 'Mozilla/5.0'
          },
          // Disable certificate validation if needed (for internal servers)
          // @ts-ignore
          agent: process.env.NODE_ENV === 'development' ? undefined : undefined
        });

        if (!response.ok) {
          console.error('Failed to fetch GeoTIFF:', response.status, response.statusText);
          return NextResponse.json(
            { 
              error: 'Failed to fetch GeoTIFF', 
              status: response.status,
              message: response.statusText 
            },
            { status: response.status }
          );
        }

        // Get the file buffer
        const buffer = await response.arrayBuffer();
        console.log('GeoTIFF fetched successfully, size:', buffer.byteLength);

        // Return the file with appropriate headers
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/tiff',
            'Content-Length': buffer.byteLength.toString(),
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
          }
        });
      } catch (fetchError) {
        console.error('Error fetching GeoTIFF:', fetchError);
        return NextResponse.json(
          { 
            error: 'Network error fetching GeoTIFF',
            message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
            url: scenario.fileUrl
          },
          { status: 500 }
        );
      }
    }

    // If specific scenario requested, return its details
    if (scenarioId) {
      const scenario = FLOOD_SCENARIOS.find(s => s.id === parseInt(scenarioId));
      if (!scenario) {
        return NextResponse.json(
          { error: 'Scenario not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(scenario);
    }

    // Return all scenarios
    return NextResponse.json({
      scenarios: FLOOD_SCENARIOS,
      baseUrl: FLOOD_MAP_BASE_URL
    });
  } catch (error) {
    console.error('Error in flood-maps API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// OPTIONS: Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}