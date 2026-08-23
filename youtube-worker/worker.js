const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "Content-Type, Accept",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS,
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "public, max-age=60",
    },
  });
}

function error(message, status = 400) {
  return json({ ok: false, error: message }, status);
}

async function searchYouTube(url, env) {
  const q = (url.searchParams.get("q") || "").trim();
  if (!q) return error("Informe q.");

  const key = typeof env.YOUTUBE_API_KEY === "string"
    ? env.YOUTUBE_API_KEY.trim()
    : "";

  if (!key) return error("YOUTUBE_API_KEY não configurada no Worker.", 500);

  const maxResults = Math.max(
    1,
    Math.min(50, Number.parseInt(url.searchParams.get("maxResults") || "12", 10) || 12),
  );

  const endpoint = new URL("https://www.googleapis.com/youtube/v3/search");
  endpoint.searchParams.set("part", "snippet");
  endpoint.searchParams.set("type", "video");
  endpoint.searchParams.set("q", q);
  endpoint.searchParams.set("maxResults", String(maxResults));
  endpoint.searchParams.set("regionCode", url.searchParams.get("regionCode") || "BR");
  endpoint.searchParams.set("relevanceLanguage", url.searchParams.get("relevanceLanguage") || "pt");
  endpoint.searchParams.set("key", key);

  const response = await fetch(endpoint);
  const text = await response.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    return error("Resposta inválida do YouTube.", 502);
  }

  if (!response.ok) {
    const message = data?.error?.message || `YouTube HTTP ${response.status}`;
    return error(message, response.status);
  }

  return json({ ok: true, items: data.items || [], nextPageToken: data.nextPageToken || null });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);

    try {
      if (url.pathname === "/health") {
        return json({ ok: true, service: "tvoio-youtube-api", youtube: true });
      }

      if (url.pathname === "/youtube/search") {
        return await searchYouTube(url, env);
      }

      return error("Rota não encontrada.", 404);
    } catch (e) {
      return error(e?.message || "Erro interno.", 500);
    }
  },
};
