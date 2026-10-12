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
    {id:"record-news-br",name:"Record News",category:"Notícias",country:"🇧🇷 Brasil",logoUrl:commonsLogo("Record News logo 2023.svg"),youtubeId:null,youtubeChannelId:"UCuiLR4p6wQ3xLEm15pEn1Xw",youtubeUrl:"https://www.youtube.com/@recordnews/live"},
    {id:"cnn-brasil",name:"CNN Brasil",category:"Notícias",country:"🇧🇷 Brasil",logoUrl:commonsLogo("CNN Brasil (red background).svg"),youtubeId:null,youtubeChannelId:"UCvdwhh_fDyWccR42-rReZLw",youtubeUrl:"https://www.youtube.com/@cnnbrasil/live"},
    {id:"sbt-news",name:"SBT News",category:"Notícias",country:"🇧🇷 Brasil",logoUrl:commonsLogo("SBT News 2025.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@sbtnews/live"},
    {id:"tv-cultura",name:"TV Cultura",category:"Cultura e Infantil",country:"🇧🇷 Brasil",logoUrl:commonsLogo("Cultura logo 2013.svg"),youtubeId:null,officialEmbedUrl:"https://culturaplay.tvcultura.com.br/channels/14/embed",youtubeUrl:"https://culturaplay.tvcultura.com.br/channels/14-01-tv-cultura-ao-vivo"},
    {id:"band",name:"Band",category:"TV Aberta",country:"🇧🇷 Brasil",logoUrl:commonsLogo("Band 2026 logo.png"),youtubeId:null,youtubeChannelId:"UCoa-D_VfMkFrCYodrOC9-mA",youtubeUrl:"https://www.youtube.com/@BandJornalismo/live"},
    {id:"cazetv",name:"CazéTV",category:"Esportes",country:"🇧🇷 Brasil",logoUrl:commonsLogo("CazéTV wordmark.svg"),youtubeId:null,youtubeChannelId:"UCZiYbVptd3PVPf4f6eR6UaQ",youtubeUrl:"https://www.youtube.com/@CazeTV/live"},
    {id:"abc-news-us",name:"ABC News",category:"Notícias",country:"🇺🇸 EUA",logoUrl:commonsLogo("ABC News logo 2021.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@ABCNews/live"},
    {id:"nbc-news-us",name:"NBC News",category:"Notícias",country:"🇺🇸 EUA",logoUrl:commonsLogo("NBC News (2023).svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@NBCNews/live"},
    {id:"cbs-news-us",name:"CBS News",category:"Notícias",country:"🇺🇸 EUA",logoUrl:commonsLogo("CBS News logo (2020).svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@CBSNews/live"},
    {id:"livenow-fox",name:"LiveNOW from FOX",category:"Notícias",country:"🇺🇸 EUA",logoUrl:domainLogo("livenowfox.com"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@LiveNOWfromFOX/live"},
    {id:"sky-news",name:"Sky News",category:"Notícias",country:"🇬🇧 Reino Unido",logoUrl:commonsLogo("Sky News 2026.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@SkyNews/live"},
    {id:"france24",name:"France 24",category:"Internacional",country:"🇫🇷 França",logoUrl:commonsLogo("France24.png"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@FRANCE24/live"},
    {id:"dw-news",name:"DW News",category:"Internacional",country:"🇩🇪 Alemanha",logoUrl:commonsLogo("DW News Logo.png"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@dwnews/live"},
    {id:"euronews",name:"Euronews",category:"Internacional",country:"🇪🇺 Europa",logoUrl:commonsLogo("Euronews Logo 2025.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@euronews/live"},
    {id:"al-jazeera-en",name:"Al Jazeera English",category:"Internacional",country:"🇶🇦 Catar",logoUrl:commonsLogo("Aljazeera eng.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@AlJazeeraEnglish/live"},
    {id:"24-horas",name:"24 Horas",category:"Notícias",country:"🇨🇱 Chile",logoUrl:domainLogo("24horas.cl"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@24horas/live"},
    {id:"tn-argentina",name:"TN",category:"Notícias",country:"🇦🇷 Argentina",logoUrl:commonsLogo("TN todo noticias logo.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@todonoticias/live"},
    {id:"c5n",name:"C5N",category:"Notícias",country:"🇦🇷 Argentina",logoUrl:commonsLogo("Logo-c5n.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@C5N/live"},
    {id:"cgtn",name:"CGTN",category:"Internacional",country:"🇨🇳 China",logoUrl:commonsLogo("CGTN.svg"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@CGTN/live"},
    {id:"annnews",name:"ANNnewsCH",category:"Notícias",country:"🇯🇵 Japão",logoUrl:domainLogo("news.tv-asahi.co.jp"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@ANNnewsCH/live"}
  ];

  const initials = name => String(name).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();

  const LIVE_KEYS = {
    "record-news-br": "record-news",
    "cnn-brasil": "cnn-brasil",
    "sbt-news": "sbt-news",
    "tv-cultura": "tv-cultura",
    "band": "band",
    "cazetv": "cazetv"
  };
  let liveData = {};

  function confirmedLive(ch) {
    const entry = liveData[LIVE_KEYS[ch.id] || ch.id];
    if (entry?.mode !== "video" || !/^[A-Za-z0-9_-]{11}$/.test(String(entry.videoId || ""))) return null;
    return entry.videoId;
  }

  function renderCard(ch) {
    const liveId = confirmedLive(ch);
    const action = liveId ? "Assistir transmissão ao vivo confirmada" : "Abrir emissora no player do TV OIO";
    const status = liveId ? '<span class="tv-live-badge">● AO VIVO CONFIRMADO</span>' : '';
    return `<article class="tv-channel-card" data-tv-id="${esc(ch.id)}" tabindex="0" role="button" aria-label="${esc(action)}: ${esc(ch.name)}">
      <div class="tv-channel-logo-wrap">
        <img class="tv-channel-logo" src="${esc(ch.logoUrl)}" alt="Logo ${esc(ch.name)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false">
        <div class="tv-channel-logo-fallback" hidden>${esc(initials(ch.name))}</div>
        ${status}
        <button class="tv-channel-play" type="button" aria-label="${esc(action)}">▶</button>
      </div>
      <div class="tv-channel-body">
        <strong title="${esc(ch.name)}">${esc(ch.name)}</strong>
        <span title="${esc(ch.country)} · ${esc(ch.category)}">${esc(ch.country)} · ${esc(ch.category)}</span>
      </div>
    </article>`;
  }

  function openChannel(ch) {
    const liveId = confirmedLive(ch);
    if (typeof window.openPlayer !== "function") return;
    if (liveId) {
      window.openPlayer({source:"youtube",id:liveId,title:ch.name,meta:`${ch.country} · ${ch.category} · transmissão ao vivo confirmada`});
      return;
    }
    // Preferir o player incorporável oficial quando a emissora o fornece.
    if (ch.officialEmbedUrl) {
      window.openPlayer({source:"official-embed",id:ch.officialEmbedUrl,title:ch.name,meta:`${ch.country} · ${ch.category} · player oficial da emissora`});
      return;
    }
    // Priorizar o live endpoint do canal: vídeos fixos podem estar privados ou encerrados.
    if (ch.youtubeChannelId) {
      window.openPlayer({source:"youtube-live",id:ch.youtubeChannelId,title:ch.name,meta:`${ch.country} · ${ch.category} · procurando transmissão ao vivo oficial`});
      return;
    }
    if (ch.youtubeId) {
      window.openPlayer({source:"youtube",id:ch.youtubeId,title:ch.name,meta:`${ch.country} · ${ch.category} · vídeo oficial da emissora`});
      return;
    }
    window.openPlayer({source:"channel-unavailable",id:ch.youtubeUrl,title:ch.name,meta:`${ch.country} · ${ch.category} · transmissão não confirmada`});
  }

  async function loadLiveData() {
    try {
      const response = await fetch("./data/tv-live-data.json", { cache: "no-store", headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      liveData = data && typeof data === "object" ? data : {};
    } catch (error) {
      liveData = {};
      console.info("TV OIO: catálogo de lives indisponível; usando canais oficiais.", error);
    }
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
    host.innerHTML=`<div class="section-title tv-section-title"><div><p class="youtube-home-kicker">TV · Emissoras</p><h2>📺 Emissoras</h2><p>As emissoras abrem no player do TV OIO. Quando uma transmissão não pode ser incorporada, o app informa a indisponibilidade.</p></div></div><div class="tv-channel-track">${tvChannelsData.map(renderCard).join("")}</div>`;
    bind(host);
  }

  window.TVOIO_TV_CHANNELS=tvChannelsData;
  window.renderTVOIOTvChannels=render;
  document.addEventListener("DOMContentLoaded", async () => {
    render();
    await loadLiveData();
    render();
  });
})();
