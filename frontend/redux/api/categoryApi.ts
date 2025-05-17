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
    baseUrl: 'http://localhost:5000/api/v1/categories',
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
    // Get all categories
    getCategories: builder.query<CategoryResponse, void>({
      query: () => '',
      providesTags: ['Category'],
      // Add error handling
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          console.error('Error fetching categories:', error);
          if (error.error?.status === 401) {
            // Handle unauthorized error
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
      },
    }),

    // Get category by ID
    getCategoryById: builder.query<CategoryResponse, string>({
      query: (id) => `/${id}`,
      providesTags: ['Category'],
    }),

    // Get category by slug
    getCategoryBySlug: builder.query<CategoryResponse, string>({
      query: (slug) => `/${slug}`,
      providesTags: ['Category'],
    }),

    // Create new category
    createCategory: builder.mutation<CategoryResponse, Partial<Category>>({
      query: (body) => ({
        url: '',
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
        url: `/${id}`,
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
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // Update category status
    updateCategoryStatus: builder.mutation<CategoryResponse, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
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
      query: (query) => `/search?query=${query}`,
      providesTags: ['Category'],
    }),

    // Get category stats
    getCategoryStats: builder.query<{
      totalCategories: number;
      activeCategories: number;
      inactiveCategories: number;
    }, void>({
      query: () => '/stats',
      providesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetCategoryBySlugQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryStatusMutation,
  useSearchCategoriesQuery,
  useGetCategoryStatsQuery,
} = categoryApi; 