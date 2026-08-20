const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Content-Type",
  "Access-Control-Max-Age": "86400",
};

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "public, max-age=60",
  ...CORS,
};

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extra },
  });
}

function fail(message, status = 400) {
  return json({ ok: false, error: message }, status, { "Cache-Control": "no-store" });
}

function requiredSecret(env, name) {
  const value = env[name];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Secret ${name} não configurado no Cloudflare Worker.`);
  }
  return value.trim();
}

function param(url, name, fallback = "") {
  return (url.searchParams.get(name) || fallback).trim();
}

function positiveInt(url, name, fallback, max) {
  const raw = url.searchParams.get(name);
  const value = raw === null ? fallback : Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(max, value));
}

async function youtubeFetch(endpoint) {
  const response = await fetch(endpoint);
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || `YouTube HTTP ${response.status}`);
  }
  return data;
}

async function search(url, env) {
  const q = param(url, "q");
  if (!q) return fail("Informe q.");
  const endpoint = new URL("https://www.googleapis.com/youtube/v3/search");
  endpoint.searchParams.set("part", "snippet");
  endpoint.searchParams.set("type", param(url, "type", "video"));
  endpoint.searchParams.set("q", q);
  endpoint.searchParams.set("maxResults", String(positiveInt(url, "maxResults", 10, 50)));
  endpoint.searchParams.set("regionCode", param(url, "regionCode", "BR"));
  endpoint.searchParams.set("relevanceLanguage", param(url, "relevanceLanguage", "pt"));
  endpoint.searchParams.set("safeSearch", param(url, "safeSearch", "moderate"));
  const categoryId = param(url, "videoCategoryId");
  if (categoryId) endpoint.searchParams.set("videoCategoryId", categoryId);
  const pageToken = param(url, "pageToken");
  if (pageToken) endpoint.searchParams.set("pageToken", pageToken);
  endpoint.searchParams.set("key", requiredSecret(env, "YOUTUBE_API_KEY"));
  return json(await youtubeFetch(endpoint));
}

async function videos(url, env) {
  const id = param(url, "id");
  if (!id) return fail("Informe id.");
  const endpoint = new URL("https://www.googleapis.com/youtube/v3/videos");
  endpoint.searchParams.set("part", param(url, "part", "snippet,contentDetails,statistics"));
  endpoint.searchParams.set("id", id);
  endpoint.searchParams.set("key", requiredSecret(env, "YOUTUBE_API_KEY"));
  return json(await youtubeFetch(endpoint));
}

async function channels(url, env) {
  const id = param(url, "id");
  if (!id) return fail("Informe id.");
  const endpoint = new URL("https://www.googleapis.com/youtube/v3/channels");
  endpoint.searchParams.set("part", "snippet,contentDetails,statistics");
  endpoint.searchParams.set("id", id);
  endpoint.searchParams.set("key", requiredSecret(env, "YOUTUBE_API_KEY"));
  return json(await youtubeFetch(endpoint));
}

async function categories(url, env) {
  const endpoint = new URL("https://www.googleapis.com/youtube/v3/videoCategories");
  endpoint.searchParams.set("part", "snippet");
  endpoint.searchParams.set("regionCode", param(url, "regionCode", "BR"));
  endpoint.searchParams.set("key", requiredSecret(env, "YOUTUBE_API_KEY"));
  return json(await youtubeFetch(endpoint));
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);
    try {
      if (url.pathname === "/" || url.pathname === "/health") {
        return json({
          ok: true,
          service: "oio-youtube-api",
          version: "1.0.0",
          provider: "youtube",
          configured: Boolean(typeof env.YOUTUBE_API_KEY === "string" && env.YOUTUBE_API_KEY.trim()),
        });
      }
      if (url.pathname === "/search") return await search(url, env);
      if (url.pathname === "/videos") return await videos(url, env);
      if (url.pathname === "/channels") return await channels(url, env);
      if (url.pathname === "/categories") return await categories(url, env);
      return fail("Rota não encontrada.", 404);
    } catch (error) {
      console.error("OIO YouTube API", error);
      return fail(error instanceof Error ? error.message : "Erro interno do Worker.", 500);
    }
  },
};
