import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  tableNumber: number;
  openingHours?: {
    open: string;
    close: string;
  };
  status: 'open' | 'closed';
  rating?: number;
  cuisine?: string[];
  images?: string[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const restaurantApi = createApi({
  reducerPath: 'restaurantApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    credentials: 'include',
  }),
  tagTypes: ['Restaurant'],
  endpoints: (builder) => ({
    // Get all restaurants
    getRestaurants: builder.query<Restaurant[], void>({
      query: () => '/restaurants',
      transformResponse: (response: { success: boolean; message: string; data: Restaurant[] }) => response.data,
      providesTags: ['Restaurant'],
    }),

    // Get restaurant by ID
    getRestaurantById: builder.query<Restaurant, string>({
      query: (id) => `/restaurants/${id}`,
      transformResponse: (response: { success: boolean; message: string; data: Restaurant }) => response.data,
      providesTags: ['Restaurant'],
    }),

    // Create new restaurant
    createRestaurant: builder.mutation<Restaurant, Partial<Restaurant>>({
      query: (restaurant) => ({
        url: '/restaurants',
        method: 'POST',
        body: restaurant,
      }),
      invalidatesTags: ['Restaurant'],
    }),

    // Update restaurant
    updateRestaurant: builder.mutation<Restaurant, { id: string; restaurant: Partial<Restaurant> }>({
      query: ({ id, restaurant }) => ({
        url: `/restaurants/${id}`,
        method: 'PUT',
        body: restaurant,
      }),
      invalidatesTags: ['Restaurant'],
    }),

    // Update restaurant status
    updateRestaurantStatus: builder.mutation<Restaurant, { id: string; status: 'active' | 'inactive' }>({
      query: ({ id, status }) => ({
        url: `/restaurants/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Restaurant'],
    }),

    // Delete restaurant
    deleteRestaurant: builder.mutation<void, string>({
      query: (id) => ({
        url: `/restaurants/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Restaurant'],
    }),
  }),
});

export const {
  useGetRestaurantsQuery,
  useGetRestaurantByIdQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useUpdateRestaurantStatusMutation,
  useDeleteRestaurantMutation,
} = restaurantApi;
