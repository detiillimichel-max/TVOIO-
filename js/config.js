// TV OIO — configuração pública do frontend.
// NUNCA coloque chaves privadas, client secrets ou bearer tokens aqui.
// As credenciais permanecem protegidas no Cloudflare Worker.

window.TVOIO_CONFIG = Object.freeze({
  // Gateway de produção do backend OIO TV.
  apiBaseUrl: "https://tvoio.detiillimichel.workers.dev"
});
