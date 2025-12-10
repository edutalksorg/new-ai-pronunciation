import { apiService } from './api';

export const quizzesService = {
  // User Quiz Operations
  list: async (params?: Record<string, any>) =>
    apiService.get('/quizzes', { params }),

  getById: async (id: string) =>
    apiService.get(`/quizzes/${id}`),

  submit: async (id: string, answers: any, startedAt?: string) =>
    apiService.post(`/quizzes/${id}/submit`, { answers, startedAt }),

  results: async (id: string) =>
    apiService.get(`/quizzes/${id}/results`),

  getAttempts: async (quizId: string, params?: Record<string, any>) =>
    apiService.get(`/quizzes/${quizId}/attempts`, { params }),

  getAttemptDetails: async (quizId: string, attemptId: string) =>
    apiService.get(`/quizzes/${quizId}/attempts/${attemptId}`),

  rateFeedback: async (quizId: string, attemptId: string, rating: number, feedback?: string) =>
    apiService.post(`/quizzes/${quizId}/attempts/${attemptId}/rate`, { rating, feedback }),

  markAsCompleted: async (quizId: string) =>
    apiService.post(`/quizzes/${quizId}/mark-completed`),

  // Instructor Operations
  createQuiz: async (data: any) =>
    apiService.post('/quizzes', data),

  updateQuiz: async (quizId: string, data: any) =>
    apiService.put(`/quizzes/${quizId}`, data),

  deleteQuiz: async (quizId: string) =>
    apiService.delete(`/quizzes/${quizId}`),

  publishQuiz: async (quizId: string) =>
    apiService.post(`/quizzes/${quizId}/publish`, { isPublished: true }),

  unpublishQuiz: async (quizId: string) =>
    apiService.post(`/quizzes/${quizId}/publish`, { isPublished: false }),

  duplicateQuiz: async (quizId: string) =>
    apiService.post(`/quizzes/${quizId}/duplicate`),

  getInstructorQuizzes: async (params?: Record<string, any>) =>
    apiService.get('/quizzes', { params: { ...params, mode: 'instructor' } }),

  getQuizAnalytics: async (quizId: string) =>
    apiService.get(`/quizzes/${quizId}/analytics`),

  getStudentQuizProgress: async (quizId: string, studentId: string) =>
    apiService.get(`/quizzes/${quizId}/student/${studentId}/progress`),

  getQuizzesByInstructor: async (instructorId: string, params?: Record<string, any>) =>
    apiService.get(`/quizzes/instructor/${instructorId}`, { params }),

  // Categories & Filters
  getCategories: async () =>
    apiService.get('/quizzes/categories'),

  getQuizzesByCategory: async (categoryId: string, params?: Record<string, any>) =>
    apiService.get(`/quizzes/category/${categoryId}`, { params }),

  // Favorites
  addToFavorites: async (quizId: string) =>
    apiService.post(`/quizzes/${quizId}/favorite`),

  removeFromFavorites: async (quizId: string) =>
    apiService.post(`/quizzes/${quizId}/unfavorite`),

  getFavoriteQuizzes: async (params?: Record<string, any>) =>
    apiService.get('/quizzes/favorites', { params }),

  // Search
  searchQuizzes: async (query: string, params?: Record<string, any>) =>
    apiService.get('/quizzes/search', { params: { q: query, ...params } }),

  // Admin Operations
  adminGetAllQuizzes: async (params?: Record<string, any>) =>
    apiService.get('/admin/quizzes', { params }),

  adminGetQuizForReview: async (quizId: string) =>
    apiService.get(`/admin/quizzes/${quizId}`),

  adminApproveQuiz: async (quizId: string, feedback?: string) =>
    apiService.post(`/admin/quizzes/${quizId}/approve`, { feedback }),

  adminRejectQuiz: async (quizId: string, reason: string) =>
    apiService.post(`/admin/quizzes/${quizId}/reject`, { reason }),

  adminFlagQuiz: async (quizId: string, reason: string) =>
    apiService.post(`/admin/quizzes/${quizId}/flag`, { reason }),

  adminUnpublishQuiz: async (quizId: string, reason?: string) =>
    apiService.post(`/admin/quizzes/${quizId}/unpublish`, { reason }),

  // Bulk Operations
  bulkImport: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post('/quizzes/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  exportQuizzes: async (quizIds: string[]) =>
    apiService.post('/quizzes/export', { quizIds }),
};

export default quizzesService;
