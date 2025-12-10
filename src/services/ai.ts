import { apiService } from './api';
import { AI_MODEL } from '../constants';

// Client-side AI helpers (stub). These functions demonstrate how the
// frontend can consistently use the `AI_MODEL` value. Endpoints used
// here are illustrative; wire them to your backend AI endpoints.

export interface AiTextRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

export const callAiText = async (payload: AiTextRequest) => {
  // Example: POST /ai/generate { model, prompt, ... }
  return apiService.post('/ai/generate', {
    model: AI_MODEL,
    ...payload,
  });
};

export const uploadAudioForAssessment = async (file: File, meta?: Record<string, any>) => {
  const form = new FormData();
  form.append('file', file);
  form.append('model', AI_MODEL);

  if (meta) {
    Object.entries(meta).forEach(([k, v]) => form.append(k, String(v)));
  }

  return apiService.post('/ai/assess-audio', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export default {
  callAiText,
  uploadAudioForAssessment,
};
