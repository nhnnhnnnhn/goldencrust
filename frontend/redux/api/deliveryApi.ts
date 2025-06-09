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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const deliveryApi = createApi({
  reducerPath: 'deliveryApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_URL,
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
        body: {
          ...delivery,
          userId: delivery.userId // Keep the original userId from the frontend
        },
      }),
      invalidatesTags: ['Delivery'],
    }),

    // Edit a delivery
    editDelivery: builder.mutation<Delivery, { id: string; notes?: string; deliveryAddress?: string; deliveryPhone?: string }>({
      query: ({ id, ...delivery }) => ({
        url: `/deliveries/edit/${id}`,
        method: 'PATCH',
        body: delivery,
      }),
      invalidatesTags: ['Delivery'],
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedDelivery } = await queryFulfilled;
          dispatch(
            deliveryApi.util.updateQueryData('getDeliveryById', id, (draft) => {
              Object.assign(draft, updatedDelivery);
            })
          );
        } catch (error) {
          console.error('Error updating delivery:', error);
        }
      },
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