import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Lấy giá trị API_URL từ biến môi trường hoặc sử dụng giá trị mặc định
const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export const stripeApi = createApi({
  reducerPath: 'stripeApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_URL}/stripe` }),
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation<CheckoutSessionResponse, CheckoutSessionRequest>({
      query: (data) => ({
        url: '/create-checkout-session',
        method: 'POST',
        body: data,
      }),
    }),
    checkPaymentStatus: builder.query<PaymentStatusResponse, string>({
      query: (sessionId) => `/check-payment/${sessionId}`,
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useCheckPaymentStatusQuery,
} = stripeApi;
