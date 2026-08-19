const CONFIG = window.TVOIO_CONFIG || {};
const API = String(CONFIG.apiBaseUrl || "").replace(/\/$/, "");

const esc = (value = "") => String(value).replace(/[&<>\"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
function icon(name, size = 17) { return `<i data-lucide="${esc(name)}" width="${size}" height="${size}"></i>`; }
function refreshIcons() { if (window.lucide) window.lucide.createIcons(); }
function setStatus(kind, text) { const pill = document.getElementById("api-status"); if (!pill) return; pill.className = `status-pill ${kind}`; pill.innerHTML = `<span class="status-dot"></span>${esc(text)}`; }

async function apiFetch(path, options = {}) {
  if (!API) throw new Error("Gateway OIO TV não configurado.");
  const response = await fetch(`${API}${path}`, { ...options, headers: { Accept: "application/json", ...(options.headers || {}) } });
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
    const count = document.getElementById("provider-count"); if (count) count.textContent = String(active);
    document.querySelectorAll(".provider-tab").forEach(tab => { const on = providers[tab.dataset.provider]; tab.classList.toggle("disabled-provider", on === false); });
  } catch (error) {
    setStatus("bad", "API indisponível");
    const count = document.getElementById("provider-count"); if (count) count.textContent = "0";
    console.warn("TV OIO health", error);
  }
}

function openPlayer({ source, id, title, meta = "" }) {
  const modal = document.getElementById("player-modal"); const frame = document.getElementById("player-frame");
  if (!modal || !frame) return;
  document.getElementById("player-title").textContent = title || "Reproduzindo";
  document.getElementById("player-meta").textContent = meta || source;
  if (source === "youtube") frame.innerHTML = `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0" title="${esc(title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  else if (source === "vimeo") frame.innerHTML = `<iframe src="https://player.vimeo.com/video/${encodeURIComponent(id)}?autoplay=1" title="${esc(title)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  else frame.innerHTML = `<div class="external-player"><div>${icon(source === "spotify" ? "music-2" : "external-link", 30)}</div><h3>Conteúdo externo</h3><p>Esta fonte entrega o conteúdo em sua própria página.</p><a href="${esc(id || "#")}" target="_blank" rel="noopener noreferrer">Abrir conteúdo</a></div>`;
  modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open"); refreshIcons();
}
function closePlayer() { const modal = document.getElementById("player-modal"); if (!modal) return; modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); document.getElementById("player-frame").innerHTML = ""; document.body.classList.remove("modal-open"); }

