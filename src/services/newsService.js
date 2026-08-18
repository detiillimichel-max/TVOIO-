import { apiGet } from './apiClient.js';

export const searchGNews = (query, options = {}) =>
  apiGet('/gnews/search', { q: query, lang: options.lang ?? 'pt', max: options.max ?? 10 }, options);

export const searchGuardian = (query, options = {}) =>
  apiGet('/guardian/search', { q: query, page: options.page ?? 1 }, options);
