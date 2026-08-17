export function carregarFutura(container) {
  const API_KEY = "SUA_CHAVE_DE_API_AQUI";

  const categorias = [
    { titulo: "Canal Futura Ao Vivo", icone: "radio", query: "Canal Futura ao vivo stream" },
    { titulo: "Conexão e Reportagens", icone: "newspaper", query: "Canal Futura Conexao Futura" },
    { titulo: "Séries Especiais", icone: "film", query: "Canal Futura series especiais" },
    { titulo: "Sessão Documentário", icone: "clapperboard", query: "Canal Futura filmes e docs" },
    { titulo: "Infantil e Educação", icone: "smile", query: "Canal Futura infantil desenhos" }
  ];

  container.innerHTML = criarEstruturaCanal("Canal Futura - Transformação Social", categorias, "futura");
  lucide.createIcons();
  carregarVideosAPI(categorias, 'futura', API_KEY);
}

