/* TV OIO — Emissoras em cards no mesmo padrão visual do Audius. */
(() => {
  const esc = (v = "") => String(v).replace(/[&<>\"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  const youtubeLiveId = (url = "") => {
    const match = String(url).match(/(?:youtube\.com\/(?:live\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const avatar = (handle) => `https://unavatar.io/youtube/${encodeURIComponent(handle)}`;

  const tvChannelsData = [
    {id:"record-news-br",name:"Record News",category:"Notícias",country:"🇧🇷 Brasil",logoUrl:avatar("@recordnews"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@recordnews"},
    {id:"cnn-brasil",name:"CNN Brasil",category:"Notícias",country:"🇧🇷 Brasil",logoUrl:avatar("@cnnbrasil"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@cnnbrasil"},
    {id:"sbt-news",name:"SBT News",category:"Notícias",country:"🇧🇷 Brasil",logoUrl:avatar("@sbtnews"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@sbtnews"},
    {id:"tv-cultura",name:"TV Cultura",category:"Cultura e Infantil",country:"🇧🇷 Brasil",logoUrl:avatar("@TVCultura"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@TVCultura"},
    {id:"band",name:"Band",category:"TV Aberta",country:"🇧🇷 Brasil",logoUrl:avatar("@BandJornalismo"),youtubeId:"s_WOpljDii8",youtubeUrl:"https://www.youtube.com/live/s_WOpljDii8?is=CiGWUYnxr3hLBgQ_"},
    {id:"cazetv",name:"CazéTV",category:"Esportes",country:"🇧🇷 Brasil",logoUrl:avatar("@CazeTV"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@CazeTV"},
    {id:"abc-news-us",name:"ABC News",category:"Notícias",country:"🇺🇸 EUA",logoUrl:avatar("@ABCNews"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@ABCNews"},
    {id:"nbc-news-us",name:"NBC News",category:"Notícias",country:"🇺🇸 EUA",logoUrl:avatar("@NBCNews"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@NBCNews"},
    {id:"cbs-news-us",name:"CBS News",category:"Notícias",country:"🇺🇸 EUA",logoUrl:avatar("@CBSNews"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@CBSNews"},
    {id:"livenow-fox",name:"LiveNOW from FOX",category:"Notícias",country:"🇺🇸 EUA",logoUrl:avatar("@LiveNOWfromFOX"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@LiveNOWfromFOX"},
    {id:"sky-news",name:"Sky News",category:"Notícias",country:"🇬🇧 Reino Unido",logoUrl:avatar("@SkyNews"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@SkyNews"},
    {id:"france24",name:"France 24",category:"Internacional",country:"🇫🇷 França",logoUrl:avatar("@FRANCE24"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@FRANCE24"},
    {id:"dw-news",name:"DW News",category:"Internacional",country:"🇩🇪 Alemanha",logoUrl:avatar("@dwnews"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@dwnews"},
    {id:"euronews",name:"Euronews",category:"Internacional",country:"🇪🇺 Europa",logoUrl:avatar("@euronews"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@euronews"},
    {id:"al-jazeera-en",name:"Al Jazeera English",category:"Internacional",country:"🇶🇦 Catar",logoUrl:avatar("@AlJazeeraEnglish"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@AlJazeeraEnglish"},
    {id:"24-horas",name:"24 Horas",category:"Notícias",country:"🇨🇱 Chile",logoUrl:avatar("@24horas"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@24horas"},
    {id:"tn-argentina",name:"TN",category:"Notícias",country:"🇦🇷 Argentina",logoUrl:avatar("@todonoticias"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@todonoticias"},
    {id:"c5n",name:"C5N",category:"Notícias",country:"🇦🇷 Argentina",logoUrl:avatar("@C5N"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@C5N"},
    {id:"cgtn",name:"CGTN",category:"Internacional",country:"🇨🇳 China",logoUrl:avatar("@CGTN"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@CGTN"},
    {id:"annnews",name:"ANNnewsCH",category:"Notícias",country:"🇯🇵 Japão",logoUrl:avatar("@ANNnewsCH"),youtubeId:null,youtubeUrl:"https://www.youtube.com/@ANNnewsCH"}
  ];

  const initials = name => String(name).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();

  function renderCard(ch) {
    return `<article class="tv-channel-card" data-tv-id="${esc(ch.id)}" tabindex="0" role="button" aria-label="Abrir ${esc(ch.name)} no YouTube">
      <div class="tv-channel-logo-wrap">
        <img class="tv-channel-logo" src="${esc(ch.logoUrl)}" alt="Logo ${esc(ch.name)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false">
        <div class="tv-channel-logo-fallback" hidden>${esc(initials(ch.name))}</div>
        <button class="tv-channel-play" type="button" aria-label="Abrir ${esc(ch.name)} no YouTube">▶</button>
      </div>
      <div class="tv-channel-body">
        <strong title="${esc(ch.name)}">${esc(ch.name)}</strong>
        <span title="${esc(ch.country)} · ${esc(ch.category)}">${esc(ch.country)} · ${esc(ch.category)}</span>
      </div>
    </article>`;
  }

  function openChannel(ch) {
    const liveId = ch.youtubeId || youtubeLiveId(ch.youtubeUrl);

    // Quando existe uma URL de live específica, usa o player oficial já existente no OIO.
    if (liveId && typeof window.openPlayer === "function") {
      window.openPlayer({source:"youtube",id:liveId,title:ch.name,meta:`${ch.country} · ${ch.category} · YouTube oficial`});
      return;
    }

    // Para canais cuja live muda, abre diretamente o canal oficial no YouTube.
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
    host.innerHTML=`<div class="section-title tv-section-title"><div><p class="youtube-home-kicker">TV · Emissoras</p><h2>📺 Emissoras</h2><p>Cada emissora abre seu canal oficial no YouTube.</p></div></div><div class="tv-channel-track">${tvChannelsData.map(renderCard).join("")}</div>`;
    bind(host);
  }

  window.TVOIO_TV_CHANNELS=tvChannelsData;
  window.renderTVOIOTvChannels=render;
  document.addEventListener("DOMContentLoaded",render);
})();
