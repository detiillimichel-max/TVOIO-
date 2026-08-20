(() => {
  const CATEGORIES = [
    { id: "all", label: "Todos", query: "TV OIO" },
    { id: "education", label: "Educação", query: "educação" },
    { id: "music", label: "Música", query: "música" },
    { id: "gaming", label: "Games", query: "games" },
    { id: "news", label: "Notícias", query: "notícias" },
    { id: "sports", label: "Esportes", query: "esportes" },
    { id: "science", label: "Ciência e tecnologia", query: "ciência tecnologia" },
    { id: "documentary", label: "Documentários", query: "documentário" },
    { id: "kids", label: "Infantil", query: "infantil" },
    { id: "howto", label: "Tutoriais", query: "como fazer tutorial" },
    { id: "culture", label: "Arte e cultura", query: "arte cultura" },
    { id: "travel", label: "Viagens", query: "viagem turismo" },
    { id: "cars", label: "Automóveis", query: "automóveis carros" },
  ];

  const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);

  function getApiBase() {
    return String(window.TVOIO_YOUTUBE_API_URL || "").replace(/\/$/, "");
  }

  function render(root) {
    root.innerHTML = `
      <div class="youtube-category-tabs" role="tablist" aria-label="Categorias do YouTube">
        ${CATEGORIES.map((category, index) => `
          <button type="button" class="youtube-category ${index === 0 ? "active" : ""}"
            data-youtube-category="${esc(category.id)}" role="tab" aria-selected="${index === 0 ? "true" : "false"}">
            ${esc(category.label)}
          </button>
        `).join("")}
      </div>
      <div class="youtube-category-results" id="youtube-category-results" aria-live="polite">
        <div class="youtube-category-loading">Carregando vídeos…</div>
      </div>
    `;

    root.querySelectorAll("[data-youtube-category]").forEach((button) => {
      button.addEventListener("click", () => {
        root.querySelectorAll("[data-youtube-category]").forEach((item) => {
          const active = item === button;
          item.classList.toggle("active", active);
          item.setAttribute("aria-selected", active ? "true" : "false");
        });
        const category = CATEGORIES.find((item) => item.id === button.dataset.youtubeCategory);
        if (category) search(root, category);
      });
    });

    const first = root.querySelector("[data-youtube-category]");
    if (first) first.click();
  }

  async function search(root, category) {
    const api = getApiBase();
    const results = root.querySelector("#youtube-category-results");
    if (!results) return;
    if (!api) {
      results.innerHTML = '<div class="youtube-category-error">URL do Worker do YouTube não configurada.</div>';
      return;
    }

    results.innerHTML = '<div class="youtube-category-loading">Buscando no YouTube…</div>';

    try {
      const response = await fetch(
        `${api}/search?q=${encodeURIComponent(category.query)}&maxResults=12&regionCode=BR&relevanceLanguage=pt`,
        { headers: { Accept: "application/json" } },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);

      const items = Array.isArray(data?.items) ? data.items : [];
      if (!items.length) {
        results.innerHTML = '<div class="youtube-category-empty">Nenhum vídeo encontrado.</div>';
        return;
      }

      results.innerHTML = items.map((item) => {
        const videoId = item?.id?.videoId;
        if (!videoId) return "";
        const title = item?.snippet?.title || "Vídeo";
        const channel = item?.snippet?.channelTitle || "YouTube";
        const thumbnail = item?.snippet?.thumbnails?.medium?.url ||
          `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/mqdefault.jpg`;
        return `<article class="youtube-category-card">
          <a href="https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}" target="_blank" rel="noopener noreferrer">
            <img src="${esc(thumbnail)}" alt="" loading="lazy">
            <div><strong>${esc(title)}</strong><span>${esc(channel)}</span></div>
          </a>
        </article>`;
      }).join("");
    } catch (error) {
      results.innerHTML = `<div class="youtube-category-error"><strong>Não foi possível carregar o YouTube.</strong><span>${esc(error?.message || "Erro desconhecido.")}</span></div>`;
    }
  }

  function init() {
    const root = document.getElementById("youtube-categories");
    if (root) render(root);
  }

  window.TVOIO_YOUTUBE_CATEGORIES = Object.freeze({ init, categories: CATEGORIES });
  window.addEventListener("DOMContentLoaded", init);
})();