function renderYoutubeCard(item) {
  const videoId = item?.id?.videoId; if (!videoId) return "";
  const title = item?.snippet?.title || "Vídeo sem título"; const channel = item?.snippet?.channelTitle || "YouTube";
  const thumb = item?.snippet?.thumbnails?.high?.url || item?.snippet?.thumbnails?.medium?.url || `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
  return `<article class="card-video" data-source="youtube" data-id="${esc(videoId)}" data-title="${esc(title)}" data-meta="${esc(channel)}" tabindex="0" role="button" aria-label="Reproduzir ${esc(title)}"><div class="thumbnail-wrapper"><img src="${esc(thumb)}" alt="" loading="lazy"><div class="play-overlay">${icon("play-circle",22)}</div></div><p title="${esc(title)}">${esc(title)}</p><small>${esc(channel)}</small></article>`;
}
function bindVideoCards(root = document) { root.querySelectorAll("[data-source][data-id]").forEach(card => { if (card.dataset.bound) return; card.dataset.bound = "1"; const open = () => openPlayer({ source: card.dataset.source, id: card.dataset.id, title: card.dataset.title, meta: card.dataset.meta }); card.addEventListener("click", open); card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }); }); }

window.criarEstruturaCanal = function (tituloHeader, categorias, prefixoId) {
  return `<div class="canal-wrapper"><div class="canal-banner"><div><div class="eyebrow">${icon("tv",14)} Canal</div><h2>${esc(tituloHeader)}</h2><p>Conteúdo organizado por tema e carregado pelo gateway seguro do TV OIO.</p></div></div>${categorias.map((cat, idx) => `<section class="categoria-section"><h3>${icon(cat.icone || "play",16)} ${esc(cat.titulo)}</h3><div class="carrossel-horizontal" id="carrossel-${esc(prefixoId)}-${idx}"><div class="loading-msg">Carregando conteúdo…</div></div></section>`).join("")}</div>`;
};
window.carregarVideosAPI = async function (categorias, prefixoId) {
  if (!API) return;
  await Promise.all(categorias.map(async (cat, idx) => {
    const section = document.getElementById(`carrossel-${prefixoId}-${idx}`); if (!section) return;
    try { const data = await apiFetch(`/youtube/search?q=${encodeURIComponent(cat.query)}&maxResults=10`); const items = Array.isArray(data?.items) ? data.items : []; section.innerHTML = items.map(renderYoutubeCard).filter(Boolean).join("") || `<div class="empty-state">Nenhum vídeo encontrado para esta categoria.</div>`; bindVideoCards(section); refreshIcons(); }
    catch (error) { console.error("TV OIO API", error); section.innerHTML = `<div class="empty-state error-state"><strong>Não foi possível carregar esta categoria.</strong><br><span>${esc(error.message || "API indisponível")}</span></div>`; }
  }));
};

function providerEndpoint(provider, query) {
  const q = encodeURIComponent(query);
  return ({ youtube:`/youtube/search?q=${q}&maxResults=18`, vimeo:`/vimeo/search?q=${q}&maxResults=18`, spotify:`/spotify/search?q=${q}&type=track,artist,album&limit=18`, pexels:`/pexels/search?q=${q}&per_page=18`, pixabay:`/pixabay/search?q=${q}&per_page=18`, tmdb:`/tmdb/search?q=${q}&language=pt-BR`, nasa:`/nasa/search?q=${q}&media_type=image,video&page_size=18` })[provider];
}

function providerCards(provider, data) {
  if (provider === "youtube") return (data?.items || []).map(renderYoutubeCard).filter(Boolean).join("").replaceAll("card-video", "result-card card-video");
  if (provider === "vimeo") return (data?.data || []).map(item => { const id=String(item?.uri||"").split("/").pop(); if(!id)return""; const title=item?.name||"Vídeo Vimeo"; const thumb=item?.pictures?.sizes?.at?.(-1)?.link||""; return `<article class="result-card provider-card" data-source="vimeo" data-id="${esc(id)}" data-title="${esc(title)}" data-meta="Vimeo">${thumb?`<img src="${esc(thumb)}" alt="" loading="lazy">`:`<div class="provider-placeholder">${icon("video",28)}</div>`}<div class="result-body"><h3>${esc(title)}</h3><small>Vimeo</small></div></article>`; }).join("");
  if (provider === "spotify") { const values=[...(data?.tracks?.items||[]),...(data?.artists?.items||[]),...(data?.albums?.items||[])]; return values.slice(0,18).map(value=>{const title=value?.name||"Spotify";const image=value?.album?.images?.[0]?.url||value?.images?.[0]?.url||"";const href=value?.external_urls?.spotify||"https://open.spotify.com/";return `<article class="result-card provider-card" data-source="spotify" data-id="${esc(href)}" data-title="${esc(title)}" data-meta="Spotify">${image?`<img src="${esc(image)}" alt="" loading="lazy">`:`<div class="provider-placeholder music">${icon("music-2",28)}</div>`}<div class="result-body"><h3>${esc(title)}</h3><small>Spotify · ${esc(value?.artists?.[0]?.name||"Música")}</small></div></article>`;}).join(""); }
  if (provider === "pexels") return (data?.photos||[]).map(photo=>{const title=photo?.alt||"Imagem Pexels";const href=photo?.url||"#";return `<article class="result-card provider-card" data-source="pexels" data-id="${esc(href)}" data-title="${esc(title)}" data-meta="Pexels"><img src="${esc(photo?.src?.medium||photo?.src?.original||"")}" alt="${esc(title)}" loading="lazy"><div class="result-body"><h3>${esc(title)}</h3><small>Pexels · ${esc(photo?.photographer||"")}</small></div></article>`;}).join("");
  if (provider === "pixabay") return (data?.hits||[]).map(hit=>{const title=hit?.tags||"Imagem Pixabay";const href=hit?.pageURL||"#";return `<article class="result-card provider-card" data-source="pixabay" data-id="${esc(href)}" data-title="${esc(title)}" data-meta="Pixabay"><img src="${esc(hit?.webformatURL||hit?.previewURL||"")}" alt="${esc(title)}" loading="lazy"><div class="result-body"><h3>${esc(title)}</h3><small>Pixabay</small></div></article>`;}).join("");
  if (provider === "tmdb") return (data?.results||[]).slice(0,18).map(movie=>{const title=movie?.title||movie?.name||"Filme / Série";const poster=movie?.poster_path?`https://image.tmdb.org/t/p/w500${movie.poster_path}`:"";const href=`https://www.themoviedb.org/${movie?.media_type||"movie"}/${movie?.id||""}`;return `<article class="result-card provider-card" data-source="tmdb" data-id="${esc(href)}" data-title="${esc(title)}" data-meta="TMDB">${poster?`<img src="${esc(poster)}" alt="" loading="lazy">`:`<div class="provider-placeholder">${icon("clapperboard",28)}</div>`}<div class="result-body"><h3>${esc(title)}</h3><small>TMDB · ${esc(movie?.media_type||"conteúdo")}</small></div></article>`;}).join("");
  if (provider === "nasa") return (data?.collection?.items||[]).slice(0,18).map(entry=>{const meta=entry?.data?.[0]||{};const image=entry?.links?.find(link=>link.rel==="preview")?.href||"";const title=meta?.title||"Conteúdo NASA";const href=entry?.href||"#";return `<article class="result-card provider-card" data-source="nasa" data-id="${esc(href)}" data-title="${esc(title)}" data-meta="NASA">${image?`<img src="${esc(image)}" alt="" loading="lazy">`:`<div class="provider-placeholder">${icon("orbit",28)}</div>`}<div class="result-body"><h3>${esc(title)}</h3><small>NASA · ${esc(meta?.media_type||"mídia")}</small></div></article>`;}).join("");
  return "";
}

