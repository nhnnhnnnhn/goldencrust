import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../slices/authSlice';

// Lấy giá trị API_URL từ biến môi trường hoặc sử dụng giá trị mặc định
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const validateTokenApi = createApi({
  reducerPath: 'validateTokenApi',
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
  }),
  endpoints: (builder) => ({
    validateToken: builder.query<{ valid: boolean }, void>({
      query: () => '/auth/validate-token',
      // Nếu token không hợp lệ, tự động đăng xuất
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (!data.valid) {
            dispatch(logout());
          }
        } catch (error) {
          // Nếu có lỗi (ví dụ: token hết hạn), tự động đăng xuất
          dispatch(logout());
        }
      },
    }),
  }),
});

export const { useValidateTokenQuery } = validateTokenApi;
export default validateTokenApi;
