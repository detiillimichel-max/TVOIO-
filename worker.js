const JSON_HEADERS = {
  "content-type": "application/json; charset=UTF-8",
  "cache-control": "public, max-age=60",
};

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "Content-Type, Accept, Authorization",
  "access-control-max-age": "86400",
};

function headers(extra = {}) {
  return { ...JSON_HEADERS, ...CORS_HEADERS, ...extra };
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: headers(extra) });
}

function error(message, status = 400, details = undefined) {
  return json({ ok: false, error: message, ...(details ? { details } : {}) }, status, {
    "cache-control": "no-store",
  });
}

function secret(env, ...names) {
  for (const name of names) {
    const value = env[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function requiredSecret(env, label, ...names) {
  const value = secret(env, ...names);
  if (!value) throw new Error(`Secret ${label} não configurado no Cloudflare Worker.`);
  return value;
}

async function upstream(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...(init.headers || {}) },
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text.slice(0, 4000) }; }
  if (!response.ok) {
    const message = data?.error?.message || data?.message || data?.error || `Upstream HTTP ${response.status}`;
    const e = new Error(message);
    e.status = response.status;
    throw e;
  }
  return data;
}

function queryParam(url, name, fallback = "") {
  return (url.searchParams.get(name) || fallback).trim();
}

function limitParam(url, fallback = 8, max = 50) {
  const value = Number.parseInt(url.searchParams.get("maxResults") || url.searchParams.get("limit") || "", 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(max, value));
}

async function youtube(url, env) {
  const q = queryParam(url, "q");
  if (!q) return error("Informe q.");
  const key = requiredSecret(env, "YOUTUBE_API_KEY", "YOUTUBE_API_KEY", "YOUTUBE_API", "YOUTUBE");
  const endpoint = new URL("https://www.googleapis.com/youtube/v3/search");
  endpoint.searchParams.set("part", "snippet");
  endpoint.searchParams.set("type", "video");
  endpoint.searchParams.set("q", q);
  endpoint.searchParams.set("maxResults", String(limitParam(url, 8, 50)));
  endpoint.searchParams.set("key", key);
  return json(await upstream(endpoint));
}

async function tmdb(url, env) {
  const q = queryParam(url, "q") || queryParam(url, "query");
  if (!q) return error("Informe q.");
  const key = requiredSecret(env, "TMDB_API_KEY", "TMDB_API_KEY", "TMDB_AF", "TMDB_API");
  const endpoint = new URL("https://api.themoviedb.org/3/search/multi");
  endpoint.searchParams.set("api_key", key);
  endpoint.searchParams.set("language", queryParam(url, "language", "pt-BR"));
  endpoint.searchParams.set("query", q);
  endpoint.searchParams.set("page", queryParam(url, "page", "1"));
  return json(await upstream(endpoint));
}

async function pexels(url, env) {
  const q = queryParam(url, "q");
  if (!q) return error("Informe q.");
  const key = requiredSecret(env, "PEXELS_API_KEY", "PEXELS_API_KEY", "PEXELS_API");
  const endpoint = new URL("https://api.pexels.com/v1/search");
  endpoint.searchParams.set("query", q);
  endpoint.searchParams.set("per_page", String(limitParam(url, 12, 80)));
  return json(await upstream(endpoint, { headers: { Authorization: key } }));
}

async function pixabay(url, env) {
  const q = queryParam(url, "q");
  if (!q) return error("Informe q.");
  const key = requiredSecret(env, "PIXABAY_API_KEY", "PIXABAY_API_KEY", "PIXABAY_API");
  const endpoint = new URL("https://pixabay.com/api/");
  endpoint.searchParams.set("key", key);
  endpoint.searchParams.set("q", q);
  endpoint.searchParams.set("per_page", String(limitParam(url, 20, 200)));
  return json(await upstream(endpoint));
}

async function gnews(url, env) {
  const q = queryParam(url, "q");
  if (!q) return error("Informe q.");
  const key = requiredSecret(env, "GNEWS_API_KEY", "GNEWS_API_KEY", "GNEWS_API");
  const endpoint = new URL("https://gnews.io/api/v4/search");
  endpoint.searchParams.set("q", q);
  endpoint.searchParams.set("lang", queryParam(url, "lang", "pt"));
  endpoint.searchParams.set("max", String(limitParam(url, 10, 100)));
  endpoint.searchParams.set("apikey", key);
  return json(await upstream(endpoint));
}

