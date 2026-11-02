/* Cache local do catálogo: mantém a última versão válida para uso offline/instabilidade. */
(() => {
  const config = window.TV_ENGINE_CONFIG || {};
  const key = config.cacheKey || "tvoio_tv_engine_catalog_v1";

  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      if (!value || !value.catalog || !Array.isArray(value.catalog.channels)) return null;
      return value;
    } catch (_) { return null; }
  }

  function write(catalog) {
    try {
      localStorage.setItem(key, JSON.stringify({
        savedAt: Date.now(),
        catalog
      }));
      return true;
    } catch (error) {
      console.warn("TV ENGINE: não foi possível salvar o cache.", error);
      return false;
    }
  }

  function getFresh() {
    const entry = read();
    if (!entry) return null;
    const ttl = Number(config.cacheTtlMs) || 21600000;
    return Date.now() - Number(entry.savedAt || 0) <= ttl ? entry.catalog : null;
  }

  window.TVEngineCache = Object.freeze({ read, write, getFresh });
})();
