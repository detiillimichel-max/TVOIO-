/* Normalização do catálogo remoto sem descartar formatos reconhecidos. */
(() => {
  const text = value => String(value == null ? "" : value).trim();

  function normalize(raw) {
    if (!raw || !Array.isArray(raw.channels)) {
      throw new Error("O catálogo remoto não contém uma lista válida de canais.");
    }

    const seen = new Set();
    const channels = raw.channels.map(item => {
      const id = text(item.engineId || item.id).replace(/^engine-/, "");
      const name = text(item.name);
      const url = text(item.url || item.streamUrl);
      if (!id || !name || !url) return null;

      const identity = id.toLowerCase() + "|" + url.toLowerCase();
      if (seen.has(identity)) return null;
      seen.add(identity);

      const categories = Array.isArray(item.categories) && item.categories.length
        ? item.categories.map(text).filter(Boolean)
        : [text(item.category) || "Outros"];

      return {
        id: "engine-" + id,
        engineId: id,
        name,
        category: text(item.category) || categories[0] || "Outros",
        categories,
        country: "🇧🇷 Brasil",
        logoUrl: text(item.logo || item.logoUrl),
        streamUrl: url,
        streamFormat: text(item.format || item.streamFormat).toLowerCase() || "unknown",
        source: text(item.source),
        validation: text(item.playback_check)
      };
    }).filter(Boolean);

    return {
      schemaVersion: raw.schema_version || 1,
      updatedAt: raw.updated_at || null,
      totalChannels: channels.length,
      categories: Array.isArray(raw.categories) ? raw.categories : [],
      channels
    };
  }

  window.TVEngineCatalog = Object.freeze({ normalize });
})();
