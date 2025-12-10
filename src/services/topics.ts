import { apiService } from './api';

export const topicsService = {
  // User Operations
  list: async (params?: Record<string, any>) =>
    apiService.get('/topics', { params }),

  get: async (id: string) =>
    apiService.get(`/topics/${id}`),

  search: async (query: string, params?: Record<string, any>) =>
    apiService.get('/topics/search', { params: { q: query, ...params } }),

  getByCategory: async (categoryId: string, params?: Record<string, any>) =>
    apiService.get(`/topics/category/${categoryId}`, { params }),

  getDailyTopic: async () =>
    apiService.get('/topics/daily'),

  // Favorites
  favorite: async (id: string) =>
    apiService.post(`/topics/${id}/favorite`),

  unfavorite: async (id: string) =>
    apiService.delete(`/topics/${id}/favorite`),

  getFavorites: async (params?: Record<string, any>) =>
    apiService.get('/topics/favorites', { params }),

  // Progress Tracking
  markAsCompleted: async (topicId: string) =>
    apiService.post(`/topics/${topicId}/completed`),

  getProgress: async (topicId: string) =>
    apiService.get(`/topics/${topicId}/progress`),

  // Instructor Operations
  create: async (data: any) =>
    apiService.post('/topics', data),

  update: async (id: string, data: any) =>
    apiService.put(`/topics/${id}`, data),

  publish: async (id: string) =>
    apiService.post(`/topics/${id}/publish`),

  unpublish: async (id: string) =>
    apiService.post(`/topics/${id}/unpublish`),

  updateStatus: async (id: string, status: 'draft' | 'published' | 'archived') =>
    apiService.patch(`/topics/${id}/status`, { status }),

  getInstructorTopics: async (params?: Record<string, any>) =>
    apiService.get('/topics', { params: { ...params, mode: 'instructor' } }), // Try adding a mode/scope param

  getTopicAnalytics: async (topicId: string) =>
    apiService.get(`/topics/${topicId}/analytics`),

  duplicateTopic: async (topicId: string) =>
    apiService.post(`/topics/${topicId}/duplicate`),

  // Admin Operations
  markFeatured: async (id: string, featured: boolean) =>
    apiService.patch(`/topics/${id}/featured`, { featured }),

  adminList: async (params?: Record<string, any>) =>
    apiService.get('/admin/topics', { params }),

  adminApprove: async (topicId: string, feedback?: string) =>
    apiService.post(`/admin/topics/${topicId}/approve`, { feedback }),

  adminReject: async (topicId: string, reason: string) =>
    apiService.post(`/admin/topics/${topicId}/reject`, { reason }),

  adminFlag: async (topicId: string, reason: string) =>
    apiService.post(`/admin/topics/${topicId}/flag`, { reason }),

  remove: async (id: string) =>
    apiService.delete(`/topics/${id}`),

  // Categories
  getCategories: async () =>
    apiService.get('/topics/categories'),

  createCategory: async (data: { name: string; description?: string; icon?: string }) =>
    apiService.post('/topics/categories', data),

  updateCategory: async (categoryId: string, data: any) =>
    apiService.put(`/topics/categories/${categoryId}`, data),

  deleteCategory: async (categoryId: string) =>
    apiService.delete(`/topics/categories/${categoryId}`),

  // Bulk Operations
  bulkImport: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post('/topics/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  exportTopics: async (topicIds: string[]) =>
    apiService.post('/topics/export', { topicIds }),

  // Recommendations
  getRecommendedTopics: async (params?: Record<string, any>) =>
    apiService.get('/topics/recommended', { params }),

  getTrendingTopics: async (params?: Record<string, any>) =>
    apiService.get('/topics/trending', { params }),
};

export default topicsService;
