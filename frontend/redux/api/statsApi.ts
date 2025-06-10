import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Interface cho dữ liệu thống kê
export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface CategoryRevenue {
  _id: string;
  name: string;
  revenue: number;
  percentage: number;
}

export interface OrderTypeStats {
  _id: string;
  type: 'Dine-in' | 'Takeaway';
  count: number;
}

export interface TimeSlotStats {
  _id: string;
  hour: number;
  customerCount: number;
}

export interface GrowthStats {
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  growthPercentage: number;
  averageDailyCustomers: number;
  previousMonthAverageDailyCustomers: number;
  customerGrowthPercentage: number;
}

// API slice
export const statsApi = createApi({
  reducerPath: 'statsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      // Sử dụng typeof để kiểm tra môi trường trước khi truy cập localStorage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ['Stats'],
  endpoints: (builder) => ({
    // Lấy dữ liệu doanh thu theo tháng
    getMonthlyRevenue: builder.query<MonthlyRevenue[], void>({
      query: () => '/statistics/monthly-revenue',
      transformResponse: (response: { success: boolean; message: string; data: MonthlyRevenue[] }) => response.data,
      providesTags: ['Stats'],
    }),

    // Lấy dữ liệu phân bổ doanh thu theo danh mục
    getCategoryRevenue: builder.query<CategoryRevenue[], void>({
      query: () => '/statistics/category-revenue',
      transformResponse: (response: { success: boolean; message: string; data: CategoryRevenue[] }) => response.data,
      providesTags: ['Stats'],
    }),

    // Lấy thống kê đơn hàng theo loại hình
    getOrderTypeStats: builder.query<OrderTypeStats[], void>({
      query: () => '/statistics/order-type',
      transformResponse: (response: { success: boolean; message: string; data: OrderTypeStats[] }) => response.data,
      providesTags: ['Stats'],
    }),

    // Lấy phân bố khách hàng theo giờ
    getTimeSlotStats: builder.query<TimeSlotStats[], void>({
      query: () => '/statistics/customer-time-distribution',
      transformResponse: (response: { success: boolean; message: string; data: TimeSlotStats[] }) => response.data,
      providesTags: ['Stats'],
    }),

    // Lấy thống kê tăng trưởng
    getGrowthStats: builder.query<GrowthStats, void>({
      query: () => '/statistics/growth',
      transformResponse: (response: { success: boolean; message: string; data: GrowthStats }) => response.data,
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  useGetMonthlyRevenueQuery,
  useGetCategoryRevenueQuery,
  useGetOrderTypeStatsQuery,
  useGetTimeSlotStatsQuery,
  useGetGrowthStatsQuery,
} = statsApi;
