import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  username: string;
  name: string;
  position: string;
  password?: string; // Should not be stored long-term, but needed for demo
  role: 'super-admin' | 'teknisi';
  location?: string; // Only for 'teknisi'
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  users: User[];
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  users: [
    {
      id: 'user-1',
      username: 'admin',
      name: 'Administrator',
      position: 'Super Admin',
      password: 'admin123',
      role: 'super-admin',
    },
    {
      id: 'user-2',
      username: 'teknisi',
      name: 'Budi Santoso',
      position: 'Teknisi Lapangan',
      password: 'teknisi123',
      role: 'teknisi',
      location: 'Gedung Pusat Telekomunikasi',
    },
  ],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ username: string; password: string }>) => {
      const foundUser = state.users.find(
        u => u.username === action.payload.username && u.password === action.payload.password
      );
      if (foundUser) {
        state.user = foundUser;
        state.isAuthenticated = true;
      } else {
        // In a real app, you'd handle this error more gracefully
        console.error("Invalid credentials");
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    addUser: (state, action: PayloadAction<User>) => {
      // Ensure only super-admin can add users (logic can be in component)
      state.users.push(action.payload);
    },
  },
});

export const { login, logout, addUser } = authSlice.actions;
export default authSlice.reducer;
