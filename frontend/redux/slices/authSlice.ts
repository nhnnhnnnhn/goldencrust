import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  address?: string;
  loyaltyPoints?: number;
  joinDate?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  error: null,
  loading: false,
};

// Kiểm tra xem có token trong localStorage không khi khởi tạo
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (token && user) {
    initialState.token = token;
    initialState.user = JSON.parse(user);
    initialState.isAuthenticated = true;
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      
      // Lưu thông tin vào localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      // Xóa thông tin khỏi localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setCredentials, logout, setError, clearError } = authSlice.actions;

// Export default để TypeScript nhận diện module dễ dàng hơn
export default authSlice.reducer;
