export function carregarCultura(container) {
  const categorias = [
    { titulo: "TV Cultura Ao Vivo", icone: "radio", query: "TV Cultura ao vivo 24h" },
    { titulo: "Jornal da Cultura", icone: "newspaper", query: "Jornal da Cultura reportagens" },
    { titulo: "Séries e Dramas", icone: "film", query: "TV Cultura series classicas" },
    { titulo: "Cultura Cine & Documentários", icone: "clapperboard", query: "TV Cultura documentario filme" },
    { titulo: "Quintal da Cultura & Desenhos", icone: "smile", query: "Quintal da Cultura desenhos" }
  ];

  container.innerHTML = criarEstruturaCanal("TV Cultura - Educação e Cultura", categorias, "cultura");
  lucide.createIcons();
  carregarVideosAPI(categorias, 'cultura');
}
