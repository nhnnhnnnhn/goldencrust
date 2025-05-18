import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Restaurant {
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
    prepareHeaders: (headers, { getState }) => {
      // Try to get token from both possible storage keys
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      // If token exists, add it to headers
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Restaurant'],
  endpoints: (builder) => ({
    // Get all restaurants
    getRestaurants: builder.query<Restaurant[], void>({
      query: () => '/restaurants',
      transformResponse: (response: { success: boolean; message: string; data: Restaurant[] }) => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.data;
      },
      transformErrorResponse: (response: { status: number; data: any }) => {
        console.error('Error fetching restaurants:', {
          status: response.status,
          data: response.data
        });
        
        // Handle specific error cases
        if (response.status === 401) {
          return {
            status: response.status,
            message: 'Please log in to view restaurants'
          };
        }
        
        return {
          status: response.status,
          message: response.data?.message || 'Could not load restaurants'
        };
      },
      providesTags: ['Restaurant'],
    }),

    // Get restaurant by ID
    getRestaurantById: builder.query<Restaurant, string>({
      query: (id) => {
        if (!id || id.length !== 24) {
          throw new Error('ID nhà hàng không hợp lệ');
        }
        return `/restaurants/${id}`;
      },
      transformResponse: (response: { success: boolean; message: string; data: Restaurant }) => {
        if (!response.success) {
          console.error('Restaurant API error:', {
            success: response.success,
            message: response.message
          });
          throw new Error(response.message);
        }
        return response.data;
      },
      transformErrorResponse: (response: { status: number; data: any }) => {
        console.error('Error fetching restaurant:', {
          status: response.status,
          data: response.data
        });
        
        if (response.status === 404) {
          return {
            status: response.status,
            message: 'Nhà hàng không tồn tại'
          };
        } else if (response.status === 400) {
          return {
            status: response.status,
            message: 'ID nhà hàng không hợp lệ'
          };
        } else if (response.status === 401) {
          return {
            status: response.status,
            message: 'Vui lòng đăng nhập lại'
          };
        }
        return {
          status: response.status,
          message: response.data?.message || 'Không thể tải thông tin nhà hàng'
        };
      },
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
    updateRestaurantStatus: builder.mutation<Restaurant, { id: string; status: 'open' | 'closed' }>({
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
