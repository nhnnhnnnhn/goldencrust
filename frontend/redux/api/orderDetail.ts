import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface PaymentSummary {
  cash: {
    count: number;
    total: number;
  };
  card: {
    count: number;
    total: number;
  };
}

interface OrderTypeSummary {
  dineIn: {
    count: number;
    total: number;
  };
  takeaway: {
    count: number;
    total: number;
  };
}

interface OrderDetail {
  _id: string;
  date: Date;
  restaurantId: string;
  totalOrders: number;
  dailyTotal: number;
  paymentSummary: PaymentSummary;
  orderTypeSummary: OrderTypeSummary;
  createdAt: string;
  updatedAt: string;
}

interface CreateDailySummaryRequest {
  restaurantId: string;
}

interface UpdatePaymentRequest {
  restaurantId: string;
  paymentMethod: 'cash' | 'card';
  amount: number;
}

interface UpdateOrderTypeRequest {
  restaurantId: string;
  orderType: 'Dine-in' | 'Takeaway';
  amount: number;
}

export const orderDetailApi = createApi({
  reducerPath: 'orderDetailApi',
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
  tagTypes: ['OrderDetail'],
  endpoints: (builder) => ({
    // Create daily summary
    createDailySummary: builder.mutation<OrderDetail, CreateDailySummaryRequest>({
      query: (data) => ({
        url: '/order-details/daily-summary',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['OrderDetail'],
    }),

    // Get today's summary
    getTodaySummary: builder.query<OrderDetail, void>({
      query: () => '/order-details/today',
      transformResponse: (response: { success: boolean; message: string; data: OrderDetail }) => response.data,
      providesTags: ['OrderDetail'],
    }),

    // Get restaurant's today summary
    getRestaurantTodaySummary: builder.query<OrderDetail, string>({
      query: (restaurantId) => `/order-details/restaurant/${restaurantId}/today`,
      transformResponse: (response: { success: boolean; message: string; data: OrderDetail }) => response.data,
      providesTags: ['OrderDetail'],
    }),

    // Update payment summary
    updatePaymentSummary: builder.mutation<OrderDetail, UpdatePaymentRequest>({
      query: (data) => ({
        url: '/order-details/update-payment',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['OrderDetail'],
    }),

    // Update order type summary
    updateOrderTypeSummary: builder.mutation<OrderDetail, UpdateOrderTypeRequest>({
      query: (data) => ({
        url: '/order-details/update-order-type',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['OrderDetail'],
    }),
  }),
});

export const {
  useCreateDailySummaryMutation,
  useGetTodaySummaryQuery,
  useGetRestaurantTodaySummaryQuery,
  useUpdatePaymentSummaryMutation,
  useUpdateOrderTypeSummaryMutation,
} = orderDetailApi;
