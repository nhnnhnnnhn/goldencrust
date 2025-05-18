import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the User interface
export interface User {
    _id: string;
    email: string;
    fullName: string;
    phone?: string;
    address?: string;
    avatar?: string;
    role: string;
    isActive: boolean;
    isSuspended: boolean;
    createdAt: string;
    updatedAt: string;
    password?: string;
}

export const userApi = createApi({
    reducerPath: 'userApi',
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
    tagTypes: ['User'],
    endpoints: (builder) => ({
        // Get all users
        getAllUsers: builder.query<User[], void>({
            query: () => '/users/get-user',
            providesTags: ['User'],
        }),

        // Get user by ID
        getUserById: builder.query<User, string>({
            query: (id) => `/users/get-user/${id}`,
            providesTags: ['User'],
        }),

        // Create new user
        createUser: builder.mutation<User, Partial<User>>({
            query: (userData) => ({
                url: '/users/create',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),

        // Update user
        updateUser: builder.mutation<User, { id: string; userData: Partial<User> }>({
            query: ({ id, userData }) => ({
                url: `/users/update/${id}`,
                method: 'PUT',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),

        // Delete user
        deleteUser: builder.mutation<void, string>({
            query: (id) => ({
                url: `/users/delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),

        // Delete multiple users
        deleteMultipleUsers: builder.mutation<void, string[]>({
            query: (ids) => ({
                url: '/users/delete-multiple',
                method: 'DELETE',
                body: { ids },
            }),
            invalidatesTags: ['User'],
        }),

        // Search users
        searchUsers: builder.query<User[], string>({
            query: (query) => `/users/search?query=${query}`,
            providesTags: ['User'],
        }),

        // Toggle user suspension
        toggleUserSuspension: builder.mutation<User, string>({
            query: (id) => ({
                url: `/users/suspend/${id}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['User'],
        }),

        // Toggle user activation
        toggleUserActivation: builder.mutation<User, string>({
            query: (id) => ({
                url: `/users/activate/${id}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['User'],
        }),

        // Get user stats
        getUserStats: builder.query<{
            totalUsers: number;
            activeUsers: number;
            newUsersThisMonth: number;
            loyaltyMembers: number;
        }, void>({
            query: () => '/users/stats',
            providesTags: ['User'],
        }),

        // Get user profile
        getUserProfile: builder.query<User, void>({
            query: () => ({
                url: '/users/profile',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
            providesTags: ['User'],
            // Add error handling
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (error: any) {
                    console.error('Error fetching user profile:', error);
                    if (error.error?.status === 401) {
                        // Handle unauthorized error
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }
                }
            },
        }),

        // Update user profile
        updateUserProfile: builder.mutation<User, Partial<User>>({
            query: (profileData) => ({
                url: '/users/profile/update',
                method: 'PUT',
                body: profileData,
            }),
            invalidatesTags: ['User'],
        }),

        // Admin update user profile
        adminUpdateUserProfile: builder.mutation<User, { id: string; userData: Partial<User> }>({
            query: ({ id, userData }) => ({
                url: `/users/admin/update/${id}`,
                method: 'PUT',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),

        // Change user password
        changeUserPassword: builder.mutation<void, {
            oldPassword: string;
            newPassword: string;
        }>({
            query: (passwordData) => ({
                url: '/users/profile/change-password',
                method: 'PUT',
                body: passwordData,
            }),
        }),
    }),
});

// Export hooks for usage in components
export const {
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useDeleteMultipleUsersMutation,
    useSearchUsersQuery,
    useToggleUserSuspensionMutation,
    useToggleUserActivationMutation,
    useGetUserStatsQuery,
    useGetUserProfileQuery,
    useUpdateUserProfileMutation,
    useAdminUpdateUserProfileMutation,
    useChangeUserPasswordMutation,
} = userApi; 