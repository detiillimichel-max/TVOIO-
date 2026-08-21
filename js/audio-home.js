(() => {
  const AUDIUS = "https://discoveryprovider.audius.co/v1";
  const JAMENDO = "https://api.jamendo.com/v3.0/tracks/";
  // Client ID público de teste oficial do Jamendo. Para produção, usar o seu client_id via Worker.
  const JAMENDO_CLIENT_ID = "709fa152";
  const $ = id => document.getElementById(id);
  const audio = $("audio-home-player");
  const state = { current: null, source: null };

  const esc = value => String(value ?? "").replace(/[&<>\"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const artwork = track => track?.artwork?.["480x480"] || track?.artwork?.["1000x1000"] || track?.artwork?.["150x150"] || track?.image || track?.album_image || "";
  const artist = track => track?.user?.name || track?.user?.handle || track?.artist_name || track?.artist || "Artista";

  function setStatus(source, kind, text) {
    const el = $(`${source}-status`); if (!el) return;
    el.className = `audio-home-status ${kind || ""}`; el.textContent = text;
  }
  function setMessage(source, text = "", error = false) {
    const el = $(`${source}-message`); if (!el) return;
    el.hidden = !text; el.className = `audio-home-message${error ? " error" : ""}`; el.textContent = text;
  }
  async function json(url) {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    const text = await response.text(); let data = null;
    try { data = text ? JSON.parse(text) : null; } catch {}
    if (!response.ok) throw new Error(data?.error?.message || data?.error_description || data?.message || data?.error || `HTTP ${response.status}`);
    return data;
  }

  function render(source, tracks) {
    const root = $(`${source}-tracks`); if (!root) return;
    if (!tracks.length) { root.innerHTML = '<div class="audio-home-empty">Nenhuma faixa encontrada.</div>'; return; }
    root.innerHTML = tracks.map((track, index) => {
      const title = track?.title || track?.name || "Faixa sem título";
      return `<article class="audio-home-card"><img src="${esc(artwork(track))}" alt="" loading="lazy"><div class="audio-home-card-body"><strong title="${esc(title)}">${esc(title)}</strong><span title="${esc(artist(track))}">${esc(artist(track))}</span></div><button class="audio-home-play" type="button" data-source="${source}" data-index="${index}" aria-label="Tocar ${esc(title)}">▶</button></article>`;
    }).join("");
  }

  async function loadAudius(query = "") {
    const root = $("audius-tracks"); if (root) root.innerHTML = '<div class="audio-home-loading">Carregando Audius…</div>';
    setStatus("audius", "loading", "Conectando…"); setMessage("audius");
    const url = query ? `${AUDIUS}/tracks/search?${new URLSearchParams({ query, limit: "12", app_name: "TV_OIO" })}` : `${AUDIUS}/tracks/trending?${new URLSearchParams({ limit: "12", app_name: "TV_OIO" })}`;
    try {
      const data = await json(url); const tracks = Array.isArray(data?.data) ? data.data : [];
      if (!tracks.length) throw new Error("Audius não retornou faixas.");
      render("audius", tracks); setStatus("audius", "ok", `Audius · ${tracks.length} faixas`); window.TVOIO_MUSIC = window.TVOIO_MUSIC || {}; window.TVOIO_MUSIC.audius = tracks;
    } catch (error) { render("audius", []); setStatus("audius", "bad", "Audius indisponível"); setMessage("audius", error.message, true); }
  }

  async function loadJamendo(query = "") {
    const root = $("jamendo-tracks"); if (root) root.innerHTML = '<div class="audio-home-loading">Carregando Jamendo…</div>';
    setStatus("jamendo", "loading", "Conectando…"); setMessage("jamendo");
    const params = new URLSearchParams({ client_id: JAMENDO_CLIENT_ID, format: "json", limit: "12", audioformat: "mp32", imagesize: "300", type: "single albumtrack" });
    if (query) params.set("search", query); else params.set("featured", "true");
    try {
      const data = await json(`${JAMENDO}?${params}`); const tracks = Array.isArray(data?.results) ? data.results : [];
      if (!tracks.length) throw new Error("Jamendo não retornou faixas.");
      render("jamendo", tracks); setStatus("jamendo", "ok", `Jamendo · ${tracks.length} faixas`); window.TVOIO_MUSIC = window.TVOIO_MUSIC || {}; window.TVOIO_MUSIC.jamendo = tracks;
    } catch (error) { render("jamendo", []); setStatus("jamendo", "bad", "Jamendo indisponível"); setMessage("jamendo", error.message, true); }
  }

  function streamUrl(source, track) {
    if (source === "jamendo") return track?.audio || track?.audiodownload || "";
    const id = track?.id || track?.track_id; return id ? `${AUDIUS}/tracks/${encodeURIComponent(id)}/stream?app_name=TV_OIO` : "";
  }
  function play(source, track) {
    const src = streamUrl(source, track); if (!src || !audio) return;
    state.current = track; state.source = source;
    $("audio-home-title").textContent = track?.title || track?.name || "Reproduzindo";
    $("audio-home-artist").textContent = artist(track);
    const art = $("audio-home-art"); const image = artwork(track); if (art) art.style.backgroundImage = image ? `url("${image.replace(/\"/g, "")}")` : "";
    audio.src = src; audio.play().catch(() => setMessage(source, "Toque novamente em ▶ para iniciar a música.", true));
  }

  document.addEventListener("click", event => {
    const button = event.target.closest(".audio-home-play[data-source]"); if (!button) return;
    const source = button.dataset.source; const tracks = window.TVOIO_MUSIC?.[source] || []; play(source, tracks[Number(button.dataset.index)]);
  });
  $("audius-search")?.addEventListener("submit", e => { e.preventDefault(); loadAudius($("audius-query")?.value.trim() || ""); });
  $("jamendo-search")?.addEventListener("submit", e => { e.preventDefault(); loadJamendo($("jamendo-query")?.value.trim() || ""); });
  $("audio-home-toggle")?.addEventListener("click", () => { if (!audio?.src) return; if (audio.paused) audio.play(); else audio.pause(); });
  $("audio-home-volume")?.addEventListener("input", e => { if (audio) audio.volume = Number(e.target.value); });
  audio?.addEventListener("play", () => { if ($("audio-home-toggle")) $("audio-home-toggle").textContent = "❚❚"; });
  audio?.addEventListener("pause", () => { if ($("audio-home-toggle")) $("audio-home-toggle").textContent = "▶"; });
  audio?.addEventListener("ended", () => { if ($("audio-home-toggle")) $("audio-home-toggle").textContent = "▶"; });
  if (audio) audio.volume = .9;
  window.TVOIOMusic = { loadAudius, loadJamendo };
  loadAudius(); loadJamendo();
})();