async function runSearch(query, provider) {
  const area=document.getElementById("search-results"),grid=document.getElementById("result-grid"); if(!area||!grid)return; area.classList.add("active");
  const labels={youtube:"YouTube",vimeo:"Vimeo",spotify:"Spotify",pexels:"Pexels",pixabay:"Pixabay",tmdb:"Filmes",nasa:"NASA"};
  document.getElementById("results-title").textContent=`${labels[provider]||provider} · ${query}`; grid.innerHTML=`<div class="loading-msg">Buscando em ${esc(labels[provider]||provider)}…</div>`;
  try { const data=await apiFetch(providerEndpoint(provider,query)); grid.innerHTML=providerCards(provider,data)||`<div class="empty-state">Nenhum resultado encontrado.</div>`; bindVideoCards(area); refreshIcons(); }
  catch(error) { grid.innerHTML=`<div class="empty-state error-state"><strong>Esta fonte não respondeu.</strong><br><span>${esc(error.message||"Verifique a configuração do Worker.")}</span></div>`; }
}

function initNavigation() {
  document.querySelectorAll(".nav-btn").forEach(button=>button.addEventListener("click",()=>{document.getElementById("search-results")?.classList.remove("active");window.carregarCanal(button.dataset.channel);}));
  document.querySelectorAll(".provider-tab").forEach(button=>button.addEventListener("click",()=>{document.querySelectorAll(".provider-tab").forEach(tab=>tab.classList.remove("active"));button.classList.add("active");document.getElementById("search-input")?.focus();}));
  const input=document.getElementById("search-input"),clear=document.getElementById("search-clear"),form=document.getElementById("search-form"); if(!input)return;
  form?.addEventListener("submit",event=>{event.preventDefault();const q=input.value.trim();if(!q)return;const provider=document.querySelector(".provider-tab.active")?.dataset.provider||"youtube";runSearch(q,provider);document.getElementById("search-results")?.scrollIntoView({behavior:"smooth",block:"start"});});
  clear?.addEventListener("click",()=>{input.value="";input.focus();document.getElementById("search-results")?.classList.remove("active");});
}
function initPlayer(){document.querySelectorAll("[data-close-player]").forEach(el=>el.addEventListener("click",closePlayer));document.addEventListener("keydown",e=>{if(e.key==="Escape")closePlayer();});}

window._channelLoaders={};
window.carregarCanal=function(name){const container=document.getElementById("app-container");if(!container)return;document.querySelectorAll(".nav-btn").forEach(button=>button.classList.toggle("active",button.dataset.channel===name));container.innerHTML=`<div class="loading-msg">Abrindo canal…</div>`;try{const loader=window._channelLoaders[name];if(!loader)throw new Error(`Canal ${name} não carregado.`);loader(container);refreshIcons();}catch(error){console.error(error);container.innerHTML=`<div class="empty-state">Não foi possível abrir este canal.</div>`;}};
window.addEventListener("DOMContentLoaded",()=>{initNavigation();initPlayer();refreshIcons();checkHealth();});
