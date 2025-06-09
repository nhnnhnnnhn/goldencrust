import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { Restaurant } from './restaurant';

// Define interfaces
export interface Reservation {
  _id: string;
  customerName: string;
  customerPhone: string;
  reservationDate: string | Date;
  reservationTime: string;
  numberOfGuests: number;
  specialRequests?: string;
  restaurantId: string | Restaurant;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdBy?: string;
  updatedBy?: string;
  expiredAt: string | Date;
  deleted?: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateReservationRequest {
  customerName: string;
  customerPhone: string;
  reservationDate: string;
  reservationTime: string;
  numberOfGuests: number;
  specialRequests?: string;
  restaurantId: string;
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

export const reservationApi = createApi({
  reducerPath: 'reservationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
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
      query: (reservation) => ({
        url: '/reservations',
        method: 'POST',
        body: reservation,
      }),
      invalidatesTags: (result) => [
        'Reservation',
        { type: 'Reservation', id: 'LIST' }
      ],
    }),

    // Update reservation
    updateReservation: builder.mutation<Reservation, { id: string; reservation: UpdateReservationRequest }>({
      query: ({ id, reservation }) => ({
        url: `/reservations/${id}`,
        method: 'PUT',
        body: reservation,
      }),
      invalidatesTags: ['Reservation'],
    }),

    // Update reservation status
    updateReservationStatus: builder.mutation<Reservation, { id: string; status: 'pending' | 'confirmed' | 'cancelled' }>({
      query: ({ id, status }) => ({
        url: `/reservations/${id}/status`,
        method: 'PATCH',
        body: { status },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }),
      transformResponse: (response: { success: boolean; message: string; data: Reservation }) => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to update reservation status');
        }
        return response.data;
      },
      transformErrorResponse: (response: FetchBaseQueryError) => {
        if (response.status === 'FETCH_ERROR') {
          return {
            status: 500,
            data: { message: 'Network error: Unable to connect to the server' },
            message: 'Network error: Unable to connect to the server'
          };
        }
        const errorData = response.data as { message?: string } || {};
        return {
          status: typeof response.status === 'number' ? response.status : 500,
          data: errorData,
          message: errorData.message || 'An error occurred while updating the reservation status'
        };
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
        url: `/reservations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reservation'],
    }),

    // Get reservations by date range
    getReservationsByDateRange: builder.query<Reservation[], { startDate: string; endDate: string }>({
      query: ({ startDate, endDate }) => `/reservations/date-range?startDate=${startDate}&endDate=${endDate}`,
      transformResponse: (response: { success: boolean; message: string; data: Reservation[] }) => response.data,
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
} = reservationApi; 