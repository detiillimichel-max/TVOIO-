const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'public, max-age=60',
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  return {
    'access-control-allow-origin': origin || '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'Content-Type, Accept',
    'vary': 'Origin',
  };
}

function respond(data, request, status = 200) {
  return json(data, status, corsHeaders(request));
}

function secret(env, name) {
  const value = env[name];
  if (!value) throw new Error(`Missing Worker secret: ${name}`);
  return value;
}

async function upstreamJson(url, init = {}) {
  const response = await fetch(url, init);
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!response.ok) {
    const message = data?.error?.message || data?.message || `Upstream HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function youtubeSearch(url, env) {
  const q = url.searchParams.get('q');
  if (!q) throw new Error('q is required');
  const params = new URLSearchParams({
    part: 'snippet',
    q,
    type: 'video',
    maxResults: String(Math.min(Number(url.searchParams.get('maxResults') || 12), 50)),
    key: secret(env, 'YOUTUBE_API_KEY'),
  });
  return upstreamJson(`https://www.googleapis.com/youtube/v3/search?${params}`);
}

async function tmdbSearch(url, env) {
  const q = url.searchParams.get('q');
  if (!q) throw new Error('q is required');
  const params = new URLSearchParams({
    api_key: secret(env, 'TMDB_API_KEY'),
    query: q,
    page: url.searchParams.get('page') || '1',
    language: url.searchParams.get('language') || 'pt-BR',
  });
  return upstreamJson(`https://api.themoviedb.org/3/search/multi?${params}`);
}

async function spotifyToken(env) {
  const credentials = btoa(`${secret(env, 'SPOTIFY_CLIENT_ID')}:${secret(env, 'SPOTIFY_CLIENT_SECRET')}`);
  const body = new URLSearchParams({ grant_type: 'client_credentials' });
  return upstreamJson('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  });
}

async function spotifySearch(url, env) {
  const q = url.searchParams.get('q');
  if (!q) throw new Error('q is required');
  const token = await spotifyToken(env);
  const params = new URLSearchParams({
    q,
    type: url.searchParams.get('type') || 'track,artist,album',
    limit: String(Math.min(Number(url.searchParams.get('limit') || 12), 50)),
  });
  return upstreamJson(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
}

async function twitchToken(env) {
  const params = new URLSearchParams({
    client_id: secret(env, 'TWITCH_CLIENT_ID'),
    client_secret: secret(env, 'TWITCH_CLIENT_SECRET'),
    grant_type: 'client_credentials',
  });
  return upstreamJson(`https://id.twitch.tv/oauth2/token?${params}`, { method: 'POST' });
}

async function twitchSearch(url, env) {
  const q = url.searchParams.get('q');
  if (!q) throw new Error('q is required');
  const token = await twitchToken(env);
  const params = new URLSearchParams({ q, first: String(Math.min(Number(url.searchParams.get('first') || 12), 100)) });
  return upstreamJson(`https://api.twitch.tv/helix/search/channels?${params}`, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      'Client-Id': secret(env, 'TWITCH_CLIENT_ID'),
    },
  });
}

async function vimeoSearch(url, env) {
  const q = url.searchParams.get('q');
  if (!q) throw new Error('q is required');
  const params = new URLSearchParams({ q, per_page: url.searchParams.get('per_page') || '12' });
  return upstreamJson(`https://api.vimeo.com/videos?${params}`, {
    headers: { Authorization: `Bearer ${secret(env, 'VIMEO_API_KEY')}` },
  });
}

async function pexelsSearch(url, env) {
  const q = url.searchParams.get('q');
  if (!q) throw new Error('q is required');
  const params = new URLSearchParams({ q, per_page: url.searchParams.get('per_page') || '12' });
  return upstreamJson(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: secret(env, 'PEXELS_API_KEY') },
  });
}

async function pixabaySearch(url, env) {
  const q = url.searchParams.get('q');
  if (!q) throw new Error('q is required');
  const params = new URLSearchParams({
    key: secret(env, 'PIXABAY_API_KEY'),
    q,
    per_page: url.searchParams.get('per_page') || '12',
  });
  return upstreamJson(`https://pixabay.com/api/?${params}`);
}

async function nasaApod(url, env) {
  const params = new URLSearchParams({
    api_key: secret(env, 'NASA_API_KEY'),
  });
  const date = url.searchParams.get('date');
  if (date) params.set('date', date);
  return upstreamJson(`https://api.nasa.gov/planetary/apod?${params}`);
}

async function gnewsSearch(url, env) {
  const q = url.searchParams.get('q');
  if (!q) throw new Error('q is required');
  const params = new URLSearchParams({
    q,
    lang: url.searchParams.get('lang') || 'pt',
    max: url.searchParams.get('max') || '10',
    apikey: secret(env, 'GNEWS_API_KEY'),
  });
  return upstreamJson(`https://gnews.io/api/v4/search?${params}`);
}

async function guardianSearch(url, env) {
  const q = url.searchParams.get('q');
  if (!q) throw new Error('q is required');
  const params = new URLSearchParams({
    q,
    page: url.searchParams.get('page') || '1',
    'show-fields': 'thumbnail,trailText',
    'api-key': secret(env, 'GUARDIAN_API_KEY'),
  });
  return upstreamJson(`https://content.guardianapis.com/search?${params}`);
}

