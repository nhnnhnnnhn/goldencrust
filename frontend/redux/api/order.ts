import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  discountPercentage: number;
  total: number;
}

interface OrderDetail {
  _id: string;
  orderId: string;
  restaurantId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Payment {
  _id: string;
  amount: number;
  userId: string;
  paymentMethod: 'cash' | 'card' | 'QR';
  orderId: string;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  createdBy: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Order {
  _id: string;
  restaurantId: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'QR';
  paymentStatus: 'pending' | 'paid' | 'failed';
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const orderApi = createApi({
  reducerPath: 'orderApi',
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
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    // Create a new order
    createOrder: builder.mutation<Order, Partial<Order>>({
      query: (order) => ({
        url: '/orders',
        method: 'POST',
        body: order,
      }),
      invalidatesTags: ['Order'],
    }),

    // Get all orders
    getOrders: builder.query<Order[], void>({
      query: () => '/orders',
      transformResponse: (response: { success: boolean; message: string; data: Order[] }) => response.data,
      providesTags: ['Order'],
    }),

    // Get order by ID
    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (response: { success: boolean; message: string; data: Order }) => response.data,
      providesTags: ['Order'],
    }),

    // Update order
    updateOrder: builder.mutation<Order, { id: string; order: Partial<Order> }>({
      query: ({ id, order }) => ({
        url: `/orders/${id}`,
        method: 'PUT',
        body: order,
      }),
      invalidatesTags: ['Order'],
    }),

    // Update order status
    updateOrderStatus: builder.mutation<Order, { id: string; status: 'pending' | 'processing' | 'completed' | 'cancelled' }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order'],
    }),

    // Delete order
    deleteOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
    }),

    // Get orders by table ID
    getOrdersByTableId: builder.query<Order[], string>({
      query: (tableId) => `/orders/table/${tableId}`,
      providesTags: ['Order'],
    }),

    // Get orders by customer ID
    getOrdersByCustomerId: builder.query<Order[], string>({
      query: (customerId) => `/orders/customer/${customerId}`,
      providesTags: ['Order'],
    }),

    // Get orders by restaurant ID
    getOrdersByRestaurantId: builder.query<Order[], string>({
      query: (restaurantId) => `/orders/restaurant/${restaurantId}`,
      providesTags: ['Order'],
    }),

    // Get orders by status
    getOrdersByStatus: builder.query<Order[], string>({
      query: (status) => `/orders/status/${status}`,
      providesTags: ['Order'],
    }),

    // Get orders by date
    getOrdersByDate: builder.query<Order[], string>({
      query: (date) => `/orders/date/${date}`,
      providesTags: ['Order'],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useGetOrdersByTableIdQuery,
  useGetOrdersByCustomerIdQuery,
  useGetOrdersByRestaurantIdQuery,
  useGetOrdersByStatusQuery,
  useGetOrdersByDateQuery,
} = orderApi;
