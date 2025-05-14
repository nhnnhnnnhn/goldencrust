import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5000/api/v1',
        prepareHeaders: (headers, { getState }) => {
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        // Get all users
        getAllUsers: builder.query({
            query: () => '/users/get-user',
            providesTags: ['User'],
        }),

        // Get user by ID
        getUserById: builder.query({
            query: (id) => `/users/get-user/${id}`,
            providesTags: ['User'],
        }),

        // Create new user
        createUser: builder.mutation({
            query: (userData) => ({
                url: '/users/create',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),

        // Update user
        updateUser: builder.mutation({
            query: ({ id, userData }) => ({
                url: `/users/update/${id}`,
                method: 'PUT',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),

        // Delete user
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/users/delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),

        // Delete multiple users
        deleteMultipleUsers: builder.mutation({
            query: (ids) => ({
                url: '/users/delete-multiple',
                method: 'DELETE',
                body: { ids },
            }),
            invalidatesTags: ['User'],
        }),

        // Search users
        searchUsers: builder.query({
            query: (query) => `/users/search?query=${query}`,
            providesTags: ['User'],
        }),

        // Toggle user suspension
        toggleUserSuspension: builder.mutation({
            query: (id) => ({
                url: `/users/suspend/${id}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['User'],
        }),

        // Toggle user activation
        toggleUserActivation: builder.mutation({
            query: (id) => ({
                url: `/users/activate/${id}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['User'],
        }),

        // Get user stats
        getUserStats: builder.query({
            query: () => '/users/stats',
            providesTags: ['User'],
        }),

        // Get user profile
        getUserProfile: builder.query({
            query: () => '/users/profile',
            providesTags: ['User'],
        }),

        // Update user profile
        updateUserProfile: builder.mutation({
            query: (profileData) => ({
                url: '/users/profile/update',
                method: 'PUT',
                body: profileData,
            }),
            invalidatesTags: ['User'],
        }),

        // Change user password
        changeUserPassword: builder.mutation({
            query: (passwordData) => ({
                url: '/users/profile/change-password',
                method: 'PUT',
                body: passwordData,
            }),
        }),
    }),
}); 