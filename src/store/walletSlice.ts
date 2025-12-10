import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  source?: string;
  transactionDate: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  lastUpdated: string;
  totalCredits: number;
  totalDebits: number;
}

interface WalletState {
  wallet: Wallet | null;
  transactions: WalletTransaction[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  wallet: null,
  transactions: [],
  isLoading: false,
  error: null,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setWallet: (state, action: PayloadAction<Wallet>) => {
      state.wallet = action.payload;
    },
    updateWalletBalance: (state, action: PayloadAction<number>) => {
      if (state.wallet) {
        state.wallet.balance = action.payload;
        state.wallet.lastUpdated = new Date().toISOString();
      }
    },
    setTransactions: (state, action: PayloadAction<WalletTransaction[]>) => {
      state.transactions = action.payload;
    },
    addTransaction: (state, action: PayloadAction<WalletTransaction>) => {
      state.transactions.unshift(action.payload);
      if (state.wallet) {
        state.wallet.balance = action.payload.balanceAfter;
        state.wallet.lastUpdated = action.payload.transactionDate;
      }
    },
    clearWallet: (state) => {
      state.wallet = null;
      state.transactions = [];
    },
  },
});

export const {
  setLoading,
  setError,
  setWallet,
  updateWalletBalance,
  setTransactions,
  addTransaction,
  clearWallet,
} = walletSlice.actions;

export default walletSlice.reducer;
