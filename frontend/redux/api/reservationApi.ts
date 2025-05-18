import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Define interfaces
export interface Reservation {
  _id: string;
  customerName: string;
  customerPhone: string;
  reservationDate: string | Date;
  reservationTime: string;
  numberOfGuests: number;
  specialRequests?: string;
  restaurantId: string;
  tableId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdBy?: string;
  updatedBy?: string;
  expiredAt: string | Date;
  deleted?: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Table {
  _id: string;
  tableNumber: string;
  capacity: number;
  status: 'available' | 'reserved' | 'occupied';
  reservationTime?: string | null;
}

interface CreateReservationRequest {
  customerName: string;
  customerPhone: string;
  reservationDate: string;
  reservationTime: string;
  numberOfGuests: number;
  specialRequests?: string;
  restaurantId: string;
  tableIds: string[];
}

interface UpdateReservationRequest {
  customerName?: string;
  customerPhone?: string;
  reservationDate?: string;
  reservationTime?: string;
  numberOfGuests?: number;
  specialRequests?: string;
  restaurantId?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

interface GetAvailableTablesRequest {
  restaurantId: string;
  date: string;
  time: string;
}

export const reservationApi = createApi({
  reducerPath: 'reservationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      console.log('[API Config] Preparing headers:', {
        hasToken: !!token,
        baseUrl: '/',
        headers: Object.fromEntries(headers.entries())
      });

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Reservation'],
  endpoints: (builder) => ({
    // Get all reservations
    getReservations: builder.query<Reservation[], void>({
      query: () => '/reservations',
      transformResponse: (response: { success: boolean; message: string; data: Reservation[] }) => response.data,
      providesTags: ['Reservation'],
    }),

    // Get reservation by ID
    getReservationById: builder.query<Reservation, string>({
      query: (id) => `/reservations/${id}`,
      transformResponse: (response: { success: boolean; message: string; data: Reservation }) => response.data,
      providesTags: ['Reservation'],
    }),

    // Create reservation
    createReservation: builder.mutation<Reservation, CreateReservationRequest>({
      query: (body) => ({
        url: '/api/v1/reservations',
        method: 'POST',
        body: {
          ...body,
          // Combine date and time for reservation
          reservationDateTime: `${body.reservationDate}T${body.reservationTime}`
        }
      }),
      invalidatesTags: (result) => [
        'Reservation',
        { type: 'Reservation', id: 'LIST' }
      ],
    }),

    // Update reservation
    updateReservation: builder.mutation<Reservation, { id: string; reservation: UpdateReservationRequest }>({
      query: ({ id, reservation }) => ({
        url: `/api/v1/reservations/${id}`,
        method: 'PUT',
        body: {
          ...reservation,
          // Combine date and time for reservation if they exist
          ...(reservation.reservationDate && reservation.reservationTime 
            ? { reservationDateTime: `${reservation.reservationDate}T${reservation.reservationTime}` }
            : {})
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }),
      transformResponse: (response: { success: boolean; message: string; data: Reservation }) => {
        console.log('[RTK Query] Update response:', response);
        if (!response.success) {
          throw new Error(response.message || 'Failed to update reservation');
        }
        return response.data;
      },
      transformErrorResponse: (response: { status: number; data: any }) => {
        console.error('[RTK Query] Update error:', response);
        return response;
      },
      invalidatesTags: (result, error, { id }) => [
        'Reservation',
        { type: 'Reservation', id },
        { type: 'Reservation', id: 'LIST' }
      ],
    }),

    // Update reservation status
    updateReservationStatus: builder.mutation<Reservation, { id: string; status: 'pending' | 'confirmed' | 'cancelled' }>({
      query: ({ id, status }) => ({
        url: `/api/v1/reservations/${id}/status`,
        method: 'PATCH',
        body: { status },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }),
      transformResponse: (response: { success: boolean; message: string; data: Reservation }) => {
        console.log('[RTK Query] Status update response:', response);
        if (!response.success) {
          throw new Error(response.message || 'Failed to update reservation status');
        }
        return response.data;
      },
      transformErrorResponse: (response: FetchBaseQueryError) => {
        // Log the raw error response with more details
        console.error('[RTK Query] Status update error:', {
          status: response.status,
          statusText: response?.status === 'CUSTOM_ERROR' ? (response as any).error : undefined,
          data: response.data,
          type: typeof response,
          hasData: !!response.data
        });

        try {
          // Handle network errors
          if (response.status === 'FETCH_ERROR') {
            return {
              status: 'CUSTOM_ERROR',
              data: null,
              error: 'Network error: Unable to connect to the server'
            };
          }

          // Handle timeout errors
          if (response.status === 'TIMEOUT_ERROR') {
            return {
              status: 'CUSTOM_ERROR',
              data: null,
              error: 'Request timed out. Please try again.'
            };
          }

          // Handle API errors with response data
          if (response.data) {
            const errorData = response.data as any;
            return {
              status: 'CUSTOM_ERROR',
              data: null,
              error: errorData.message || 'Error updating reservation status'
            };
          }

          // Handle unknown errors
          return {
            status: 'CUSTOM_ERROR',
            data: null,
            error: 'An unexpected error occurred'
          };
        } catch (error: any) {
          // Handle error transformation failures
          console.error('[RTK Query] Error during error transformation:', error);
          return {
            status: 'CUSTOM_ERROR',
            data: null,
            error: 'Error processing server response'
          };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        'Reservation',
        { type: 'Reservation', id },
        { type: 'Reservation', id: 'LIST' }
      ],
    }),

    // Delete reservation
    deleteReservation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/reservations/${id}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }),
      transformResponse: (response: { success: boolean; message: string }) => {
        console.log('[RTK Query] Delete response:', response);
        if (!response.success) {
          throw new Error(response.message || 'Failed to delete reservation');
        }
      },
      transformErrorResponse: (response: { status: number; data: any }) => {
        console.error('[RTK Query] Delete error:', response);
        return response;
      },
      invalidatesTags: ['Reservation'],
    }),