async function guardian(url, env) {
  const q = queryParam(url, "q");
  if (!q) return error("Informe q.");
  const key = requiredSecret(env, "GUARDIAN_API_KEY", "GUARDIAN_API_KEY", "GUARDIAN");
  const endpoint = new URL("https://content.guardianapis.com/search");
  endpoint.searchParams.set("q", q);
  endpoint.searchParams.set("api-key", key);
  endpoint.searchParams.set("page-size", String(limitParam(url, 10, 50)));
  endpoint.searchParams.set("show-fields", "thumbnail,trailText");
  return json(await upstream(endpoint));
}

async function nasa(url, env) {
  const q = queryParam(url, "q");
  const key = secret(env, "NASA_API_KEY", "NASA_API");
  if (q) {
    const endpoint = new URL("https://images-api.nasa.gov/search");
    endpoint.searchParams.set("q", q);
    endpoint.searchParams.set("media_type", queryParam(url, "media_type", "image,video"));
    endpoint.searchParams.set("page_size", String(limitParam(url, 20, 100)));
    return json(await upstream(endpoint));
  }
  const endpoint = new URL("https://api.nasa.gov/planetary/apod");
  endpoint.searchParams.set("api_key", key || "DEMO_KEY");
  return json(await upstream(endpoint));
}

async function europeana(url, env) {
  const q = queryParam(url, "q");
  if (!q) return error("Informe q.");
  const key = requiredSecret(env, "EUROPEANA_API_KEY", "EUROPEANA_API_KEY", "EUROPEANA");
  const endpoint = new URL("https://api.europeana.eu/record/v2/search.json");
  endpoint.searchParams.set("wskey", key);
  endpoint.searchParams.set("query", q);
  endpoint.searchParams.set("rows", String(limitParam(url, 12, 100)));
  return json(await upstream(endpoint));
}

async function dpla(url, env) {
  const q = queryParam(url, "q");
  if (!q) return error("Informe q.");
  const key = requiredSecret(env, "DPLA_API_KEY", "DPLA_API_KEY", "DPLA_API");
  const endpoint = new URL("https://api.dp.la/v2/items");
  endpoint.searchParams.set("q", q);
  endpoint.searchParams.set("api_key", key);
  endpoint.searchParams.set("page_size", String(limitParam(url, 12, 100)));
  return json(await upstream(endpoint));
}

async function openLibrary(url) {
  const q = queryParam(url, "q") || queryParam(url, "title");
  if (!q) return error("Informe q.");
  const endpoint = new URL("https://openlibrary.org/search.json");
  endpoint.searchParams.set("q", q);
  endpoint.searchParams.set("limit", String(limitParam(url, 12, 100)));
  return json(await upstream(endpoint));
}

async function openMeteo(url) {
  const latitude = queryParam(url, "latitude");
  const longitude = queryParam(url, "longitude");
  if (!latitude || !longitude) return error("Informe latitude e longitude.");
  const endpoint = new URL("https://api.open-meteo.com/v1/forecast");
  endpoint.searchParams.set("latitude", latitude);
  endpoint.searchParams.set("longitude", longitude);
  endpoint.searchParams.set("current", "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m");
  endpoint.searchParams.set("timezone", "auto");
  return json(await upstream(endpoint));
}

async function spotifyToken(env) {
  const id = requiredSecret(env, "SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_ID", "SPOTIFY_ID");
  const clientSecret = requiredSecret(env, "SPOTIFY_CLIENT_SECRET", "SPOTIFY_CLIENT_SECRET", "SPOTIFY_SECRET");
  const basic = btoa(`${id}:${clientSecret}`);
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error_description || "Spotify token error");
  return data.access_token;
}

