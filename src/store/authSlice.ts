import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types';
import { STORAGE_KEYS } from '../constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: localStorage.getItem(STORAGE_KEYS.USER)
    ? JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)!)
    : null,
  token: localStorage.getItem(STORAGE_KEYS.TOKEN),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.TOKEN),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(action.payload));
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem(STORAGE_KEYS.TOKEN, action.payload);
    },
    setAuthData: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(action.payload.user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    },
    updateUserSubscription: (
      state,
      action: PayloadAction<{
        subscriptionStatus: string;
        subscriptionPlan?: string;
        trialEndDate?: string;
      }>
    ) => {
      if (state.user) {
        state.user.subscriptionStatus = action.payload.subscriptionStatus as any;
        if (action.payload.subscriptionPlan) {
          state.user.subscriptionPlan = action.payload.subscriptionPlan as any;
        }
        if (action.payload.trialEndDate) {
          state.user.trialEndDate = action.payload.trialEndDate;
        }
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setUser,
  setToken,
  setAuthData,
  logout,
  updateUserSubscription,
} = authSlice.actions;

export default authSlice.reducer;
