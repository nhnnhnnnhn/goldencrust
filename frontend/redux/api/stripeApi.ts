import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Lấy giá trị API_URL từ biến môi trường hoặc sử dụng giá trị mặc định
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

interface CheckoutSessionRequest {
  items: CartItem[];
  customer: CustomerInfo;
  deliveryFee?: number;
  orderIds?: string[];
}

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

interface PaymentStatusResponse {
  status: 'paid' | 'unpaid' | 'no_payment_required';
  customer: CustomerInfo;
  orderIds?: string[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
}

interface Payment {
  _id: string;
  amount: number;
  userId: string;
  paymentMethod: string;
  transactionId?: string;
  orderId: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  stripeChargeId?: string;
  stripePaymentMethodId?: string;
  currency: string;
  status: string;
  createdBy?: string;
  updatedBy?: string;
  deleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  order?: Order;
}

interface PaymentsResponse {
  success: boolean;
  payments: Payment[];
  totalCount: number;
  page: number;
  limit: number;
}

interface InvoiceResponse {
  success: boolean;
  invoiceUrl: string;
}

interface RefundRequest {
  paymentId: string;
  amount: number;
  reason?: string;
}

interface RefundResponse {
  success: boolean;
  refund: {
    id: string;
    amount: number;
    status: string;
    created: number;
  };
}

export const stripeApi = createApi({
  reducerPath: 'stripeApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${API_URL}`,
    prepareHeaders: (headers) => {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Payments'],
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation<CheckoutSessionResponse, CheckoutSessionRequest>({
      query: (data) => ({
        url: '/stripe/create-checkout-session',
        method: 'POST',
        body: data,
      }),
    }),
    checkPaymentStatus: builder.query<PaymentStatusResponse, string>({
      query: (sessionId) => `/stripe/check-payment/${sessionId}`,
    }),
    getPayments: builder.query<PaymentsResponse, { page?: number; limit?: number; status?: string; search?: string; paymentMethod?: string; startDate?: string; endDate?: string }>({ 
      query: ({ page = 1, limit = 10, status, search, paymentMethod, startDate, endDate }) => {
        let url = `/stripe/payments?page=${page}&limit=${limit}`;
        if (status && status !== 'all') url += `&status=${status}`;
        if (search) url += `&search=${search}`;
        if (paymentMethod) url += `&paymentMethod=${paymentMethod}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
        return url;
      },
      providesTags: (result) => 
        result
          ? [
              ...result.payments.map(({ _id }) => ({ type: 'Payments' as const, id: _id })),
              { type: 'Payments' as const, id: 'LIST' },
            ]
          : [{ type: 'Payments' as const, id: 'LIST' }],
    }),
    getInvoiceUrl: builder.query<InvoiceResponse, string>({ 
      query: (paymentId) => `/stripe/invoice/${paymentId}`,
    }),
    createRefund: builder.mutation<RefundResponse, RefundRequest>({
      query: (data) => ({
        url: '/stripe/refund',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Payments', id: 'LIST' }],
    }),
    getCustomerDetails: builder.query<{ success: boolean; customerName: string; customerEmail?: string }, string>({
      query: (paymentId) => `/stripe/customer/${paymentId}?_t=${Date.now()}`,
      // Không cache kết quả
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useCheckPaymentStatusQuery,
  useGetPaymentsQuery,
  useGetInvoiceUrlQuery,
  useLazyGetInvoiceUrlQuery,
  useCreateRefundMutation,
  useGetCustomerDetailsQuery,
  useLazyGetCustomerDetailsQuery,
} = stripeApi;
