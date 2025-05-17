import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface DeliveryItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  discountPercentage: number;
  total: number;
}

interface Delivery {
  _id: string;
  deliveryStatus: 'preparing' | 'on the way' | 'delivered' | 'cancelled';
  userId: string;
  customerName: string;
  items: DeliveryItem[];
  totalAmount: number;
  expectedDeliveryTime: Date;
  notes: string;
  deliveryAddress: string;
  deliveryPhone: string;
  paymentMethod: 'cash on delivery' | 'online payment';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export const deliveryApi = createApi({
  reducerPath: 'deliveryApi',
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
  tagTypes: ['Delivery'],
  endpoints: (builder) => ({
    // Get all deliveries
    getAllDeliveries: builder.query<Delivery[], void>({
      query: () => '/deliveries/get',
      transformResponse: (response: Delivery[]) => response,
      providesTags: ['Delivery'],
    }),

    // Get all deliveries by user ID
    getAllDeliveriesByUserId: builder.query<Delivery[], string>({
      query: (userId) => `/deliveries/get/user/${userId}`,
      transformResponse: (response: Delivery[]) => response,
      providesTags: ['Delivery'],
    }),

    // Get a delivery by ID
    getDeliveryById: builder.query<Delivery, string>({
      query: (id) => `/deliveries/get/${id}`,
      transformResponse: (response: Delivery) => response,
      providesTags: ['Delivery'],
    }),

    // Create a new delivery
    createDelivery: builder.mutation<Delivery, Partial<Delivery>>({
      query: (delivery) => ({
        url: '/deliveries/create',
        method: 'POST',
        body: delivery,
      }),
      invalidatesTags: ['Delivery'],
    }),

    // Edit a delivery
    editDelivery: builder.mutation<Delivery, { id: string; delivery: Partial<Delivery> }>({
      query: ({ id, delivery }) => ({
        url: `/deliveries/edit/${id}`,
        method: 'PATCH',
        body: delivery,
      }),
      invalidatesTags: ['Delivery'],
    }),

    // Update delivery status
    updateDeliveryStatus: builder.mutation<Delivery, { id: string; status: Delivery['deliveryStatus'] }>({
      query: ({ id, status }) => ({
        url: `/deliveries/update/${id}`,
        method: 'PATCH',
        body: { deliveryStatus: status },
      }),
      invalidatesTags: ['Delivery'],
    }),
  }),
});

export const {
  useGetAllDeliveriesQuery,
  useGetAllDeliveriesByUserIdQuery,
  useGetDeliveryByIdQuery,
  useCreateDeliveryMutation,
  useEditDeliveryMutation,
  useUpdateDeliveryStatusMutation,
} = deliveryApi; 