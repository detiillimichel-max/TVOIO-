import { apiPost } from './apiClient.js';

export const registerPushSubscription = (subscription, options = {}) =>
  apiPost('/push/subscribe', { subscription }, options);

export const unregisterPushSubscription = (endpoint, options = {}) =>
  apiPost('/push/unsubscribe', { endpoint }, options);
