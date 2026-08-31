/* TV OIO — Emissoras em cards no mesmo padrão visual do Audius. */
(() => {
  const esc = (v = "") => String(v).replace(/[&<>\"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  const youtubeLiveId = (url = "") => {
    const match = String(url).match(/(?:youtube\.com\/(?:live\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const commonsLogo = (file) =>
    `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}`;
  const domainLogo = (domain) =>
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`;

  const tvChannelsData = [
    {id:"record-news-br",name:"Record News",category:"Notícias",country:"🇧🇷 Brasil",logoUrl:commonsLogo("Record News logo 2023.svg"),youtubeId:"Wpq6VRLWtM8",youtubeUrl:"https://www.youtube.com/@recordnews"},
    {id:"cnn-brasil",name:"CNN Brasil",category:"Notícias",country:"🇧🇷 Brasil",logoUrl:commonsLogo("CNN Brasil (red background).svg"),youtubeId:"vaTmIq0JWCM",youtubeUrl:"https://www.youtube.com/@cnnbrasil"},
    {id:"sbt-news",name:"SBT News",category:"Notícias",country:"🇧🇷 Brasil",logoUrl:commonsLogo("SBT News 2025.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@sbtnews"},
    {id:"tv-cultura",name:"TV Cultura",category:"Cultura e Infantil",country:"🇧🇷 Brasil",logoUrl:commonsLogo("TV Cultura logo.png"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@TVCultura"},
    {id:"band",name:"Band",category:"TV Aberta",country:"🇧🇷 Brasil",logoUrl:commonsLogo("Band 2026 logo.png"),youtubeId:"s_WOpljDii8",youtubeUrl:"https://www.youtube.com/live/s_WOpljDii8?is=CiGWUYnxr3hLBgQ_"},
    {id:"cazetv",name:"CazéTV",category:"Esportes",country:"🇧🇷 Brasil",logoUrl:commonsLogo("CazéTV wordmark.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@CazeTV"},
    {id:"abc-news-us",name:"ABC News",category:"Notícias",country:"🇺🇸 EUA",logoUrl:commonsLogo("ABC News logo 2021.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@ABCNews"},
    {id:"nbc-news-us",name:"NBC News",category:"Notícias",country:"🇺🇸 EUA",logoUrl:commonsLogo("NBC News (2023).svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@NBCNews"},
    {id:"cbs-news-us",name:"CBS News",category:"Notícias",country:"🇺🇸 EUA",logoUrl:commonsLogo("CBS News logo (2020).svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@CBSNews"},
    {id:"livenow-fox",name:"LiveNOW from FOX",category:"Notícias",country:"🇺🇸 EUA",logoUrl:domainLogo("livenowfox.com"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@LiveNOWfromFOX"},
    {id:"sky-news",name:"Sky News",category:"Notícias",country:"🇬🇧 Reino Unido",logoUrl:commonsLogo("Sky News 2026.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@SkyNews"},
    {id:"france24",name:"France 24",category:"Internacional",country:"🇫🇷 França",logoUrl:commonsLogo("France24.png"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@FRANCE24"},
    {id:"dw-news",name:"DW News",category:"Internacional",country:"🇩🇪 Alemanha",logoUrl:commonsLogo("DW News Logo.png"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@dwnews"},
    {id:"euronews",name:"Euronews",category:"Internacional",country:"🇪🇺 Europa",logoUrl:commonsLogo("Euronews Logo 2025.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@euronews"},
    {id:"al-jazeera-en",name:"Al Jazeera English",category:"Internacional",country:"🇶🇦 Catar",logoUrl:commonsLogo("Aljazeera eng.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@AlJazeeraEnglish"},
    {id:"24-horas",name:"24 Horas",category:"Notícias",country:"🇨🇱 Chile",logoUrl:domainLogo("24horas.cl"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@24horas"},
    {id:"tn-argentina",name:"TN",category:"Notícias",country:"🇦🇷 Argentina",logoUrl:commonsLogo("TN todo noticias logo.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@todonoticias"},
    {id:"c5n",name:"C5N",category:"Notícias",country:"🇦🇷 Argentina",logoUrl:commonsLogo("Logo-c5n.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@C5N"},
    {id:"cgtn",name:"CGTN",category:"Internacional",country:"🇨🇳 China",logoUrl:commonsLogo("CGTN.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@CGTN"},
    {id:"annnews",name:"ANNnewsCH",category:"Notícias",country:"🇯🇵 Japão",logoUrl:domainLogo("news.tv-asahi.co.jp"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@ANNnewsCH"}
  ];

  const initials = name => String(name).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();

  function renderCard(ch) {
    const action = ch.youtubeId ? "Assistir no player do OIO" : "Abrir canal oficial no YouTube";
    return `<article class="tv-channel-card" data-tv-id="${esc(ch.id)}" tabindex="0" role="button" aria-label="${esc(action)}: ${esc(ch.name)}">
      <div class="tv-channel-logo-wrap">
        <img class="tv-channel-logo" src="${esc(ch.logoUrl)}" alt="Logo ${esc(ch.name)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false">
        <div class="tv-channel-logo-fallback" hidden>${esc(initials(ch.name))}</div>
        <button class="tv-channel-play" type="button" aria-label="${esc(action)}">▶</button>
      </div>
      <div class="tv-channel-body">
        <strong title="${esc(ch.name)}">${esc(ch.name)}</strong>
        <span title="${esc(ch.country)} · ${esc(ch.category)}">${esc(ch.country)} · ${esc(ch.category)}</span>
      </div>
    </article>`;
  }

  function openChannel(ch) {
    const liveId = ch.youtubeId || youtubeLiveId(ch.youtubeUrl);

    // Quando temos uma transmissão específica, o usuário permanece no OIO:
    // o conteúdo é reproduzido pelo player oficial incorporado do YouTube.
    if (liveId && typeof window.openPlayer === "function") {
      window.openPlayer({source:"youtube",id:liveId,title:ch.name,meta:`${ch.country} · ${ch.category} · YouTube oficial`});
      return;
    }

    // Se a emissora troca o ID da live, não inventamos uma URL de reprodução.
    // O card continua levando ao canal oficial para encontrar a transmissão atual.
    window.open(ch.youtubeUrl, "_blank", "noopener,noreferrer");
  }

  function bind(root) {
    root.querySelectorAll(".tv-channel-card").forEach(card=>{
      if(card.dataset.bound)return; card.dataset.bound="1";
      const ch=tvChannelsData.find(x=>x.id===card.dataset.tvId); if(!ch)return;
      const open=()=>openChannel(ch);
      card.addEventListener("click",open);
      card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
    });
  }

  function render() {
    const host=document.getElementById("tv-channels-home"); if(!host)return;
    host.innerHTML=`<div class="section-title tv-section-title"><div><p class="youtube-home-kicker">TV · Emissoras</p><h2>📺 Emissoras</h2><p>Toque em uma emissora para assistir no OIO quando houver uma transmissão identificada.</p></div></div><div class="tv-channel-track">${tvChannelsData.map(renderCard).join("")}</div>`;
    bind(host);
  }

  window.TVOIO_TV_CHANNELS=tvChannelsData;
  window.renderTVOIOTvChannels=render;
  document.addEventListener("DOMContentLoaded",render);
})();
