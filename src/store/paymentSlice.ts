import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  orderId?: string;
  description?: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  bankDetails?: Record<string, any>;
  requestedAt: string;
  processedAt?: string;
  notes?: string;
}

export interface Refund {
  id: string;
  transactionId: string;
  userId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: string;
  processedAt?: string;
  notes?: string;
}

interface PaymentState {
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  refunds: Refund[];
  currentTransaction: Transaction | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  transactions: [],
  withdrawals: [],
  refunds: [],
  currentTransaction: null,
  isLoading: false,
  error: null,
};

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
      state.currentTransaction = action.payload;
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
      if (state.currentTransaction?.id === action.payload.id) {
        state.currentTransaction = action.payload;
      }
    },
    setWithdrawals: (state, action: PayloadAction<Withdrawal[]>) => {
      state.withdrawals = action.payload;
    },
    updateWithdrawal: (state, action: PayloadAction<Withdrawal>) => {
      const index = state.withdrawals.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.withdrawals[index] = action.payload;
      }
    },
    setRefunds: (state, action: PayloadAction<Refund[]>) => {
      state.refunds = action.payload;
    },
    updateRefund: (state, action: PayloadAction<Refund>) => {
      const index = state.refunds.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.refunds[index] = action.payload;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setTransactions,
  addTransaction,
  updateTransaction,
  setWithdrawals,
  updateWithdrawal,
  setRefunds,
  updateRefund,
} = paymentSlice.actions;

export default paymentSlice.reducer;
