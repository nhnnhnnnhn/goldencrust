import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
  status: 'pending' | 'confirmed' | 'cancelled';
  createdBy?: string;
  updatedBy?: string;
  expiredAt: string | Date;
  deleted?: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReservationRequest {
  customerName: string;
  customerPhone: string;
  reservationDate: string;
  reservationTime: string;
  numberOfGuests: number;
  specialRequests?: string;
  restaurantId: string;
}

export interface UpdateReservationRequest {
  id: string;
  reservation: Partial<Reservation>;
}

export const reservationApi = createApi({
  reducerPath: 'reservationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
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
      invalidatesTags: ['Reservation'],
    }),

    // Update reservation
    updateReservation: builder.mutation<Reservation, UpdateReservationRequest>({
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
      }),
      invalidatesTags: ['Reservation'],
    }),

    // Delete reservation
    deleteReservation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/reservations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reservation'],
    }),

    // Get reservations by restaurant
    getReservationsByRestaurant: builder.query<Reservation[], string>({
      query: (restaurantId) => `/reservations/restaurant/${restaurantId}`,
      transformResponse: (response: { success: boolean; message: string; data: Reservation[] }) => response.data,
      providesTags: ['Reservation'],
    }),

    // Get reservations by user
    getReservationsByUser: builder.query<Reservation[], string>({
      query: (userId) => `/reservations/user/${userId}`,
      transformResponse: (response: { success: boolean; message: string; data: Reservation[] }) => response.data,
      providesTags: ['Reservation'],
    }),
  }),
});

// Export hooks
export const {
  useGetReservationsQuery,
  useGetReservationByIdQuery,
  useCreateReservationMutation,
  useUpdateReservationMutation,
  useUpdateReservationStatusMutation,
  useDeleteReservationMutation,
  useGetReservationsByRestaurantQuery,
  useGetReservationsByUserQuery,
} = reservationApi; 