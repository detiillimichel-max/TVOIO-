import { apiGet } from './apiClient.js';

export const getNASA = (date, options = {}) => apiGet('/nasa/apod', { date }, options);
export const searchDPLA = (query, options = {}) => apiGet('/dpla/search', { q: query, page: options.page ?? 1 }, options);
export const searchEuropeana = (query, options = {}) => apiGet('/europeana/search', { q: query, page: options.page ?? 1 }, options);
export const searchNARA = (query, options = {}) => apiGet('/nara/search', { q: query, page: options.page ?? 1 }, options);
export const searchPexels = (query, options = {}) => apiGet('/pexels/search', { q: query, per_page: options.perPage ?? 12 }, options);
export const searchPixabay = (query, options = {}) => apiGet('/pixabay/search', { q: query, per_page: options.perPage ?? 12 }, options);
