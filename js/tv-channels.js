/* TV OIO — Descobrir > TV. Reproduz apenas pelo iframe oficial do YouTube. */
(() => {
  const esc = (v = "") => String(v).replace(/[&<>\"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const tvChannelsData = [
    {id:"record-news-br",name:"Record News",category:"Notícias",country:"🇧🇷 Brasil",logoUrl:"/assets/logos/record-news.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@recordnews"},
    {id:"cnn-brasil",name:"CNN Brasil",category:"Notícias",country:"🇧🇷 Brasil",logoUrl:"/assets/logos/cnn-brasil.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@cnnbrasil"},
    {id:"sbt-news",name:"SBT News",category:"Notícias",country:"🇧🇷 Brasil",logoUrl:"/assets/logos/sbt-news.png",youtubeId:"1m1_iNLn5UY",youtubeUrl:"https://www.youtube.com/@sbtnews"},
    {id:"tv-cultura",name:"TV Cultura",category:"Cultura e Infantil",country:"🇧🇷 Brasil",logoUrl:"/assets/logos/tv-cultura.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@TVCultura"},
    {id:"cazetv",name:"CazéTV",category:"Esportes",country:"🇧🇷 Brasil",logoUrl:"/assets/logos/cazetv.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@CazeTV"},
    {id:"abc-news-us",name:"ABC News",category:"Notícias",country:"🇺🇸 EUA",logoUrl:"/assets/logos/abc-news.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@ABCNews"},
    {id:"nbc-news-us",name:"NBC News",category:"Notícias",country:"🇺🇸 EUA",logoUrl:"/assets/logos/nbc-news.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@NBCNews"},
    {id:"cbs-news-us",name:"CBS News",category:"Notícias",country:"🇺🇸 EUA",logoUrl:"/assets/logos/cbs-news.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@CBSNews"},
    {id:"livenow-fox",name:"LiveNOW from FOX",category:"Notícias",country:"🇺🇸 EUA",logoUrl:"/assets/logos/livenow-fox.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@LiveNOWfromFOX"},
    {id:"sky-news",name:"Sky News",category:"Notícias",country:"🇬🇧 Reino Unido",logoUrl:"/assets/logos/sky-news.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@SkyNews"},
    {id:"france24",name:"France 24",category:"Internacional",country:"🇫🇷 França",logoUrl:"/assets/logos/france24.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@FRANCE24"},
    {id:"dw-news",name:"DW News",category:"Internacional",country:"🇩🇪 Alemanha",logoUrl:"/assets/logos/dw-news.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@dwnews"},
    {id:"euronews",name:"Euronews",category:"Internacional",country:"🇪🇺 Europa",logoUrl:"/assets/logos/euronews.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@euronews"},
    {id:"al-jazeera-en",name:"Al Jazeera English",category:"Internacional",country:"🇶🇦 Catar",logoUrl:"/assets/logos/aljazeera.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@AlJazeeraEnglish"},
    {id:"24-horas",name:"24 Horas",category:"Notícias",country:"🇨🇱 Chile",logoUrl:"/assets/logos/24-horas.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@24horas"},
    {id:"tn-argentina",name:"TN",category:"Notícias",country:"🇦🇷 Argentina",logoUrl:"/assets/logos/tn.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@todonoticias"},
    {id:"c5n",name:"C5N",category:"Notícias",country:"🇦🇷 Argentina",logoUrl:"/assets/logos/c5n.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@C5N"},
    {id:"cgtn",name:"CGTN",category:"Internacional",country:"🇨🇳 China",logoUrl:"/assets/logos/cgtn.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@CGTN"},
    {id:"annnews",name:"ANNnewsCH",category:"Notícias",country:"🇯🇵 Japão",logoUrl:"/assets/logos/annnews.png",youtubeId:null,youtubeUrl:"https://www.youtube.com/@ANNnewsCH"}
  ];

  const initials = name => String(name).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();

  function renderCard(ch) {
    const ready = Boolean(ch.youtubeId);
    return `<article class="tv-channel-card" data-tv-id="${esc(ch.id)}" tabindex="0" role="button" aria-label="Abrir ${esc(ch.name)}">
      <div class="tv-channel-logo-wrap">
        <img class="tv-channel-logo" src="${esc(ch.logoUrl)}" alt="Logo ${esc(ch.name)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false">
        <div class="tv-channel-logo-fallback" hidden>${esc(initials(ch.name))}</div>
        <span class="tv-channel-live ${ready?"ready":"pending"}">${ready?"● AO VIVO":"YouTube"}</span>
      </div>
      <div class="tv-channel-body"><h3>${esc(ch.name)}</h3><small>${esc(ch.country)} · ${esc(ch.category)}</small></div>
    </article>`;
  }

  function openChannel(ch) {
    if (ch.youtubeId && typeof window.openPlayer === "function") {
      window.openPlayer({source:"youtube",id:ch.youtubeId,title:ch.name,meta:`${ch.country} · ${ch.category} · YouTube oficial`});
      return;
    }
    const modal=document.getElementById("player-modal"), frame=document.getElementById("player-frame");
    if(!modal||!frame)return;
    document.getElementById("player-title").textContent=ch.name;
    document.getElementById("player-meta").textContent=`${ch.country} · ${ch.category}`;
    frame.innerHTML=`<div class="external-player tv-channel-pending"><div class="tv-pending-icon">${esc(initials(ch.name))}</div><h3>Live atual não configurada</h3><p>O OIO não inventa IDs de transmissão. Use o canal oficial até o ID da live atual ser confirmado.</p><a href="${esc(ch.youtubeUrl)}" target="_blank" rel="noopener noreferrer">Abrir canal oficial no YouTube</a></div>`;
    modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); document.body.classList.add("modal-open");
  }

  function bind(root) {
    root.querySelectorAll(".tv-channel-card").forEach(card=>{
      if(card.dataset.bound)return; card.dataset.bound="1";
      const ch=tvChannelsData.find(x=>x.id===card.dataset.tvId); if(!ch)return;
      const open=()=>openChannel(ch); card.addEventListener("click",open);
      card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
    });
  }

  function render() {
    const host=document.getElementById("tv-channels-home"); if(!host)return;
    host.innerHTML=`<div class="section-title tv-section-title"><div><p class="youtube-home-kicker">Descobrir · TV</p><h2>📺 TV no YouTube</h2><p>Canais oficiais em cards horizontais, sem sair do TV OIO.</p></div></div><div class="tv-channel-track carrossel-horizontal">${tvChannelsData.map(renderCard).join("")}</div><p class="tv-channel-note">O OIO usa somente o player oficial do YouTube. Lives podem trocar de ID; quando o ID atual não estiver confirmado, o card aponta para o canal oficial.</p>`;
    bind(host);
  }

  window.TVOIO_TV_CHANNELS=tvChannelsData;
  window.renderTVOIOTvChannels=render;
  document.addEventListener("DOMContentLoaded",render);
})();
