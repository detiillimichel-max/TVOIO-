// TV OIO — configuração pública do frontend.
// NUNCA coloque chaves privadas, client secrets ou bearer tokens aqui.
// As credenciais permanecem protegidas no Cloudflare Worker.

window.TVOIO_CONFIG = Object.freeze({
  // Gateway seguro do backend OIO TV.
  apiBaseUrl: "https://oio-tv-api.detiillimichel.workers.dev"
});
