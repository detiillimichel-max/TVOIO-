/* Conector HTTP do TV OIO para o catálogo publicado pelo TV-BRASIL-ENGINE. */
(() => {
  async function load() {
    const config = window.TV_ENGINE_CONFIG || {};
    const cache = window.TVEngineCache;
    const normalize = window.TVEngineCatalog && window.TVEngineCatalog.normalize;
    if (!config.catalogUrl || !cache || !normalize) {
      throw new Error("Módulos ou URL do TV-BRASIL-ENGINE não configurados.");
    }

    try {
      const response = await fetch(config.catalogUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-cache"
      });
      if (!response.ok) throw new Error("HTTP " + response.status);

      const raw = await response.json();
      const catalog = normalize(raw);
      if (!catalog.channels.length) throw new Error("O catálogo recebido está vazio.");

      cache.write(catalog);
      return { catalog, source: "remote", stale: false };
    } catch (error) {
      const cached = cache.read();
      if (cached && cached.catalog) {
        const catalog = normalize(cached.catalog);
        console.warn("TV ENGINE: usando última cópia em cache.", error);
        return { catalog, source: "cache", stale: true };
      }
      throw error;
    }
  }

  window.TVEngineConnector = Object.freeze({ load });
})();
