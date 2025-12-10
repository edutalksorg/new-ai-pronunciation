import { apiService } from './api';

export const referralsService = {
  // 1. Get authenticated user's referral code and shareable URL
  getMyCode: async () =>
    apiService.get('/referrals/my-code'),

  // 2. Get referral statistics for authenticated user
  getStats: async () =>
    apiService.get('/referrals/stats'),

  // 3. Get referral history with pagination
  getHistory: async (page = 1, pageSize = 20) =>
    apiService.get('/referrals/history', { params: { page, pageSize } }),

  // 4. Validate if a referral code exists
  validateCode: async (code: string) =>
    apiService.get(`/referrals/validate/${code}`),

  // Admin APIs
  getSettings: async () =>
    apiService.get('/admin/referrals/settings'),

  updateSettings: async (settings: any) =>
    apiService.put('/admin/referrals/settings', settings),
};

export default referralsService;
