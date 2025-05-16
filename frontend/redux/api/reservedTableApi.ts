import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ReservedTable {
  _id: string;
  tableId: string;
  userId?: string;
  date: string | Date;
  time: string;
  status: 'reserved' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

interface CreateReservedTableRequest {
  tableId: string;
  userId?: string;
  date: string;
  time: string;
}

interface UpdateReservedTableRequest {
  date?: string;
  time?: string;
  status?: 'reserved' | 'completed' | 'cancelled';
}

export const reservedTableApi = createApi({
  reducerPath: 'reservedTableApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/reserved-tables`,
    prepareHeaders: (headers, { getState }) => {
      // Thêm token vào header nếu có
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: ['ReservedTable'],
  endpoints: (builder) => ({
    // Lấy tất cả bàn đã đặt
    getReservedTables: builder.query<ReservedTable[], void>({
      query: () => '',
      providesTags: ['ReservedTable'],
    }),

    // Lấy bàn đã đặt theo ID
    getReservedTableById: builder.query<ReservedTable, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ReservedTable', id }],
    }),

    // Tạo đặt bàn mới
    createReservedTable: builder.mutation<ReservedTable, CreateReservedTableRequest>({
      query: (reservedTable) => ({
        url: '',
        method: 'POST',
        body: reservedTable,
      }),
      invalidatesTags: ['ReservedTable'],
    }),

    // Cập nhật thông tin đặt bàn
    updateReservedTable: builder.mutation<ReservedTable, { id: string; data: UpdateReservedTableRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ReservedTable', id }],
    }),

    // Cập nhật trạng thái đặt bàn
    updateReservedTableStatus: builder.mutation<ReservedTable, { id: string; status: 'reserved' | 'completed' | 'cancelled' }>({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ReservedTable', id }],
    }),

    // Xóa đặt bàn
    deleteReservedTable: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ReservedTable'],
    }),

    // Lấy đặt bàn theo bàn
    getReservedTablesByTable: builder.query<ReservedTable[], string>({
      query: (tableId) => `/table/${tableId}`,
      providesTags: ['ReservedTable'],
    }),

    // Kiểm tra tình trạng bàn
    checkTableAvailability: builder.mutation<{ isAvailable: boolean; existingReservation: ReservedTable | null }, { tableId: string; date: string; time: string }>({
      query: (data) => ({
        url: '/check-availability',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetReservedTablesQuery,
  useGetReservedTableByIdQuery,
  useCreateReservedTableMutation,
  useUpdateReservedTableMutation,
  useUpdateReservedTableStatusMutation,
  useDeleteReservedTableMutation,
  useGetReservedTablesByTableQuery,
  useCheckTableAvailabilityMutation,
} = reservedTableApi; 