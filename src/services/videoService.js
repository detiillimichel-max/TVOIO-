import { apiGet } from './apiClient.js';

export const searchYouTube = (query, options = {}) =>
  apiGet('/youtube/search', { q: query, maxResults: options.maxResults ?? 12 }, options);

export const searchTMDB = (query, options = {}) =>
  apiGet('/tmdb/search', { q: query, page: options.page ?? 1 }, options);

export const searchTwitch = (query, options = {}) =>
  apiGet('/twitch/search', { q: query, first: options.first ?? 12 }, options);

export const searchVimeo = (query, options = {}) =>
  apiGet('/vimeo/search', { q: query, per_page: options.perPage ?? 12 }, options);