async function spotify(url, env) {
  const q = queryParam(url, "q");
  if (!q) return error("Informe q.");
  const token = await spotifyToken(env);
  const endpoint = new URL("https://api.spotify.com/v1/search");
  endpoint.searchParams.set("q", q);
  endpoint.searchParams.set("type", queryParam(url, "type", "track,artist,album"));
  endpoint.searchParams.set("limit", String(limitParam(url, 10, 50)));
  return json(await upstream(endpoint, { headers: { Authorization: `Bearer ${token}` } }));
}

async function vimeo(url, env) {
  const q = queryParam(url, "q");
  if (!q) return error("Informe q.");
  const token = requiredSecret(env, "VIMEO_ACCESS_TOKEN", "VIMEO_ACCESS_TOKEN", "VIMEO_API_KEY", "VIMEO_API");
  const endpoint = new URL("https://api.vimeo.com/videos");
  endpoint.searchParams.set("query", q);
  endpoint.searchParams.set("per_page", String(limitParam(url, 10, 100)));
  return json(await upstream(endpoint, { headers: { Authorization: `Bearer ${token}` } }));
}

async function twitchAppToken(env) {
  const clientId = requiredSecret(env, "TWITCH_CLIENT_ID", "TWITCH_ID");
  const accessToken = secret(env, "TWITCH_ACCESS_TOKEN", "TWITCH_TOKEN");
  if (accessToken) return { clientId, accessToken };
  const clientSecret = secret(env, "TWITCH_CLIENT_SECRET", "TWITCH_SECRET");
  if (!clientSecret) throw new Error("Twitch precisa de TWITCH_ACCESS_TOKEN ou TWITCH_CLIENT_SECRET no Cloudflare Worker.");
  const endpoint = new URL("https://id.twitch.tv/oauth2/token");
  endpoint.searchParams.set("client_id", clientId);
  endpoint.searchParams.set("client_secret", clientSecret);
  endpoint.searchParams.set("grant_type", "client_credentials");
  const data = await upstream(endpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" } });
  return { clientId, accessToken: data.access_token };
}

async function twitch(url, env) {
  const q = queryParam(url, "q");
  if (!q) return error("Informe q para buscar canais/streams Twitch.");
  const { clientId, accessToken } = await twitchAppToken(env);
  const endpoint = new URL("https://api.twitch.tv/helix/search/channels");
  endpoint.searchParams.set("query", q);
  endpoint.searchParams.set("first", String(limitParam(url, 12, 100)));
  return json(await upstream(endpoint, {
    headers: { "Client-Id": clientId, Authorization: `Bearer ${accessToken}` },
  }));
}

async function elevenlabs(url, env) {
  const key = requiredSecret(env, "ELEVENLABS_API_KEY", "ELEVENLABS_API", "ELEVENLABS");
  const text = queryParam(url, "text");
  if (!text) return error("Informe text.");
  const voice = queryParam(url, "voice", "21m00Tcm4TlvDq8ikWAM");
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
  });
  if (!response.ok) return error(`ElevenLabs HTTP ${response.status}`, response.status);
  return new Response(response.body, { status: 200, headers: { ...CORS_HEADERS, "content-type": "audio/mpeg", "cache-control": "no-store" } });
}

async function aiJson(request) {
  if (request.method !== "POST") return {};
  try { return await request.json(); } catch { throw new Error("JSON inválido."); }
}

