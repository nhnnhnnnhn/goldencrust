import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout, setError } from '../slices/authSlice';

// Lấy giá trị API_URL từ biến môi trường hoặc sử dụng giá trị mặc định
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
  googleId?: string;
  googleToken?: string;
  isGoogleSignup?: boolean;
}

interface VerifyOtpRequest {
  email: string;
  code: string;
  action?: string; // 'REGISTER', 'FORGOT_PASSWORD'
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  email?: string; // Trường email giờ đây là tùy chọn
}

interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
  loyaltyPoints?: number;
  joinDate?: string;
  phone?: string;
  address?: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: UserResponse;
}

interface RegisterResponse {
  message: string;
}

interface VerifyOtpResponse {
  message: string;
  token?: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface ResetPasswordResponse {
  message: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      // Thêm token vào header nếu có
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include', // Để xử lý cookie refresh token
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({
            token: data.token,
            user: data.user,
          }));
        } catch (error: any) {
          if (error.error) {
            dispatch(setError(error.error.data?.message || 'Đăng nhập thất bại'));
          }
        }
      },
    }),
    
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Không cần dispatch setCredentials vì người dùng cần xác thực email
        } catch (error: any) {
          if (error.error) {
            dispatch(setError(error.error.data?.message || 'Đăng ký thất bại'));
          }
        }
      },
    }),
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (data) => ({
        // Chọn endpoint dựa trên action
        url: data.action?.toUpperCase() === 'FORGOT_PASSWORD' 
          ? '/auth/verify-otp-forgot-password'
          : '/auth/verify-otp',
        method: 'POST',
        body: {
          email: data.email,
          code: data.code,
        },
      }),
    }),
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (error) {
          console.error('Logout error:', error);
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
} = authApi;

// Export API để TypeScript nhận diện module dễ dàng hơn
export default authApi;
