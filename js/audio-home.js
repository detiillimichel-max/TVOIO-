(() => {
  const WORKER = String((window.TVOIO_CONFIG && window.TVOIO_CONFIG.apiBaseUrl) || "https://oio-tv-api.detiillimichel.workers.dev").replace(/\/$/, "");
  const AUDIUS = "https://discoveryprovider.audius.co/v1";
  const $ = (id) => document.getElementById(id);
  const state = { tracks: [], current: null };
  const audio = $("audio-home-player");

  function esc(value = "") {
    return String(value).replace(/[&<>\"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  }
  function artwork(track) { return track?.artwork?.["480x480"] || track?.artwork?.["150x150"] || track?.artwork?.["1000x1000"] || ""; }
  function artist(track) { return track?.user?.name || track?.user?.handle || track?.artist_name || "Artista"; }
  function normalize(data) { return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []; }
  function status(kind, text) { const el = $("audio-home-status"); if (!el) return; el.className = `audio-home-status ${kind || ""}`; el.textContent = text; }
  function message(text = "", error = false) { const el = $("audio-home-message"); if (!el) return; el.hidden = !text; el.className = `audio-home-message${error ? " error" : ""}`; el.textContent = text; }

  async function json(url) {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch {}
    if (!response.ok) throw new Error(data?.error || data?.message || `HTTP ${response.status}`);
    return data;
  }

  async function request(path, fallbackUrl) {
    try {
      const data = await json(`${WORKER}${path}`);
      return { data: normalize(data), source: "Cloudflare Worker" };
    } catch (workerError) {
      const data = await json(fallbackUrl);
      return { data: normalize(data), source: "Audius", fallback: workerError.message };
    }
  }

  function render() {
    const root = $("audio-home-tracks");
    if (!root) return;
    if (!state.tracks.length) {
      root.innerHTML = `<div class="audio-home-empty">Nenhuma faixa encontrada.</div>`;
      return;
    }
    root.innerHTML = state.tracks.map((track, index) => {
      const title = track?.title || "Faixa sem título";
      const image = artwork(track);
      const handle = track?.user?.handle ? `@${track.user.handle}` : artist(track);
      return `<article class="audio-home-card">
        <img src="${esc(image)}" alt="" loading="lazy">
        <div class="audio-home-card-body"><strong title="${esc(title)}">${esc(title)}</strong><span title="${esc(handle)}">${esc(handle)}</span></div>
        <button class="audio-home-play" type="button" data-index="${index}" aria-label="Tocar ${esc(title)}">▶</button>
      </article>`;
    }).join("");
    root.querySelectorAll(".audio-home-play").forEach(button => button.addEventListener("click", () => play(state.tracks[Number(button.dataset.index)])));
  }

  function play(track) {
    const id = track?.id || track?.track_id;
    if (!id || !audio) return;
    state.current = track;
    const image = artwork(track);
    $("audio-home-title").textContent = track.title || "Reproduzindo";
    $("audio-home-artist").textContent = artist(track);
    const art = $("audio-home-art");
    if (art) art.style.backgroundImage = image ? `url("${image.replace(/"/g, "")}")` : "";
    audio.src = `${AUDIUS}/tracks/${encodeURIComponent(id)}/stream`;
    audio.play().then(() => {
      $("audio-home-toggle").textContent = "❚❚";
    }).catch(() => message("Toque novamente em ▶ para iniciar a música.", true));
  }

  async function loadTrending() {
    const result = await request("/audius/trending?limit=12", `${AUDIUS}/tracks/trending?limit=12`);
    state.tracks = result.data;
    status("ok", `${result.source} · ${state.tracks.length} faixas`);
    render();
    if (result.fallback) console.info("Audius Worker fallback:", result.fallback);
  }

  async function search(query) {
    const q = encodeURIComponent(query);
    const result = await request(`/audius/search?q=${q}&limit=12`, `${AUDIUS}/tracks/search?query=${q}&limit=12`);
    state.tracks = result.data;
    status("ok", `${result.source} · ${state.tracks.length} resultados`);
    render();
    if (result.fallback) console.info("Audius Worker fallback:", result.fallback);
  }

  async function load(mode = "trending", query = "") {
    message();
    const root = $("audio-home-tracks");
    if (root) root.innerHTML = `<div class="audio-home-loading">Carregando músicas…</div>`;
    status("loading", "Conectando ao áudio…");
    try {
      if (mode === "search" && query) await search(query); else await loadTrending();
    } catch (error) {
      state.tracks = [];
      status("bad", "Áudio indisponível");
      message(`Não foi possível carregar o áudio: ${error.message}`, true);
      render();
    }
  }

  $("audio-home-search")?.addEventListener("submit", event => {
    event.preventDefault();
    const query = $("audio-home-query")?.value.trim();
    if (query) load("search", query); else loadTrending();
  });
  $("audio-home-toggle")?.addEventListener("click", () => {
    if (!audio?.src) return;
    if (audio.paused) audio.play(); else audio.pause();
    $("audio-home-toggle").textContent = audio.paused ? "▶" : "❚❚";
  });
  audio?.addEventListener("play", () => { $("audio-home-toggle").textContent = "❚❚"; });
  audio?.addEventListener("pause", () => { $("audio-home-toggle").textContent = "▶"; });
  audio?.addEventListener("ended", () => { $("audio-home-toggle").textContent = "▶"; });
  $("audio-home-volume")?.addEventListener("input", event => { if (audio) audio.volume = Number(event.target.value); });
  if (audio) audio.volume = 0.9;
  loadTrending();
})();
