(() => {
  const API = String(window.TVOIO_CONFIG?.apiBaseUrl || '').replace(/\/$/, '');
  const esc = (v = '') => String(v).replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

  function card(item) {
    const login = item?.broadcaster_login || '';
    if (!login) return '';
    const title = item?.display_name || item?.broadcaster_name || login;
    const live = item?.is_live;
    const thumb = String(item?.thumbnail_url || '').replace('{width}', '640').replace('{height}', '360');
    return `<article class="twitch-card ${live ? 'is-live' : ''}" data-twitch-channel="${esc(login)}" tabindex="0" role="button" aria-label="Abrir ${esc(title)} no Twitch">
      <div class="twitch-thumb">${thumb ? `<img src="${esc(thumb)}" alt="" loading="lazy">` : ''}<span class="twitch-live">${live ? 'AO VIVO' : 'CANAL'}</span><span class="twitch-play">▶</span></div>
      <div class="twitch-card-body"><strong>${esc(title)}</strong><span>@${esc(login)}</span><small>${live ? `Ao vivo · ${esc(item?.game_name || 'Twitch')}` : 'Canal encontrado no Twitch'}</small></div>
    </article>`;
  }

  function open(channel) {
    const modal = document.getElementById('player-modal');
    const frame = document.getElementById('player-frame');
    if (!modal || !frame) return;
    document.getElementById('player-title').textContent = `Twitch · ${channel}`;
    document.getElementById('player-meta').textContent = 'Transmissão pelo player oficial do Twitch';
    frame.innerHTML = `<iframe src="https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=detiillimichel-max.github.io&autoplay=true" title="Twitch ${esc(channel)}" allowfullscreen></iframe>`;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open');
  }

  async function search(q) {
    const area = document.getElementById('twitch-results');
    if (!area) return;
    area.innerHTML = '<div class="loading-msg">Buscando canais e transmissões no Twitch…</div>';
    try {
      if (!API) throw new Error('Gateway OIO TV não configurado.');
      const response = await fetch(`${API}/twitch/search?q=${encodeURIComponent(q)}&maxResults=18`, { headers: { Accept: 'application/json' } });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
      const items = Array.isArray(data?.data) ? data.data : [];
      area.innerHTML = items.map(card).join('') || '<div class="empty-state">Nenhum canal encontrado.</div>';
      area.querySelectorAll('[data-twitch-channel]').forEach(el => {
        const openCard = () => open(el.dataset.twitchChannel);
        el.addEventListener('click', openCard);
        el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(); } });
      });
    } catch (e) {
      area.innerHTML = `<div class="empty-state error-state"><strong>Twitch ainda não está autenticado.</strong><br><span>${esc(e?.message || 'Verifique os Secrets do Twitch no Worker.')}</span></div>`;
    }
  }

  function init() {
    const form = document.getElementById('twitch-search-form');
    const input = document.getElementById('twitch-search-input');
    if (!form || !input) return;
    form.addEventListener('submit', e => { e.preventDefault(); const q = input.value.trim(); if (q) search(q); });
    search('twitch');
  }

  window.addEventListener('DOMContentLoaded', init);
})();
