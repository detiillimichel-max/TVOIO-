(() => {
  const AUDIUS = "https://discoveryprovider.audius.co/v1";
  const $ = id => document.getElementById(id);
  const audio = $("audio-home-player");

  const esc = value => String(value ?? "").replace(/[&<>\"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const artwork = track => track?.artwork?.["480x480"] || track?.artwork?.["1000x1000"] || track?.artwork?.["150x150"] || track?.image || track?.album_image || "";
  const artist = track => track?.user?.name || track?.user?.handle || track?.artist_name || track?.artist || "Artista";

  function setStatus(kind, text) {
    const el = $("audius-status"); if (!el) return;
    el.className = `audio-home-status ${kind || ""}`; el.textContent = text;
  }

  function setMessage(text = "", error = false) {
    const el = $("audius-message"); if (!el) return;
    el.hidden = !text; el.className = `audio-home-message${error ? " error" : ""}`; el.textContent = text;
  }

  async function json(url) {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch {}
    if (!response.ok) throw new Error(data?.error?.message || data?.error_description || data?.message || data?.error || `HTTP ${response.status}`);
    return data;
  }

  function render(tracks) {
    const root = $("audius-tracks"); if (!root) return;
    if (!tracks.length) { root.innerHTML = '<div class="audio-home-empty">Nenhuma faixa encontrada.</div>'; return; }
    root.innerHTML = tracks.map((track, index) => {
      const title = track?.title || track?.name || "Faixa sem título";
      return `<article class="audio-home-card"><img src="${esc(artwork(track))}" alt="" loading="lazy"><div class="audio-home-card-body"><strong title="${esc(title)}">${esc(title)}</strong><span title="${esc(artist(track))}">${esc(artist(track))}</span></div><button class="audio-home-play" type="button" data-index="${index}" aria-label="Tocar ${esc(title)}">▶</button></article>`;
    }).join("");
  }

  async function loadAudius(query = "") {
    const root = $("audius-tracks"); if (root) root.innerHTML = '<div class="audio-home-loading">Carregando Audius…</div>';
    setStatus("loading", "Conectando…"); setMessage();
    const url = query
      ? `${AUDIUS}/tracks/search?${new URLSearchParams({ query, limit: "12", app_name: "TV_OIO" })}`
      : `${AUDIUS}/tracks/trending?${new URLSearchParams({ limit: "12", app_name: "TV_OIO" })}`;
    try {
      const data = await json(url);
      const tracks = Array.isArray(data?.data) ? data.data : [];
      if (!tracks.length) throw new Error("Audius não retornou faixas.");
      render(tracks);
      setStatus("ok", `Audius · ${tracks.length} faixas`);
      window.TVOIO_MUSIC = tracks;
    } catch (error) {
      render([]); setStatus("bad", "Audius indisponível"); setMessage(error.message, true);
    }
  }

  function streamUrl(track) {
    const id = track?.id || track?.track_id;
    return id ? `${AUDIUS}/tracks/${encodeURIComponent(id)}/stream?app_name=TV_OIO` : "";
  }

  function play(track) {
    const src = streamUrl(track); if (!src || !audio) return;
    $("audio-home-title").textContent = track?.title || track?.name || "Reproduzindo";
    $("audio-home-artist").textContent = artist(track);
    const art = $("audio-home-art");
    const image = artwork(track);
    if (art) art.style.backgroundImage = image ? `url("${image.replace(/\"/g, "")}")` : "";
    audio.src = src;
    audio.play().catch(() => setMessage("Toque novamente em ▶ para iniciar a música.", true));
  }

  document.addEventListener("click", event => {
    const button = event.target.closest(".audio-home-play[data-index]"); if (!button) return;
    const tracks = Array.isArray(window.TVOIO_MUSIC) ? window.TVOIO_MUSIC : [];
    play(tracks[Number(button.dataset.index)]);
  });

  $("audius-search")?.addEventListener("submit", e => {
    e.preventDefault();
    loadAudius($("audius-query")?.value.trim() || "");
  });

  $("audio-home-toggle")?.addEventListener("click", () => {
    if (!audio?.src) return;
    if (audio.paused) audio.play(); else audio.pause();
  });

  $("audio-home-volume")?.addEventListener("input", e => {
    if (audio) audio.volume = Number(e.target.value);
  });

  audio?.addEventListener("play", () => { if ($("audio-home-toggle")) $("audio-home-toggle").textContent = "❚❚"; });
  audio?.addEventListener("pause", () => { if ($("audio-home-toggle")) $("audio-home-toggle").textContent = "▶"; });
  audio?.addEventListener("ended", () => { if ($("audio-home-toggle")) $("audio-home-toggle").textContent = "▶"; });

  if (audio) audio.volume = .9;
  window.TVOIOMusic = { loadAudius };
  loadAudius();
})();
