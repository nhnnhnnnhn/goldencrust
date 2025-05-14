import { createSlice } from '@reduxjs/toolkit';

interface UserState {
    selectedUser: any | null;
    searchQuery: string;
    isUserModalOpen: boolean;
}

const initialState: UserState = {
    selectedUser: null,
    searchQuery: '',
    isUserModalOpen: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        setUserModalOpen: (state, action) => {
            state.isUserModalOpen = action.payload;
        },
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        },
    },
});

export const {
    setSelectedUser,
    setSearchQuery,
    setUserModalOpen,
    clearSelectedUser,
} = userSlice.actions;

export default userSlice.reducer; 