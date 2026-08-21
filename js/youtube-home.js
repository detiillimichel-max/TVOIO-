(() => {
  const CONFIG = window.TVOIO_CONFIG || {};
  const API = String(CONFIG.apiBaseUrl || "").replace(/\/$/, "");

  const esc = (value = "") => String(value).replace(/[&<>\"]/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  }[ch]));

  function icon(name, size = 18) {
    return `<i data-lucide="${esc(name)}" width="${size}" height="${size}"></i>`;
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  async function searchYouTube(query, limit = 12) {
    if (!API) throw new Error("Gateway do TV OIO não configurado.");
    const response = await fetch(`${API}/youtube/search?q=${encodeURIComponent(query)}&maxResults=${limit}`, {
      headers: { Accept: "application/json" }
    });
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch {}
    if (!response.ok) throw new Error(data?.error || `YouTube HTTP ${response.status}`);
    return Array.isArray(data?.items) ? data.items : [];
  }

  function card(item) {
    const id = item?.id?.videoId;
    if (!id) return "";
    const snippet = item?.snippet || {};
    const title = snippet.title || "Vídeo do YouTube";
    const channel = snippet.channelTitle || "YouTube";
    const thumb = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || `https://img.youtube.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
    return `<article class="youtube-home-card" data-youtube-id="${esc(id)}" data-youtube-title="${esc(title)}" data-youtube-channel="${esc(channel)}" tabindex="0" role="button" aria-label="Assistir ${esc(title)}">
      <div class="youtube-home-thumb"><img src="${esc(thumb)}" alt="" loading="lazy"><span class="youtube-home-play">${icon("play", 18)}</span></div>
      <div class="youtube-home-body"><h3 title="${esc(title)}">${esc(title)}</h3><p>${esc(channel)}</p></div>
    </article>`;
  }

  function bind(root) {
    root.querySelectorAll(".youtube-home-card").forEach(cardEl => {
      if (cardEl.dataset.bound) return;
      cardEl.dataset.bound = "1";
      const open = () => {
        const fn = window.openPlayer;
        if (typeof fn === "function") {
          fn({ source: "youtube", id: cardEl.dataset.youtubeId, title: cardEl.dataset.youtubeTitle, meta: cardEl.dataset.youtubeChannel });
          return;
        }
        window.open(`https://www.youtube.com/watch?v=${encodeURIComponent(cardEl.dataset.youtubeId)}`, "_blank", "noopener,noreferrer");
      };
      cardEl.addEventListener("click", open);
      cardEl.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
      });
    });
  }

  async function loadRow(row) {
    const query = row.dataset.query;
    const target = row.querySelector(".youtube-home-track");
    if (!target || !query) return;
    try {
      const items = await searchYouTube(query, 12);
      target.innerHTML = items.map(card).filter(Boolean).join("") || `<div class="youtube-home-empty">Nenhum vídeo encontrado nesta fileira.</div>`;
      bind(target);
      refreshIcons();
    } catch (error) {
      target.innerHTML = `<div class="youtube-home-error"><strong>YouTube não respondeu.</strong><span>${esc(error.message || "Verifique o Cloudflare Worker.")}</span></div>`;
    }
  }

  function init() {
    document.querySelectorAll(".youtube-home-row").forEach(loadRow);
  }

  window.addEventListener("DOMContentLoaded", init);
})();
