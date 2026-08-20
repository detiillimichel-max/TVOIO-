// OIO TV — endpoint público do Cloudflare Worker.
// NUNCA coloque API keys, client secrets ou bearer tokens neste arquivo.

export const API_BASE_URL = (
  globalThis?.TVOIO_CONFIG?.apiBaseUrl || ''
).replace(/\/$/, '');

export const apiUrl = (path, params = {}) => {
  if (!API_BASE_URL) {
    throw new Error('TVOIO API base URL is not configured yet.');
  }

  const url = new URL(`${API_BASE_URL}/${String(path).replace(/^\//, '')}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};
