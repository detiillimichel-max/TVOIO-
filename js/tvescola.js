export function carregarTvEscola(container) {
  const API_KEY = "SUA_CHAVE_DE_API_AQUI";

  const categorias = [
    { titulo: "Transmissão Educativa", icone: "radio", query: "TV Escola ao vivo" },
    { titulo: "Noticiário Educacional", icone: "newspaper", query: "TV Escola jornal noticias" },
    { titulo: "Séries Temáticas", icone: "film", query: "TV Escola series historicas" },
    { titulo: "Filmes Culturais", icone: "clapperboard", query: "TV Escola cinema e filmes" },
    { titulo: "Desenhos Educativos", icone: "smile", query: "TV Escola desenhos educativos" }
  ];

  container.innerHTML = criarEstruturaCanal("TV Escola - Saber em Foco", categorias, "tvescola");
  lucide.createIcons();
  carregarVideosAPI(categorias, 'tvescola', API_KEY);
}

