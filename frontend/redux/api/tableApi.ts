import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Table {
  _id: string;
  restaurantId: string;
  tableNumber: string;
  capacity: number;
  status: 'available' | 'reserved' | 'occupied';
  deleted: boolean;
}

interface CreateTableRequest {
  restaurantId: string;
  tableNumber: string;
  capacity: number;
}

interface UpdateTableRequest {
  capacity?: number;
  location?: string;
}

interface UpdateTableStatusRequest {
  status: 'available' | 'reserved' | 'occupied';
}

export const tableApi = createApi({
  reducerPath: 'tableApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      // Add authorization token to header if exists
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Table'],
  endpoints: (builder) => ({
    // Get all tables
    getTables: builder.query<Table[], void>({
      query: () => '/tables',
      transformResponse: (response: any) => response.data || [],
      providesTags: ['Table'],
    }),

    // Lấy bàn theo ID
    getTableById: builder.query<Table, string>({
      query: (id) => `/tables/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Table', id }],
    }),

    // Tạo bàn mới
    createTable: builder.mutation<Table, CreateTableRequest>({
      query: (table) => ({
        url: '/tables',
        method: 'POST',
        body: table,
      }),
      invalidatesTags: ['Table'],
    }),

    // Cập nhật thông tin bàn
    updateTable: builder.mutation<Table, { id: string; data: UpdateTableRequest }>({
      query: ({ id, data }) => ({
        url: `/tables/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Table', id }],
    }),

    // Cập nhật trạng thái bàn
    updateTableStatus: builder.mutation<Table, { id: string; data: UpdateTableStatusRequest }>({
      query: ({ id, data }) => ({
        url: `/tables/${id}/status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Table', id }],
    }),

    // Xóa bàn
    deleteTable: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tables/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Table'],
    }),

    // Lấy bàn theo nhà hàng
    getTablesByRestaurant: builder.query<Table[], string>({
      query: (restaurantId) => `/tables/restaurant/${restaurantId}`,
      transformResponse: (response: any) => {
        console.log('API Response:', response)
        return response.data || []
      },
      providesTags: ['Table'],
    }),

    // Lấy các bàn còn trống
    getAvailableTables: builder.query<Table[], string>({
      query: (restaurantId) => `/available/${restaurantId}`,
      providesTags: ['Table'],
    }),

    // Lấy bàn theo số chỗ ngồi
    getTablesByCapacity: builder.query<Table[], number>({
      query: (seats) => `/capacity/${seats}`,
      providesTags: ['Table'],
    }),
  }),
});

export const {
  useGetTablesQuery,
  useGetTableByIdQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useUpdateTableStatusMutation,
  useDeleteTableMutation,
  useGetTablesByRestaurantQuery,
  useGetAvailableTablesQuery,
  useGetTablesByCapacityQuery,
} = tableApi;

export default tableApi; 