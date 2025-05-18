import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface OrderItem {
  menuItemId: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  _id: string;
  userId: string;
  restaurantId: string;
  orderDate: Date;
  items: OrderItem[];
  orderType: 'Dine-in' | 'Takeaway';
  status: 'pending' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateOrderRequest {
  userId: string;
  restaurantId: string;
  items: OrderItem[];
  orderType: 'Dine-in' | 'Takeaway';
  totalAmount: number;
}

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    // Create a new order
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (order) => ({
        url: '/orders',
        method: 'POST',
        body: order,
      }),
      invalidatesTags: ['Order'],
    }),

    // Delete order
    deleteOrder: builder.mutation<{ success: boolean; message: string; data: any }, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: { success: boolean; message: string; data: any }) => response,
      invalidatesTags: ['Order'],
    }),

    // Get today's orders
    getTodayOrders: builder.query<Order[], void>({
      query: () => '/orders/today',
      transformResponse: (response: { success: boolean; message: string; data: Order[] }) => response.data,
      providesTags: ['Order'],
    }),

    // Get order by ID
    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (response: { success: boolean; message: string; data: Order }) => response.data,
      providesTags: ['Order'],
    }),

    // Update order status
    updateOrderStatus: builder.mutation<Order, { id: string; status: 'pending' | 'completed' | 'cancelled' }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order'],
    }),

    // Get restaurant's today orders
    getRestaurantTodayOrders: builder.query<Order[], string>({
      query: (restaurantId) => `/orders/restaurant/${restaurantId}/today`,
      transformResponse: (response: { success: boolean; message: string; data: Order[] }) => response.data,
      providesTags: ['Order'],
    }),

    // Get today's orders by type
    getTodayOrdersByType: builder.query<Order[], 'Dine-in' | 'Takeaway'>({
      query: (orderType) => `/orders/type/${orderType}/today`,
      transformResponse: (response: { success: boolean; message: string; data: Order[] }) => response.data,
      providesTags: ['Order'],
    }),

    // Get orders by date
    getOrdersByDate: builder.query<Order[], string>({
      query: (date) => `/orders/date/${date}`,
      transformResponse: (response: { success: boolean; message: string; data: Order[] }) => response.data,
      providesTags: ['Order'],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useGetTodayOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useGetRestaurantTodayOrdersQuery,
  useGetTodayOrdersByTypeQuery,
  useGetOrdersByDateQuery,
} = orderApi;
