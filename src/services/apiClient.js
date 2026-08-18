import { apiUrl } from './apiWorkerConfig.js';

export async function apiGet(path, params = {}, options = {}) {
  const response = await fetch(apiUrl(path, params), {
    method: 'GET',
    headers: { Accept: 'application/json', ...(options.headers || {}) },
    signal: options.signal,
  });

  let data = null;
  try { data = await response.json(); } catch { /* empty/non-JSON response */ }

  if (!response.ok) {
    const message = data?.error || data?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export async function apiPost(path, body = {}, options = {}) {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
    signal: options.signal,
  });

  let data = null;
  try { data = await response.json(); } catch { /* empty/non-JSON response */ }

  if (!response.ok) {
    const message = data?.error || data?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}