async function gemini(url, env, request) {
  const key = requiredSecret(env, "GEMINI_API_KEY", "GEMINI_API_KEY", "GEMINI_API");
  const body = await aiJson(request);
  const prompt = body.prompt || queryParam(url, "prompt");
  if (!prompt) return error("Informe prompt.");
  const model = body.model || queryParam(url, "model", "gemini-2.5-flash");
  const endpoint = new URL(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`);
  endpoint.searchParams.set("key", key);
  return json(await upstream(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  }));
}

async function groq(url, env, request) {
  const key = requiredSecret(env, "GROQ_API_KEY", "GROQ_API_KEY", "GROQ_API");
  const body = await aiJson(request);
  const prompt = body.prompt || queryParam(url, "prompt");
  if (!prompt) return error("Informe prompt.");
  const model = body.model || queryParam(url, "model", "llama-3.3-70b-versatile");
  return json(await upstream("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
  }));
}

async function qwen(url, env, request) {
  const key = requiredSecret(env, "QWEN_API_KEY", "QWEN_API");
  const body = await aiJson(request);
  const prompt = body.prompt || queryParam(url, "prompt");
  if (!prompt) return error("Informe prompt.");
  const model = body.model || queryParam(url, "model", "qwen-plus");
  const endpoint = "https://dashscope-us.aliyuncs.com/compatible-mode/v1/chat/completions";
  return json(await upstream(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  }));
}

function health(env) {
  const providers = {
    youtube: !!secret(env, "YOUTUBE_API_KEY", "YOUTUBE_API", "YOUTUBE"),
    tmdb: !!secret(env, "TMDB_API_KEY", "TMDB_AF", "TMDB_API"),
    twitch: !!secret(env, "TWITCH_CLIENT_ID", "TWITCH_ID") && (!!secret(env, "TWITCH_ACCESS_TOKEN", "TWITCH_TOKEN") || !!secret(env, "TWITCH_CLIENT_SECRET", "TWITCH_SECRET")),
    vimeo: !!secret(env, "VIMEO_ACCESS_TOKEN", "VIMEO_API_KEY", "VIMEO_API"),
    pexels: !!secret(env, "PEXELS_API_KEY", "PEXELS_API"),
    pixabay: !!secret(env, "PIXABAY_API_KEY", "PIXABAY_API"),
    gnews: !!secret(env, "GNEWS_API_KEY", "GNEWS_API"),
    guardian: !!secret(env, "GUARDIAN_API_KEY", "GUARDIAN"),
    nasa: !!secret(env, "NASA_API_KEY", "NASA_API"),
    europeana: !!secret(env, "EUROPEANA_API_KEY", "EUROPEANA"),
    dpla: !!secret(env, "DPLA_API_KEY", "DPLA_API"),
    spotify: !!secret(env, "SPOTIFY_CLIENT_ID", "SPOTIFY_ID") && !!secret(env, "SPOTIFY_CLIENT_SECRET", "SPOTIFY_SECRET"),
    elevenlabs: !!secret(env, "ELEVENLABS_API_KEY", "ELEVENLABS_API", "ELEVENLABS"),
    gemini: !!secret(env, "GEMINI_API_KEY", "GEMINI_API"),
    groq: !!secret(env, "GROQ_API_KEY", "GROQ_API"),
    qwen: !!secret(env, "QWEN_API_KEY", "QWEN_API"),
  };
  return json({ ok: true, service: "oio-tv-api", version: "1.0.0", providers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
    try {
      if (url.pathname === "/" || url.pathname === "/health") return health(env);
      if (url.pathname === "/youtube/search") return await youtube(url, env);
      if (url.pathname === "/tmdb/search") return await tmdb(url, env);
      if (url.pathname === "/pexels/search") return await pexels(url, env);
      if (url.pathname === "/pixabay/search") return await pixabay(url, env);
      if (url.pathname === "/gnews/search") return await gnews(url, env);
      if (url.pathname === "/guardian/search") return await guardian(url, env);
      if (url.pathname === "/nasa/search") return await nasa(url, env);
      if (url.pathname === "/europeana/search") return await europeana(url, env);
      if (url.pathname === "/dpla/search") return await dpla(url, env);
      if (url.pathname === "/openlibrary/search") return await openLibrary(url);
      if (url.pathname === "/openmeteo/weather") return await openMeteo(url);
      if (url.pathname === "/spotify/search") return await spotify(url, env);
      if (url.pathname === "/vimeo/search") return await vimeo(url, env);
      if (url.pathname === "/twitch/search") return await twitch(url, env);
      if (url.pathname === "/elevenlabs/tts") return await elevenlabs(url, env);
      if (url.pathname === "/ai/gemini") return await gemini(url, env, request);
      if (url.pathname === "/ai/groq") return await groq(url, env, request);
      if (url.pathname === "/ai/qwen") return await qwen(url, env, request);

      return error("Rota não encontrada.", 404);
    } catch (e) {
      console.error("OIO API error", e);
      return error(e?.message || "Erro interno do Worker.", e?.status >= 400 ? e.status : 500);
    }
  },
};
