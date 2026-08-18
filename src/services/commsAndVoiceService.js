import { apiPost } from './apiClient.js';

export const createDailyRoom = (options = {}) =>
  apiPost('/daily/room', { name: options.name, privacy: options.privacy ?? 'private' }, options);

export const textToSpeech = (text, options = {}) =>
  apiPost('/voice/elevenlabs', { text, voiceId: options.voiceId, modelId: options.modelId }, options);
