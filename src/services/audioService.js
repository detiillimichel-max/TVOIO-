import { apiGet } from './apiClient.js';

export const searchSpotify = (query, options = {}) =>
  apiGet('/spotify/search', { q: query, type: options.type ?? 'track,artist,album', limit: options.limit ?? 12 }, options);

export const searchJamendo = (query, options = {}) =>
  apiGet('/jamendo/search', { q: query, limit: options.limit ?? 12 }, options);

export const searchAudius = (query, options = {}) =>
  apiGet('/audius/search', { q: query, limit: options.limit ?? 12 }, options);
