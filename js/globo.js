export function carregarGlobo(container) {
  const categorias = [
    { titulo: "Sinal Oficial & Ao Vivo", icone: "radio", query: "Globoplay ao vivo agora" },
    { titulo: "Jornais e Telejornais", icone: "newspaper", query: "Jornal Nacional RJ2 Fantastico" },
    { titulo: "Novelas e Capítulos", icone: "film", query: "Novela da Globo cenas resumos" },
    { titulo: "Filmes e Tela Quente", icone: "clapperboard", query: "Filmes Globo Sessao da Tarde" },
    { titulo: "Desenhos e Gloob", icone: "smile", query: "Gloob desenhos infantis" }
  ];

  container.innerHTML = `
    <div class="canal-wrapper">
      <div class="canal-banner" style="background: linear-gradient(135deg, #1f6feb 0%, #0d1117 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #30363d; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
        <div>
          <h2 style="font-size: 24px; color: #fff; margin-bottom: 5px; display: flex; align-items: center; gap: 10px;">
            <i data-lucide="tv" style="color: #58a6ff;"></i> Rede Globo / Globoplay
          </h2>
          <p style="color: #8b949e; font-size: 14px;">Transmissão oficial, telejornais e programações em alta definição.</p>
        </div>
        <a href="https://globoplay.globo.com/agora-na-tv/" target="_blank" rel="noopener noreferrer" style="background: #238636; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(35,134,54,0.3);">
          <i data-lucide="play-circle"></i> Abrir Globoplay
        </a>
      </div>
      ${categorias.map((cat, idx) => `
        <div class="categoria-section">
          <h3><i data-lucide="${cat.icone}" style="color: #58a6ff;"></i> ${cat.titulo}</h3>
          <div class="carrossel-horizontal" id="carrossel-globo-${idx}">
            <div class="loading-msg">Carregando experiências...</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  lucide.createIcons();
  carregarVideosAPI(categorias, 'globo');
}
