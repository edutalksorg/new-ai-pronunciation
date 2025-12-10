import { apiService } from './api';

export const walletService = {
  // 1. Get current wallet balance
  getBalance: async () =>
    apiService.get('/wallet/balance'),

  // 2. Top-up wallet
  addFunds: async (data: { amount: number; currency: string; paymentMethodId: string; idempotencyKey: string }) =>
    apiService.post('/wallet/add-funds', data),

  // 3. Get transaction history
  getTransactions: async (params?: { pageNumber?: number; pageSize?: number; startDate?: string; endDate?: string; type?: string; status?: string }) =>
    apiService.get('/wallet/transactions', { params }),

  // 4. Request withdrawal
  withdraw: async (data: {
    amount: number;
    currency: string;
    bankDetails: {
      bankName: string;
      accountHolderName: string;
      accountNumber: string;
      routingNumber: string;
      ifsc: string;
      upi: string;
    };
  }) =>
    apiService.post('/wallet/withdraw', data),

  getTransaction: async (transactionId: string) =>
    apiService.get(`/wallet/transactions/${transactionId}`),

  // Keeping other useful methods but prioritized the above 4
  getWallet: async () => apiService.get('/wallet'),
  getWalletDetails: async () => apiService.get('/wallet/details'),
  getTransactionHistory: async (params?: Record<string, any>) => apiService.get('/wallet/history', { params }),
  exportTransactions: async (params?: Record<string, any>) => apiService.get('/wallet/export-transactions', { params }),
  addFundsWithCoupon: async (amount: number, couponCode: string) => apiService.post('/wallet/add-funds-coupon', { amount, couponCode }),
  getWithdrawalRequests: async (params?: Record<string, any>) => apiService.get('/wallet/withdrawal-requests', { params }),
  getWithdrawalRequest: async (withdrawalId: string) => apiService.get(`/wallet/withdrawal-requests/${withdrawalId}`),
  cancelWithdrawalRequest: async (withdrawalId: string) => apiService.post(`/wallet/withdrawal-requests/${withdrawalId}/cancel`),
  transferFunds: async (data: any) => apiService.post('/wallet/transfer', data),
  getSpendingBreakdown: async () => apiService.get('/wallet/spending-breakdown'),
  getMonthlySpending: async () => apiService.get('/wallet/monthly-spending'),
  getRecurringCharges: async () => apiService.get('/wallet/recurring-charges'),
  updateRecurringCharge: async (chargeId: string, enabled: boolean) => apiService.put(`/wallet/recurring-charges/${chargeId}`, { enabled }),
  getWalletLimits: async () => apiService.get('/wallet/limits'),
  getBonusHistory: async (params?: Record<string, any>) => apiService.get('/wallet/bonuses', { params }),
  getAvailableBonuses: async () => apiService.get('/wallet/available-bonuses'),
  claimBonus: async (bonusId: string) => apiService.post(`/wallet/bonuses/${bonusId}/claim`),
  getReferralBonus: async () => apiService.get('/wallet/referral-bonus'),
  adminGetWallet: async (userId: string) => apiService.get(`/admin/wallet/${userId}`),
  adminGetTransactions: async (userId: string, params?: Record<string, any>) => apiService.get(`/admin/wallet/${userId}/transactions`, { params }),
  adminAdjustBalance: async (userId: string, amount: number, reason: string) => apiService.post(`/admin/wallet/${userId}/adjust`, { amount, reason }),
  adminAddFunds: async (userId: string, amount: number, reason: string) => apiService.post(`/admin/wallet/${userId}/add-funds`, { amount, reason }),
  adminDeductFunds: async (userId: string, amount: number, reason: string) => apiService.post(`/admin/wallet/${userId}/deduct-funds`, { amount, reason }),
  getWalletStats: async () => apiService.get('/wallet/stats'),
  getWalletNotifications: async (params?: Record<string, any>) => apiService.get('/wallet/notifications', { params }),
  markNotificationAsRead: async (notificationId: string) => apiService.put(`/wallet/notifications/${notificationId}/read`),
};

export default walletService;
