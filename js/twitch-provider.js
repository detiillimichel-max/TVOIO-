(() => {
  const API = String(window.TVOIO_CONFIG?.apiBaseUrl || '').replace(/\/$/, '');
  const esc = (v = '') => String(v).replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

  function card(item) {
    const login = item?.broadcaster_login || '';
    if (!login) return '';
    const title = item?.display_name || item?.broadcaster_name || login;
    const live = Boolean(item?.is_live);
    const thumb = String(item?.thumbnail_url || '').replace('{width}', '640').replace('{height}', '360');
    return `<article class="twitch-card ${live ? 'is-live' : ''}" data-twitch-channel="${esc(login)}" tabindex="0" role="button" aria-label="Abrir ${esc(title)} no Twitch">
      <div class="twitch-thumb">${thumb ? `<img src="${esc(thumb)}" alt="" loading="lazy">` : ''}<span class="twitch-live">${live ? 'AO VIVO' : 'CANAL'}</span><span class="twitch-play">▶</span></div>
      <div class="twitch-card-body"><strong>${esc(title)}</strong><span>@${esc(login)}</span><small>${live ? `Ao vivo · ${esc(item?.game_name || 'Twitch')}` : 'Canal encontrado no Twitch'}</small></div>
    </article>`;
  }

  function renderMessage(area, title, detail, kind = 'error') {
    area.innerHTML = `<div class="empty-state ${kind === 'error' ? 'error-state' : ''}"><strong>${esc(title)}</strong><br><span>${esc(detail)}</span></div>`;
  }

  async function request(path, timeoutMs = 12000) {
    if (!API) throw new Error('Gateway OIO TV não configurado no frontend.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${API}${path}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      const text = await response.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch (_) {}
      if (!response.ok) {
        const message = data?.error || data?.message || `Gateway HTTP ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        throw error;
      }
      return data;
    } catch (error) {
      if (error?.name === 'AbortError') throw new Error('O gateway demorou mais de 12 segundos para responder.');
      if (error instanceof TypeError && /fetch/i.test(error.message)) {
        throw new Error('Não foi possível conectar ao gateway OIO TV. Verifique o /health do Worker.');
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  function open(channel) {
    const modal = document.getElementById('player-modal');
    const frame = document.getElementById('player-frame');
    if (!modal || !frame) return;
    document.getElementById('player-title').textContent = `Twitch · ${channel}`;
    document.getElementById('player-meta').textContent = 'Transmissão pelo player oficial do Twitch';
    frame.innerHTML = `<iframe src="https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=detiillimichel-max.github.io&autoplay=true" title="Twitch ${esc(channel)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  async function search(q) {
    const area = document.getElementById('twitch-results');
    if (!area) return;
    const query = String(q || '').trim();
    if (!query) {
      renderMessage(area, 'Digite algo para pesquisar.', 'Ex.: música, games, notícias ou tecnologia.', 'info');
      return;
    }

    area.innerHTML = '<div class="loading-msg">Buscando canais e transmissões no Twitch…</div>';

    try {
      const data = await request(`/twitch/search?q=${encodeURIComponent(query)}&limit=18`);
      const items = Array.isArray(data?.data) ? data.data : [];
      area.innerHTML = items.map(card).join('') || '<div class="empty-state">Nenhum canal encontrado para esta busca.</div>';
      area.querySelectorAll('[data-twitch-channel]').forEach(el => {
        const openCard = () => open(el.dataset.twitchChannel);
        el.addEventListener('click', openCard);
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openCard();
          }
        });
      });
    } catch (error) {
      const status = Number(error?.status || 0);
      const message = String(error?.message || '');
      if (/TWITCH_CLIENT_(ID|SECRET)/i.test(message)) {
        renderMessage(
          area,
          'Secrets do Twitch cadastrados no Cloudflare.',
          'O frontend está sem chaves, como deve ser. O Worker de produção ainda não está lendo os bindings TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET. Faça o deploy da versão do Worker que usa esses Secrets e tente novamente.'
        );
      } else if (status === 401 || status === 403) {
        renderMessage(area, 'O Twitch recusou a autenticação.', 'O Worker recebeu a requisição, mas as credenciais do Twitch foram recusadas.');
      } else if (status >= 400) {
        renderMessage(area, 'O gateway recusou a busca.', message || `HTTP ${status}`);
      } else {
        renderMessage(area, 'Não foi possível conectar ao Twitch.', message || 'Verifique se o gateway OIO TV está online.');
      }
      console.error('TV OIO Twitch', error);
    }
  }

  function init() {
    const form = document.getElementById('twitch-search-form');
    const input = document.getElementById('twitch-search-input');
    if (!form || !input) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      search(input.value);
    });
    search(input.value || 'twitch');
  }

  window.TVOIO_TWITCH = Object.freeze({ search });
  window.addEventListener('DOMContentLoaded', init);
})();
