import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from './apiConfig';
import { RootState } from '../store';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      // Lấy token từ auth state
      const state = getState() as RootState;
      const token = state.auth?.token;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
    credentials: 'include', // Để gửi cookies kèm theo
  }),
  tagTypes: ['Auth', 'User'],
  endpoints: () => ({}),
});
