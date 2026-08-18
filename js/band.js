export function carregarBand(container) {
  const categorias = [
    { titulo: "Transmissões Ao Vivo", icone: "radio", query: "Band ao vivo stream" },
    { titulo: "Jornalismo Band", icone: "newspaper", query: "Jornal da Band Boechat Urgente" },
    { titulo: "Novelas e Dramaturgia", icone: "film", query: "Band novelas completas" },
    { titulo: "Cinema na Band", icone: "clapperboard", query: "Band filmes cinema" },
    { titulo: "Band Kids e Desenhos", icone: "smile", query: "Band Kids desenhos animados" }
  ];

  container.innerHTML = criarEstruturaCanal("Band - Rede de Televisão", categorias, "band");
  lucide.createIcons();
  carregarVideosAPI(categorias, 'band');
}
