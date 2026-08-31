import { readFile, writeFile, mkdir } from "node:fs/promises";

const API_KEY = process.env.YOUTUBE_API_KEY;
const OUTPUT = new URL("../data/tv-live-data.json", import.meta.url);

/**
 * TV OIO — live discovery, sem Cloudflare Worker.
 *
 * Arquitetura:
 * - Grupo A: canal 24/7 -> channel-live, custo zero de API.
 * - Grupo B: programação previsível -> RSS primeiro.
 * - Grupo C: eventos/esportes -> RSS primeiro; a Action define a frequência.
 * - videos.list valida os candidatos em lotes de até 50 IDs (1 unidade por chamada).
 *
 * IMPORTANTE: não colocar YOUTUBE_API_KEY no frontend.
 */

const CHANNELS = [
  // Grupo A — preencher somente com Channel IDs oficialmente confirmados.
  // Enquanto o ID não estiver confirmado, o canal não é publicado como channel-live.
  { key: "record-news", name: "Record News", group: "A", channelId: "" },
  { key: "cnn-brasil", name: "CNN Brasil", group: "A", channelId: "UCvdwhh_fDyWccR42-rReZLw" },
  { key: "sbt-news", name: "SBT News", group: "A", channelId: "" },

  // Grupo B — a Action roda em horários definidos no workflow.
  { key: "band", name: "Band", group: "B", channelId: "", searchQuery: "Band ao vivo" },
  { key: "tv-cultura", name: "TV Cultura", group: "B", channelId: "", searchQuery: "TV Cultura ao vivo" },

  // Grupo C — eventos esportivos. O RSS é o filtro barato; não fazemos search.list aqui.
  { key: "cazetv", name: "CazéTV", group: "C", channelId: "UCZiYbVptd3PVPf4f6eR6UaQ" }
];

const unique = values => [...new Set(values.filter(Boolean))];

async function readPrevious() {
  try {
    return JSON.parse(await readFile(OUTPUT, "utf8"));
  } catch {
    return {};
  }
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "TV-OIO-Live-Updater/1.0",
      accept: "application/rss+xml, application/xml, text/xml, */*"
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} em ${url}`);
  return response.text();
}

async function readRss(channelId) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
  const xml = await fetchText(url);
  const ids = [];
  const regex = /<yt:videoId>([^<]+)<\/yt:videoId>/g;
  for (const match of xml.matchAll(regex)) ids.push(match[1]);
  return unique(ids).slice(0, 15);
}

function chunks(values, size) {
  const result = [];
  for (let i = 0; i < values.length; i += size) result.push(values.slice(i, i + size));
  return result;
}

async function videosList(ids) {
  if (!ids.length) return [];
  if (!API_KEY) throw new Error("YOUTUBE_API_KEY não configurada.");

  const all = [];
  for (const batch of chunks(ids, 50)) {
    const params = new URLSearchParams({
      part: "snippet,liveStreamingDetails",
      id: batch.join(","),
      key: API_KEY
    });
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body?.error?.message || `YouTube videos.list HTTP ${response.status}`);
    }
    all.push(...(body.items || []));
  }
  return all;
}

function isLive(video) {
  return video?.snippet?.liveBroadcastContent === "live";
}

async function resolveGroup(channel, previous) {
  if (channel.group === "A") {
    if (!channel.channelId) return null;
    return { mode: "channel-live", channelId: channel.channelId };
  }

  if (!channel.channelId) {
    console.warn(`[${channel.key}] sem channelId confirmado; RSS ignorado.`);
    return previous || null;
  }

  let rssIds = [];
  try {
    rssIds = await readRss(channel.channelId);
  } catch (error) {
    console.warn(`[${channel.key}] RSS indisponível: ${error.message}`);
  }

  // O último vídeo conhecido entra no lote também. Assim uma live que continua
  // ativa não depende de o RSS ter acabado de mudar.
  const candidateIds = unique([
    ...rssIds,
    previous?.mode === "video" ? previous.videoId : null
  ]);

  if (!candidateIds.length) return previous || null;

  const videos = await videosList(candidateIds);
  const live = videos.find(isLive);
  if (!live) return null;

  return {
    mode: "video",
    videoId: live.id,
    channelId: live.snippet?.channelId || channel.channelId
  };
}

async function main() {
  const previous = await readPrevious();
  const output = { ...previous };

  for (const channel of CHANNELS) {
    try {
      const resolved = await resolveGroup(channel, previous[channel.key]);
      if (resolved) output[channel.key] = resolved;
      else delete output[channel.key];
    } catch (error) {
      // Falha de rede/API nunca apaga uma entrada válida já publicada.
      console.error(`[${channel.key}] ${error.message}`);
      if (!previous[channel.key]) delete output[channel.key];
    }
  }

  output._meta = {
    generatedAt: new Date().toISOString(),
    source: "github-actions",
    architecture: "rss-prefilter + youtube-videos-batch",
    quotaStrategy: "search.list disabled by default"
  };

  await mkdir(new URL("../data/", import.meta.url), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`TV OIO: ${Object.keys(output).filter(key => !key.startsWith("_")).length} emissora(s) publicada(s).`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
