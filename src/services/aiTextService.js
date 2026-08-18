import { apiPost } from './apiClient.js';

export const askGemini = (prompt, options = {}) =>
  apiPost('/ai/gemini', { prompt, model: options.model, system: options.system }, options);

export const askGroq = (prompt, options = {}) =>
  apiPost('/ai/groq', { prompt, model: options.model, system: options.system }, options);

export const askQwen = (prompt, options = {}) =>
  apiPost('/ai/qwen', { prompt, model: options.model, system: options.system }, options);

export const askHuggingFace = (prompt, options = {}) =>
  apiPost('/ai/huggingface', { prompt, model: options.model }, options);
