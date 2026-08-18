// TV OIO — configuração pública do frontend.
// NUNCA coloque chaves privadas, client secrets ou bearer tokens aqui.
// As credenciais devem permanecer no backend (Cloudflare Worker / Supabase Edge Function).

window.TVOIO_CONFIG = Object.freeze({
  // Endpoint público do backend que consulta as APIs com segurança.
  // Exemplo futuro: https://seu-worker.workers.dev
  apiBaseUrl: ""
});
