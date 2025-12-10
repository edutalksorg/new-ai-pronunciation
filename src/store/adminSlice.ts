import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: 'active' | 'inactive' | 'banned';
  createdAt: string;
  lastLogin?: string;
}

export interface ReferralSettings {
  referrerBonus: number;
  refereeBonus: number;
  maxReferrals?: number;
  isActive: boolean;
  bonusType: 'wallet' | 'subscription' | 'both';
}

interface AdminState {
  users: AdminUser[];
  referralSettings: ReferralSettings | null;
  isLoading: boolean;
  error: string | null;
  selectedUser: AdminUser | null;
  userFilter: {
    role?: string;
    status?: string;
    searchQuery?: string;
  };
}

const initialState: AdminState = {
  users: [],
  referralSettings: null,
  isLoading: false,
  error: null,
  selectedUser: null,
  userFilter: {},
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setUsers: (state, action: PayloadAction<AdminUser[]>) => {
      state.users = action.payload;
    },
    updateUser: (state, action: PayloadAction<AdminUser>) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
      if (state.selectedUser?.id === action.payload.id) {
        state.selectedUser = action.payload;
      }
    },
    setSelectedUser: (state, action: PayloadAction<AdminUser | null>) => {
      state.selectedUser = action.payload;
    },
    setReferralSettings: (state, action: PayloadAction<ReferralSettings>) => {
      state.referralSettings = action.payload;
    },
    updateReferralSettings: (state, action: PayloadAction<Partial<ReferralSettings>>) => {
      if (state.referralSettings) {
        state.referralSettings = { ...state.referralSettings, ...action.payload };
      }
    },
    setUserFilter: (state, action: PayloadAction<Partial<typeof state.userFilter>>) => {
      state.userFilter = { ...state.userFilter, ...action.payload };
    },
  },
});

export const {
  setLoading,
  setError,
  setUsers,
  updateUser,
  setSelectedUser,
  setReferralSettings,
  updateReferralSettings,
  setUserFilter,
} = adminSlice.actions;

export default adminSlice.reducer;
