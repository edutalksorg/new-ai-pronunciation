import { apiService } from './api';

export interface AdminPaymentTransaction {
    id: string;
    type: string;
    status: string;
    amount: number;
    currency: string;
    description: string;
    paymentMethodId: string;
    relatedEntityId: string;
    relatedEntityType: string;
    createdAt: string;
    failureReason?: string;
}

export interface AdminWithdrawalRequest {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    fee: number;
    netAmount: number;
    status: string;
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    routingNumber: string;
    iban: string;
    swiftCode: string;
    last4: string;
    expiresAt: string;
    createdAt: string;
    processedAt?: string;
    processedBy?: string;
    rejectionReason?: string;
}

export interface AdminRefundRequest {
    id: string;
    userId: string;
    transactionId: string;
    amount: number;
    currency: string;
    reason: string;
    reasonDescription: string;
    status: string;
    destination: string;
    stripeRefundId: string;
    rejectionReason?: string;
    createdAt: string;
    processedAt?: string;
    processedBy?: string;
}

export interface AdminWalletAdjustment {
    userId: string;
    amount: number;
    type: 'Credit' | 'Debit';
    reason: string;
}

export const adminPaymentsService = {
    // Transactions
    getTransactions: async (params?: {
        pageNumber?: number;
        pageSize?: number;
        type?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    }) => {
        return apiService.get<AdminPaymentTransaction[]>('/admin/payments/transactions', { params });
    },

    // Withdrawals
    getPendingWithdrawals: async (params?: {
        pageNumber?: number;
        pageSize?: number;
        status?: string;
    }) => {
        return apiService.get<AdminWithdrawalRequest[]>('/admin/payments/withdrawals/pending', { params });
    },

    approveWithdrawal: async (withdrawalId: string, processorReference?: string) => {
        return apiService.post(`/admin/payments/withdrawals/${withdrawalId}/approve`, { processorReference });
    },

    rejectWithdrawal: async (withdrawalId: string, rejectionReason: string) => {
        return apiService.post(`/admin/payments/withdrawals/${withdrawalId}/reject`, { rejectionReason });
    },

    completeWithdrawal: async (withdrawalId: string, bankTransferReference?: string) => {
        return apiService.post(`/admin/payments/withdrawals/${withdrawalId}/complete`, { bankTransferReference });
    },

    // Refunds
    getPendingRefunds: async (params?: {
        pageNumber?: number;
        pageSize?: number;
        status?: string;
    }) => {
        return apiService.get<AdminRefundRequest[]>('/admin/payments/refunds/pending', { params });
    },

    approveRefund: async (refundId: string, adminNotes?: string) => {
        return apiService.post(`/admin/payments/refunds/${refundId}/approve`, { adminNotes });
    },

    rejectRefund: async (refundId: string, rejectionReason: string) => {
        return apiService.post(`/admin/payments/refunds/${refundId}/reject`, { rejectionReason });
    },

    // Wallet
    adjustWalletBalance: async (data: AdminWalletAdjustment) => {
        return apiService.post('/admin/payments/wallets/adjust-balance', data);
    }
};
