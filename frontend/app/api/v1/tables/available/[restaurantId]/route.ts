import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { addHours, parseISO, format } from 'date-fns';

interface Table {
  _id: string;
  tableNumber: string;
  status?: 'available' | 'reserved' | 'occupied';
  capacity: number;
  reservationTime?: string;
}

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Response headers for all responses
const responseHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders
  });
}

// Helper function to create error responses
const createErrorResponse = (status: number, message: string, details?: any) => {
  console.error(`[API Error] ${message}`, { status, details });
  
  return NextResponse.json({
    success: false,
    message,
    error: {
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    }
  }, {
    status,
    headers: responseHeaders
  });
};

export async function GET(
  request: Request,
  { params }: { params: { restaurantId: string } }
) {
  console.log('[API] Starting request handling');

  try {
    // Get and validate headers
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    const requestHeaders = {
      authorization: authHeader ? `${authHeader.substring(0, 10)}...` : 'none',
      'content-type': headersList.get('content-type'),
      accept: headersList.get('accept'),
    };
    
    console.log('[API] Request headers:', requestHeaders);

    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[API] Missing or invalid authorization header');
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        error: {
          type: 'AuthError',
          details: {
            reason: 'MISSING_TOKEN'
          }
        }
      }, {
        status: 401,
        headers: responseHeaders
      });
    }

    // Get and validate parameters
    const { restaurantId } = params;
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const time = url.searchParams.get('time');

    console.log('[API] Request parameters:', {
      restaurantId,
      date,
      time,
      url: request.url,
      searchParams: Object.fromEntries(url.searchParams.entries())
    });

    if (!restaurantId?.trim()) {
      console.error('[API] Missing restaurantId');
      return NextResponse.json({
        success: false,
        message: 'Restaurant ID is required',
        error: {
          type: 'ValidationError',
          field: 'restaurantId',
          details: {
            reason: 'MISSING_FIELD'
          }
        }
      }, {
        status: 400,
        headers: responseHeaders
      });
    }

    if (!date?.trim() || !time?.trim()) {
      console.error('[API] Missing date or time');
      return NextResponse.json({
        success: false,
        message: 'Date and time are required',
        error: {
          type: 'ValidationError',
          details: {
            missing: { date: !date?.trim(), time: !time?.trim() },
            reason: 'MISSING_FIELDS'
          }
        }
      }, {
        status: 400,
        headers: responseHeaders
      });
    }

    // Validate date and time format
    const dateTimeString = `${date}T${time}`;
    const parsedDate = new Date(dateTimeString);
    if (isNaN(parsedDate.getTime())) {
      console.error('[API] Invalid date/time format:', { date, time, dateTimeString });
      return NextResponse.json({
        success: false,
        message: 'Invalid date or time format',
        error: {
          type: 'ValidationError',
          details: {
            received: { date, time, combined: dateTimeString },
            reason: 'INVALID_FORMAT'
          }
        }
      }, {
        status: 400,
        headers: responseHeaders
      });
    }

    // Get backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Format date and time
    const formattedDate = format(parsedDate, 'yyyy-MM-dd');
    const formattedTime = format(parsedDate, 'HH:mm');

    // Construct backend URL
    const queryParams = new URLSearchParams({
      date: formattedDate,
      time: formattedTime
    }).toString();
    
    const tablesUrl = `${backendUrl}/api/v1/tables/available/${encodeURIComponent(restaurantId)}?${queryParams}`;
    
    console.log('[API] Fetching from backend:', {
      url: tablesUrl,
      params: { date: formattedDate, time: formattedTime },
      headers: {
        'Authorization': authHeader.substring(0, 15) + '...',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Make backend request
    const response = await fetch(tablesUrl, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    // Handle non-200 responses
    if (!response.ok) {
      console.error('[API] Backend error:', {
        status: response.status,
        statusText: response.statusText,
        url: tablesUrl,
        headers: Object.fromEntries(response.headers.entries())
      });

      let errorDetails;
      try {
        errorDetails = await response.json();
        console.error('[API] Backend error details:', errorDetails);
      } catch (e) {
        errorDetails = { message: response.statusText };
        console.error('[API] Could not parse error response:', e);
      }

      return NextResponse.json({
        success: false,
        message: errorDetails.message || 'Backend request failed',
        error: {
          type: 'BackendError',
          status: response.status,
          details: errorDetails,
          timestamp: new Date().toISOString()
        }
      }, {
        status: response.status,
        headers: responseHeaders
      });
    }

    // Parse and validate backend response
    let data;
    try {
      data = await response.json();
      console.log('[API] Backend response:', {
        success: data?.success,
        dataType: typeof data?.data,
        isArray: Array.isArray(data?.data),
        tableCount: Array.isArray(data?.data) ? data.data.length : 'N/A',
        rawData: JSON.stringify(data, null, 2)
      });
    } catch (error: any) {
      console.error('[API] Failed to parse response:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to parse backend response',
        error: {
          type: 'ParseError',
          details: {
            error: error.message,
            reason: 'INVALID_JSON'
          }
        }
      }, {
        status: 500,
        headers: responseHeaders
      });
    }

    if (!data?.success || !Array.isArray(data?.data)) {
      console.error('[API] Invalid response format:', data);
      return NextResponse.json({
        success: false,
        message: 'Invalid response format from backend',
        error: {
          type: 'ResponseError',
          details: {
            received: data,
            reason: 'INVALID_FORMAT'
          }
        }
      }, {
        status: 500,
        headers: responseHeaders
      });
    }

    // Process tables
    const processedTables = data.data
      .map((table: any) => {
        if (!table || typeof table !== 'object') {
          console.error('[API] Invalid table data:', table);
          return null;
        }

        try {
          // Always return table with available status for testing
          return {
            ...table,
            status: 'available',
            reservationTime: null,
            isSelectable: true
          };
        } catch (error: any) {
          console.error('[API] Table processing error:', {
            table,
            error: error.message
          });
          return null;
        }
      })
      .filter(Boolean);

    console.log('[API] Processed tables:', {
      original: data.data.length,
      processed: processedTables.length,
      tables: processedTables.map((t: Table) => ({
        id: t._id,
        number: t.tableNumber,
        status: t.status,
        capacity: t.capacity,
        isSelectable: true
      }))
    });

    if (processedTables.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No tables available',
        error: {
          type: 'NoTablesError',
          details: {
            reason: data.data.length === 0 ? 'NO_TABLES_EXIST' : 'ALL_TABLES_RESERVED',
            params: { restaurantId, date, time }
          }
        },
        data: []
      }, {
        status: 404,
        headers: responseHeaders
      });
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      message: 'Tables fetched successfully',
      data: processedTables
    }, {
      headers: responseHeaders
    });

  } catch (error: any) {
    console.error('[API] Unhandled error:', {
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: {
        type: 'UnhandledError',
        details: {
          message: error.message,
          ...(process.env.NODE_ENV === 'development' ? {
            stack: error.stack
          } : {})
        }
      }
    }, {
      status: 500,
      headers: responseHeaders
    });
  }
} 