    // Get reservations by date range
    getReservationsByDateRange: builder.query<Reservation[], { startDate: string; endDate: string }>({
      query: ({ startDate, endDate }) => {
        console.log('[RTK Query] Fetching reservations:', { startDate, endDate });
        return `/api/v1/reservations/date-range?startDate=${startDate}&endDate=${endDate}`;
      },
      transformResponse: (response: { success: boolean; message: string; data: Reservation[] }) => {
        console.log('[RTK Query] Raw response:', response);
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch reservations');
        }
        return response.data;
      },
      transformErrorResponse: (response: { status: number; data: any }) => {
        console.error('[RTK Query] Error response:', response);
        return response;
      },
      providesTags: (result) => [
        'Reservation',
        { type: 'Reservation', id: 'LIST' },
        ...(result ? result.map(({ _id }) => ({ type: 'Reservation' as const, id: _id })) : [])
      ],
    }),

    // Get reservations by restaurant
    getReservationsByRestaurant: builder.query<Reservation[], string>({
      query: (restaurantId) => `/reservations/restaurant/${restaurantId}`,
      transformResponse: (response: { success: boolean; message: string; data: Reservation[] }) => response.data,
      providesTags: ['Reservation'],
    }),

    // Get reservations by status
    getReservationsByStatus: builder.query<Reservation[], 'pending' | 'confirmed' | 'cancelled'>({
      query: (status) => `/reservations/status/${status}`,
      transformResponse: (response: { success: boolean; message: string; data: Reservation[] }) => response.data,
      providesTags: ['Reservation'],
    }),

    // Get available tables
    getAvailableTables: builder.mutation<{ success: boolean; message: string; data: Table[]; error?: any }, GetAvailableTablesRequest>({
      query: ({ restaurantId, date, time }) => {
        console.log('[RTK Query] Preparing request:', {
          restaurantId,
          date,
          time,
          url: `/api/v1/tables/available/${restaurantId}`
        });
        
        // Ensure URL is properly formatted
        const encodedRestaurantId = encodeURIComponent(restaurantId);
        const encodedDate = encodeURIComponent(date);
        const encodedTime = encodeURIComponent(time);
        
        return {
          url: `/api/v1/tables/available/${encodedRestaurantId}?date=${encodedDate}&time=${encodedTime}`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        };
      },
      transformResponse: (response: any) => {
        console.log('[RTK Query] Raw response:', JSON.stringify(response, null, 2));
        
        if (!response || typeof response !== 'object') {
          console.error('[RTK Query] Invalid response format:', response);
          throw new Error('Invalid response format');
        }

        return {
          success: response.success || false,
          message: response.message || 'No message provided',
          data: Array.isArray(response.data) ? response.data : [],
          error: response.error
        };
      },
      transformErrorResponse: (response: FetchBaseQueryError | { status: number, data: any }) => {
        console.error('[RTK Query] Error response:', {
          status: response.status,
          data: response.data,
          raw: JSON.stringify(response, null, 2)
        });

        // Handle empty response
        if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
          return {
            status: 'CUSTOM_ERROR',
            error: 'Server returned an empty response. Please check your network connection and try again.'
          };
        }

        // Handle network errors
        if (response.status === 'FETCH_ERROR') {
          return {
            status: 'CUSTOM_ERROR',
            error: 'Network error: Unable to connect to the server. Please check your internet connection.'
          };
        }

        // Handle timeout errors
        if (response.status === 'TIMEOUT_ERROR') {
          return {
            status: 'CUSTOM_ERROR',
            error: 'Request timed out. Please try again.'
          };
        }

        // Handle API errors with response data
        if (response.data) {
          const errorData = response.data as any;
          return {
            status: 'CUSTOM_ERROR',
            error: errorData.message || errorData.error?.message || 'Error checking table availability'
          };
        }

        // Handle HTTP errors without response data
        if (typeof response.status === 'number') {
          const statusMessages: Record<number, string> = {
            400: 'Invalid request parameters',
            401: 'Authentication required. Please log in again.',
            403: 'Access denied',
            404: 'No tables found',
            500: 'Server error',
            502: 'Bad gateway',
            503: 'Service unavailable'
          };
          
          return {
            status: 'CUSTOM_ERROR',
            error: statusMessages[response.status] || `HTTP error ${response.status}`
          };
        }

        // Handle unknown errors
        return {
          status: 'CUSTOM_ERROR',
          error: 'An unexpected error occurred. Please try again.'
        };
      }
    }),
  }),
});

export const {
  useGetReservationsQuery,
  useGetReservationByIdQuery,
  useCreateReservationMutation,
  useUpdateReservationMutation,
  useUpdateReservationStatusMutation,
  useDeleteReservationMutation,
  useGetReservationsByDateRangeQuery,
  useGetReservationsByRestaurantQuery,
  useGetReservationsByStatusQuery,
  useGetAvailableTablesMutation,
} = reservationApi; 