async function europeanaSearch(url, env) {
  const q = url.searchParams.get('q');
  if (!q) throw new Error('q is required');
  const params = new URLSearchParams({
    wskey: secret(env, 'EUROPEANA_API_KEY'),
    query: q,
    page: url.searchParams.get('page') || '1',
  });
  return upstreamJson(`https://api.europeana.eu/record/v2/search.json?${params}`);
}

async function dplaSearch(url, env) {
  const q = url.searchParams.get('q');
  if (!q) throw new Error('q is required');
  const params = new URLSearchParams({
    q,
    page: url.searchParams.get('page') || '1',
    api_key: secret(env, 'DPLA_API_KEY'),
  });
  return upstreamJson(`https://api.dp.la/v2/items?${params}`);
}

async function naraSearch(url, env) {
  const q = url.searchParams.get('q');
  if (!q) throw new Error('q is required');
  const params = new URLSearchParams({ q, page: url.searchParams.get('page') || '1' });
  if (env.NARA_API_KEY) params.set('api_key', env.NARA_API_KEY);
  return upstreamJson(`https://catalog.archives.gov/api/v2/search?${params}`);
}

async function jamendoSearch(url, env) {
  const q = url.searchParams.get('q');
  if (!q) throw new Error('q is required');
  const params = new URLSearchParams({
    client_id: secret(env, 'JAMENDO_API_KEY'),
    format: 'json',
    namesearch: q,
    limit: url.searchParams.get('limit') || '12',
  });
  return upstreamJson(`https://api.jamendo.com/v3.0/tracks/?${params}`);
}

async function gemini(url, request, env) {
  const body = await request.json();
  const prompt = body.prompt;
  if (!prompt) throw new Error('prompt is required');
  const model = body.model || 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  return upstreamJson(endpoint, {
    method: 'POST',
    headers: {
      'x-goog-api-key': secret(env, 'GEMINI_API_KEY'),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: String(prompt) }] }],
      ...(body.system ? { systemInstruction: { parts: [{ text: String(body.system) }] } } : {}),
    }),
  });
}

async function openAICompatible(url, request, token, defaultModel) {
  const body = await request.json();
  const prompt = body.prompt;
  if (!prompt) throw new Error('prompt is required');
  const messages = [
    ...(body.system ? [{ role: 'system', content: String(body.system) }] : []),
    { role: 'user', content: String(prompt) },
  ];
  return upstreamJson(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: body.model || defaultModel, messages }),
  });
}

async function route(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (path === '/' || path === '/health') {
    return { ok: true, service: 'oio-tv-api', version: '1.0.0' };
  }
  if (path === '/youtube/search') return youtubeSearch(url, env);
  if (path === '/tmdb/search') return tmdbSearch(url, env);
  if (path === '/spotify/search') return spotifySearch(url, env);
  if (path === '/twitch/search') return twitchSearch(url, env);
  if (path === '/vimeo/search') return vimeoSearch(url, env);
  if (path === '/pexels/search') return pexelsSearch(url, env);
  if (path === '/pixabay/search') return pixabaySearch(url, env);
  if (path === '/nasa/apod') return nasaApod(url, env);
  if (path === '/gnews/search') return gnewsSearch(url, env);
  if (path === '/guardian/search') return guardianSearch(url, env);
  if (path === '/europeana/search') return europeanaSearch(url, env);
  if (path === '/dpla/search') return dplaSearch(url, env);
  if (path === '/nara/search') return naraSearch(url, env);
  if (path === '/jamendo/search') return jamendoSearch(url, env);

  if (path === '/ai/gemini' && request.method === 'POST') return gemini(url, request, env);
  if (path === '/ai/groq' && request.method === 'POST') {
    return openAICompatible(
      'https://api.groq.com/openai/v1/chat/completions',
      request,
      secret(env, 'GROQ_API_KEY'),
      'llama-3.3-70b-versatile',
    );
  }
  if (path === '/ai/huggingface' && request.method === 'POST') {
    return openAICompatible(
      'https://router.huggingface.co/v1/chat/completions',
      request,
      secret(env, 'HUGGINGFACE_ACCESS_TOKEN'),
      'Qwen/Qwen3-4B-Thinking-2507:fastest',
    );
  }

  // These adapters need provider-specific implementation/credentials before activation.
  const pending = ['/audius/search', '/ai/qwen', '/daily/room', '/voice/elevenlabs', '/social/facebook/share', '/push/subscribe', '/push/unsubscribe'];
  if (pending.includes(path)) {
    return { ok: false, error: 'Endpoint reserved; provider adapter not activated yet.', status: 501 };
  }

  return { ok: false, error: 'Not found', status: 404 };
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });

    try {
      const result = await route(request, env);
      const status = result?.status || 200;
      const payload = result?.status && result?.error ? { ...result } : result;
      return new Response(JSON.stringify(payload), {
        status,
        headers: { ...JSON_HEADERS, ...headers },
      });
    } catch (error) {
      console.error('OIO TV API:', error);
      return new Response(JSON.stringify({ ok: false, error: error.message || 'Internal error' }), {
        status: error.status || 500,
        headers: { ...JSON_HEADERS, ...headers },
      });
    }
  },
};
