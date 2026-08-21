(() => {
  const WORKER = String((window.TVOIO_CONFIG && window.TVOIO_CONFIG.apiBaseUrl) || "https://oio-tv-api.detiillimichel.workers.dev").replace(/\/$/, "");
  const AUDIUS = "https://discoveryprovider.audius.co/v1";
  const JAMENDO = "https://api.jamendo.com/v3.0/tracks/";
  const JAMENDO_CLIENT_ID = String(window.TVOIO_CONFIG?.jamendoClientId || "709fa152");
  const $ = id => document.getElementById(id);
  const audio = $("audio-home-player");
  const state = { source: "audius", tracks: [], current: null };
  const esc = value => String(value ?? "").replace(/[&<>\"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const artwork = track => track?.artwork?.["480x480"] || track?.artwork?.["1000x1000"] || track?.artwork?.["150x150"] || track?.image || track?.album_image || "";
  const artist = track => track?.user?.name || track?.user?.handle || track?.artist_name || track?.artist || "Artista";
  const status = (kind,text) => { const el=$("audio-home-status"); if(el){el.className=`audio-home-status ${kind||""}`;el.textContent=text;} };
  const message = (text="",error=false) => { const el=$("audio-home-message"); if(!el)return; el.hidden=!text; el.className=`audio-home-message${error?" error":""}`; el.textContent=text; };
  async function json(url){const response=await fetch(url,{headers:{Accept:"application/json"}});const text=await response.text();let data=null;try{data=text?JSON.parse(text):null;}catch{}if(!response.ok)throw new Error(data?.error?.message||data?.error_description||data?.message||data?.error||`HTTP ${response.status}`);return data;}
  function normalizeAudius(data){return Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];}
  function normalizeJamendo(data){return Array.isArray(data?.results)?data.results:[];}
  async function loadAudius(query=""){
    const url=query?`${AUDIUS}/tracks/search?${new URLSearchParams({query,limit:"12",app_name:"TV_OIO"})}`:`${AUDIUS}/tracks/trending?${new URLSearchParams({limit:"12",app_name:"TV_OIO"})}`;
    try{const data=normalizeAudius(await json(url));if(!data.length)throw new Error("Audius não retornou faixas.");state.source="audius";state.tracks=data;status("ok",`Audius · ${data.length} faixas`);render();}
    catch(error){state.tracks=[];status("bad","Audius indisponível");message(`Audius: ${error.message}`,true);render();}
  }
  async function loadJamendo(query=""){
    const params=new URLSearchParams({client_id:JAMENDO_CLIENT_ID,format:"json",limit:"12",audioformat:"mp32",imagesize:"300",type:"single albumtrack"});
    if(query)params.set("search",query);else params.set("featured","true");
    try{const data=normalizeJamendo(await json(`${JAMENDO}?${params}`));if(!data.length)throw new Error("Jamendo não retornou faixas.");state.source="jamendo";state.tracks=data;status("ok",`Jamendo · ${data.length} faixas`);render();}
    catch(error){state.tracks=[];status("bad","Jamendo indisponível");message(`Jamendo: ${error.message}`,true);render();}
  }
  function streamUrl(track){if(state.source==="jamendo")return track?.audio||"";const id=track?.id||track?.track_id;return id?`${AUDIUS}/tracks/${encodeURIComponent(id)}/stream?app_name=TV_OIO`:"";}
  function render(){const root=$("audio-home-tracks");if(!root)return;if(!state.tracks.length){root.innerHTML='<div class="audio-home-empty">Nenhuma faixa encontrada.</div>';return;}root.innerHTML=state.tracks.map((track,index)=>{const title=track?.title||track?.name||"Faixa sem título";const who=artist(track);return `<article class="audio-home-card"><img src="${esc(artwork(track))}" alt="" loading="lazy"><div class="audio-home-card-body"><strong title="${esc(title)}">${esc(title)}</strong><span title="${esc(who)}">${esc(who)}</span></div><button class="audio-home-play" type="button" data-index="${index}" aria-label="Tocar ${esc(title)}">▶</button></article>`;}).join("");root.querySelectorAll(".audio-home-play").forEach(btn=>btn.addEventListener("click",()=>play(state.tracks[Number(btn.dataset.index)])));}
  function play(track){const src=streamUrl(track);if(!src||!audio)return;state.current=track;const title=track?.title||track?.name||"Reproduzindo";$("audio-home-title").textContent=title;$("audio-home-artist").textContent=artist(track);const art=$("audio-home-art");if(art){const image=artwork(track);art.style.backgroundImage=image?`url("${image.replace(/\"/g,"")}")`:"";}audio.src=src;audio.play().then(()=>{if($("audio-home-toggle"))$("audio-home-toggle").textContent="❚❚";}).catch(()=>message("Toque novamente em ▶ para iniciar a música.",true));}
  $("audio-home-search")?.addEventListener("submit",event=>{event.preventDefault();const q=$("audio-home-query")?.value.trim()||"";state.source==="jamendo"?loadJamendo(q):loadAudius(q);});
  $("audio-home-toggle")?.addEventListener("click",()=>{if(!audio?.src)return;if(audio.paused)audio.play();else audio.pause();});
  $("audio-home-volume")?.addEventListener("input",event=>{if(audio)audio.volume=Number(event.target.value);});
  audio?.addEventListener("play",()=>{if($("audio-home-toggle"))$("audio-home-toggle").textContent="❚❚";});audio?.addEventListener("pause",()=>{if($("audio-home-toggle"))$("audio-home-toggle").textContent="▶";});audio?.addEventListener("ended",()=>{if($("audio-home-toggle"))$("audio-home-toggle").textContent="▶";});
  window.TVOIOMusic={loadAudius,loadJamendo};if(audio)audio.volume=.9;loadAudius();
})();