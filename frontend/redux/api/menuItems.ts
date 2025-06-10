import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface MenuItem {
  _id: string;
  title: string;
  description?: string;
  price: number;
  categoryId: string;
  thumbnail: string;
  images: string[];
  status: 'active' | 'inactive' | 'out_of_stock';
  tags: string[];
  discountPercentage: number;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const menuItemApi = createApi({
  reducerPath: 'menuItemApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['MenuItem'],
  endpoints: (builder) => ({
    // Get active menu items for customers
    getActiveMenuItems: builder.query<MenuItem[], void>({
      query: () => '/menu-items/active',
      transformResponse: (response: { success: boolean; message: string; data: MenuItem[] }) => response.data,
      providesTags: ['MenuItem'],
    }),

    // Get all menu items
    getMenuItems: builder.query<MenuItem[], void>({
      query: () => '/menu-items',
      transformResponse: (response: { success: boolean; message: string; data: MenuItem[] }) => response.data,
      providesTags: ['MenuItem'],
    }),

    // Get menu item by ID
    getMenuItemById: builder.query<MenuItem, string>({
      query: (id) => `/menu-items/${id}`,
      transformResponse: (response: { success: boolean; message: string; data: MenuItem }) => response.data,
      providesTags: ['MenuItem'],
    }),

    // Create menu item
    createMenuItem: builder.mutation<MenuItem, FormData>({
      query: (menuItem) => ({
        url: '/menu-items',
        method: 'POST',
        body: menuItem,
      }),
      invalidatesTags: ['MenuItem'],
    }),

    // Update menu item
    updateMenuItem: builder.mutation<MenuItem, { id: string; menuItem: FormData }>({
      query: ({ id, menuItem }) => ({
        url: `/menu-items/${id}`,
        method: 'PUT',
        body: menuItem,
      }),
      invalidatesTags: ['MenuItem'],
    }),

    // Update menu item status
    updateMenuItemStatus: builder.mutation<MenuItem, { id: string; status: 'active' | 'inactive' | 'out_of_stock' }>({
      query: ({ id, status }) => ({
        url: `/menu-items/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['MenuItem'],
    }),

    // Delete menu item
    deleteMenuItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/menu-items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MenuItem'],
    }),
  }),
});

export const {
  useGetActiveMenuItemsQuery,
  useGetMenuItemsQuery,
  useGetMenuItemByIdQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useUpdateMenuItemStatusMutation,
  useDeleteMenuItemMutation,
} = menuItemApi;
