// OIO TV — endpoint público do Cloudflare Worker.
// NUNCA coloque API keys, client secrets ou bearer tokens neste arquivo.

export const API_BASE_URL = (
  globalThis?.TVOIO_CONFIG?.apiBaseUrl ||
  'https://oio-tv-api.workers.dev'
).replace(/\/$/, '');

export const apiUrl = (path, params = {}) => {
  const url = new URL(`${API_BASE_URL}/${String(path).replace(/^\//, '')}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};
