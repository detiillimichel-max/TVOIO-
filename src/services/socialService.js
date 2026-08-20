import { apiPost } from './apiClient.js';

// Social credentials remain exclusively in the Worker.
export const createFacebookShare = (payload = {}, options = {}) =>
  apiPost('/social/facebook/share', payload, options);
