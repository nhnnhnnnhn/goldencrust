import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Category {
  _id: string;
  name: string;
  description: string;
  status: string;
  slug: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryResponse {
  categories: Category[];
  category?: Category;
  message?: string;
}

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/v1',
    prepareHeaders: (headers, { getState }) => {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      } else {
        console.warn('No authentication token found');
      }
      return headers;
    },
  }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    // Get all categories (for admin)
    getCategories: builder.query<CategoryResponse, void>({
      query: () => '/categories',
      providesTags: ['Category'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          console.error('Error fetching categories:', error);
          if (error.error?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
      },
    }),

    // Get active categories (for delivery page)
    getActiveCategories: builder.query<CategoryResponse, void>({
      query: () => '/categories/active',
      providesTags: ['Category'],
    }),

    // Get category by ID
    getCategoryById: builder.query<CategoryResponse, string>({
      query: (id) => `/categories/${id}`,
      providesTags: ['Category'],
    }),

    // Get category by slug
    getCategoryBySlug: builder.query<CategoryResponse, string>({
      query: (slug) => `/categories/${slug}`,
      providesTags: ['Category'],
    }),

    // Create new category
    createCategory: builder.mutation<CategoryResponse, Partial<Category>>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Category'],
    }),

    // Update category
    updateCategory: builder.mutation<CategoryResponse, { id: string; body: Partial<Category> }>({
      query: ({ id, body }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Category'],
    }),

    // Delete category
    deleteCategory: builder.mutation<CategoryResponse, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // Update category status
    updateCategoryStatus: builder.mutation<CategoryResponse, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/categories/${id}/status`,
        method: 'PATCH',
        body: { status },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Category'],
    }),

    // Search categories
    searchCategories: builder.query<CategoryResponse, string>({
      query: (query) => `/categories/search?query=${query}`,
      providesTags: ['Category'],
    }),

    // Get category stats
    getCategoryStats: builder.query<{
      totalCategories: number;
      activeCategories: number;
      inactiveCategories: number;
    }, void>({
      query: () => '/categories/stats',
      providesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetActiveCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetCategoryBySlugQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryStatusMutation,
  useSearchCategoriesQuery,
  useGetCategoryStatsQuery,
} = categoryApi; 