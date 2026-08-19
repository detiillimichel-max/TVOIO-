const CONFIG = window.TVOIO_CONFIG || {};
const API = String(CONFIG.apiBaseUrl || "").replace(/\/$/, "");

const esc = (value = "") => String(value).replace(/[&<>\"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));

function icon(name, size = 17) {
  return `<i data-lucide="${esc(name)}" width="${size}" height="${size}"></i>`;
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function setStatus(kind, text) {
  const pill = document.getElementById("api-status");
  if (!pill) return;
  pill.className = `status-pill ${kind}`;
  pill.innerHTML = `<span class="status-dot"></span>${esc(text)}`;
}

async function apiFetch(path, options = {}) {
  if (!API) throw new Error("Gateway OIO TV não configurado.");
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { Accept: "application/json", ...(options.headers || {}) },
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
  return data;
}

async function checkHealth() {
  try {
    const data = await apiFetch("/health");
    const providers = data?.providers || {};
    const active = Object.values(providers).filter(Boolean).length;
    setStatus("ok", `API online · ${active} serviços`);
    const count = document.getElementById("provider-count");
    if (count) count.textContent = String(active);
  } catch {
    setStatus("bad", "API indisponível");
  }
}

function renderVideoCard(item) {
  const videoId = item?.id?.videoId;
  if (!videoId) return "";
  const title = item?.snippet?.title || "Vídeo sem título";
  const channel = item?.snippet?.channelTitle || "YouTube";
  const thumb = item?.snippet?.thumbnails?.high?.url || item?.snippet?.thumbnails?.medium?.url || `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
  return `<article class="card-video" data-video="${esc(videoId)}" tabindex="0" role="button" aria-label="Abrir ${esc(title)}">
    <div class="thumbnail-wrapper"><img src="${esc(thumb)}" alt="" loading="lazy"><div class="play-overlay">${icon("play-circle",22)}</div></div>
    <p title="${esc(title)}">${esc(title)}</p>
    <small style="display:block;padding:0 11px 11px;color:#738095;font-size:11px">${esc(channel)}</small>
  </article>`;
}

function bindVideoCards(root = document) {
  root.querySelectorAll("[data-video]").forEach(card => {
    const open = () => window.open(`https://www.youtube.com/watch?v=${encodeURIComponent(card.dataset.video)}`, "_blank", "noopener,noreferrer");
    card.addEventListener("click", open);
    card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } });
  });
}

window.criarEstruturaCanal = function (tituloHeader, categorias, prefixoId) {
  return `<div class="canal-wrapper">
    <div class="canal-banner">
      <div>
        <div class="eyebrow">${icon("tv",14)} Canal</div>
        <h2>${esc(tituloHeader)}</h2>
        <p>Conteúdo organizado por tema. Os vídeos são carregados pelo gateway seguro do TV OIO.</p>
      </div>
    </div>
    ${categorias.map((cat, idx) => `<section class="categoria-section">
      <h3>${icon(cat.icone || "play",16)} ${esc(cat.titulo)}</h3>
      <div class="carrossel-horizontal" id="carrossel-${esc(prefixoId)}-${idx}"><div class="loading-msg">Carregando conteúdo…</div></div>
    </section>`).join("")}
  </div>`;
};

window.carregarVideosAPI = async function (categorias, prefixoId) {
  if (!API) return;
  await Promise.all(categorias.map(async (cat, idx) => {
    const section = document.getElementById(`carrossel-${prefixoId}-${idx}`);
    if (!section) return;
    try {
      const data = await apiFetch(`/youtube/search?q=${encodeURIComponent(cat.query)}&maxResults=10`);
      const items = Array.isArray(data?.items) ? data.items : [];
      const cards = items.map(renderVideoCard).filter(Boolean).join("");
      section.innerHTML = cards || `<div class="empty-state">Nenhum conteúdo encontrado para esta categoria.</div>`;
      bindVideoCards(section);
      refreshIcons();
    } catch (error) {
      console.error("TV OIO API", error);
      section.innerHTML = `<div class="empty-state"><strong>Conteúdo temporariamente indisponível.</strong><br><span style="display:block;margin-top:6px;font-size:12px;color:#778497">Tente novamente em alguns segundos.</span></div>`;
    }
  }));
};

window._channelLoaders = {};
window.carregarCanal = function (name) {
  const container = document.getElementById("app-container");
  if (!container) return;
  document.querySelectorAll(".nav-btn").forEach(button => button.classList.toggle("active", button.dataset.channel === name));
  container.innerHTML = `<div class="loading-msg">Abrindo canal…</div>`;
  try {
    const loader = window._channelLoaders[name];
    if (!loader) throw new Error(`Canal ${name} não carregado.`);
    loader(container);
    refreshIcons();
  } catch (error) {
    console.error(error);
    container.innerHTML = `<div class="empty-state">Não foi possível abrir este canal.</div>`;
  }
};

async function runSearch(query) {
  const area = document.getElementById("search-results");
  const grid = document.getElementById("result-grid");
  if (!area || !grid) return;
  area.classList.add("active");
  grid.innerHTML = `<div class="loading-msg">Buscando “${esc(query)}”…</div>`;
  try {
    const data = await apiFetch(`/youtube/search?q=${encodeURIComponent(query)}&maxResults=18`);
    const items = Array.isArray(data?.items) ? data.items : [];
    grid.innerHTML = items.map(item => {
      const id = item?.id?.videoId;
      if (!id) return "";
      const title = item?.snippet?.title || "Vídeo";
      const channel = item?.snippet?.channelTitle || "YouTube";
      const thumb = item?.snippet?.thumbnails?.medium?.url || `https://img.youtube.com/vi/${encodeURIComponent(id)}/mqdefault.jpg`;
      return `<article class="result-card" data-video="${esc(id)}" tabindex="0"><img src="${esc(thumb)}" alt="" loading="lazy"><div class="result-body"><h3>${esc(title)}</h3><small>${esc(channel)}</small></div></article>`;
    }).join("") || `<div class="empty-state">Nenhum resultado encontrado.</div>`;
    bindVideoCards(area);
  } catch {
    grid.innerHTML = `<div class="empty-state">A busca não respondeu agora. Verifique o status da API e tente novamente.</div>`;
  }
}

function initNavigation() {
  document.querySelectorAll(".nav-btn").forEach(button => button.addEventListener("click", () => {
    document.getElementById("search-results")?.classList.remove("active");
    window.carregarCanal(button.dataset.channel);
  }));
  const input = document.getElementById("search-input");
  const clear = document.getElementById("search-clear");
  const form = document.getElementById("search-form");
  if (!input) return;
  form?.addEventListener("submit", event => {
    event.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    runSearch(q);
    document.getElementById("search-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  clear?.addEventListener("click", () => {
    input.value = "";
    input.focus();
    document.getElementById("search-results")?.classList.remove("active");
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  refreshIcons();
  checkHealth();
});
