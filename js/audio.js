const WORKER = String((window.TVOIO_CONFIG && window.TVOIO_CONFIG.apiBaseUrl) || "https://oio-tv-api.detiillimichel.workers.dev").replace(/\/$/, "");
const AUDIUS = "https://discoveryprovider.audius.co/v1";
const state = { mode: "trending", tracks: [], current: null };
const $ = (id) => document.getElementById(id);
const audio = $("audio");

function escapeHtml(value = "") { return String(value).replace(/[&<>\"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function artwork(track) { return track?.artwork?.['150x150'] || track?.artwork?.['480x480'] || track?.artwork?.['1000x1000'] || ""; }
function artist(track) { return track?.user?.name || track?.user?.handle || track?.artist_name || "Artista Audius"; }
function normalize(data) { return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []; }
function setApiState(kind, text) { const el = $("api-state"); el.className = `api-state ${kind || ""}`; el.querySelector("span").textContent = text; }
function showMessage(text, error = false) { const el = $("message"); el.hidden = !text; el.className = `message${error ? " error" : ""}`; el.textContent = text || ""; }

async function getJson(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { Accept: "application/json", ...(options.headers || {}) } });
  const text = await response.text();
  let data = null; try { data = text ? JSON.parse(text) : null; } catch {}
  if (!response.ok) throw new Error(data?.error || data?.message || `HTTP ${response.status}`);
  return data;
}

async function worker(path) { return getJson(`${WORKER}${path}`); }
async function searchTracks(query) {
  try { return { data: normalize(await worker(`/audius/search?q=${encodeURIComponent(query)}&limit=24`)), source: "Cloudflare Worker" }; }
  catch (workerError) {
    const data = await getJson(`${AUDIUS}/tracks/search?query=${encodeURIComponent(query)}&limit=24`);
    return { data: normalize(data), source: "Audius discovery API", fallback: workerError.message };
  }
}
async function trendingTracks() {
  try { return { data: normalize(await worker(`/audius/trending?limit=24`)), source: "Cloudflare Worker" }; }
  catch (workerError) {
    const data = await getJson(`${AUDIUS}/tracks/trending?limit=24`);
    return { data: normalize(data), source: "Audius discovery API", fallback: workerError.message };
  }
}

function render() {
  const root = $("tracks");
  if (!state.tracks.length) { root.innerHTML = `<div class="loading">Nenhuma faixa encontrada.</div>`; return; }
  root.innerHTML = state.tracks.map((track, index) => {
    const title = track?.title || "Faixa sem título";
    const image = artwork(track);
    const handle = track?.user?.handle ? `@${track.user.handle}` : artist(track);
    return `<article class="track"><img class="cover" src="${escapeHtml(image)}" alt="" loading="lazy"><div class="track-info"><strong title="${escapeHtml(title)}">${escapeHtml(title)}</strong><span title="${escapeHtml(handle)}">${escapeHtml(handle)}</span></div><div class="track-actions"><button class="mini-play" type="button" data-index="${index}" aria-label="Tocar ${escapeHtml(title)}">▶</button><a class="open" href="https://audius.co/${escapeHtml(track?.user?.handle || "")}/${escapeHtml(track?.permalink || "")}" target="_blank" rel="noopener">Abrir</a></div></article>`;
  }).join("");
  root.querySelectorAll(".mini-play").forEach(button => button.addEventListener("click", () => play(state.tracks[Number(button.dataset.index)])));
}

function streamUrl(track) {
  const id = encodeURIComponent(track?.id || track?.track_id || "");
  return `${AUDIUS}/tracks/${id}/stream`;
}
function play(track) {
  if (!track?.id && !track?.track_id) return;
  const image = artwork(track);
  $("player-title").textContent = track.title || "Reproduzindo";
  $("player-artist").textContent = artist(track);
  $("player-art").style.backgroundImage = image ? `url("${image.replace(/"/g, "")}")` : "";
  $("player-art").style.backgroundSize = "cover";
  audio.src = streamUrl(track);
  audio.play().then(() => { $("play-pause").textContent = "❚❚"; }).catch(() => showMessage("O navegador bloqueou a reprodução automática. Toque novamente em ▶.", true));
  state.current = track;
}

async function load(mode, query = "") {
  state.mode = mode; $("tracks").innerHTML = `<div class="loading">Carregando músicas…</div>`; showMessage("");
  try {
    const result = mode === "search" ? await searchTracks(query) : await trendingTracks();
    state.tracks = result.data; $("result-count").textContent = `${state.tracks.length} faixas · ${result.source}`; setApiState("ok", result.source === "Cloudflare Worker" ? "Worker online" : "Audius online"); render();
    if (result.fallback) console.info("Worker Audius fallback:", result.fallback);
  } catch (error) {
    state.tracks = []; $("result-count").textContent = "0 faixas"; setApiState("bad", "Áudio indisponível"); showMessage(`Não foi possível carregar o áudio: ${error.message}`, true); render();
  }
}

$("search-form").addEventListener("submit", event => { event.preventDefault(); const query = $("query").value.trim(); if (!query) return load("trending"); document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b.dataset.mode === "search")); load("search", query); });
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => { document.querySelectorAll(".filter").forEach(b => b.classList.remove("active")); button.classList.add("active"); const query = $("query").value.trim(); load(button.dataset.mode, query); }));
$("play-pause").addEventListener("click", () => { if (!audio.src) return; if (audio.paused) { audio.play(); $("play-pause").textContent = "❚❚"; } else { audio.pause(); $("play-pause").textContent = "▶"; } });
$("volume").addEventListener("input", event => { audio.volume = Number(event.target.value); });
audio.addEventListener("ended", () => { $("play-pause").textContent = "▶"; });
audio.volume = 0.9;
load("trending");
