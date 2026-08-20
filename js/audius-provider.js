(() => {
  const AUDIUS_ICON = `<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false"><path d="M12 3.2a8.8 8.8 0 1 0 8.8 8.8A8.8 8.8 0 0 0 12 3.2Zm0 2.2a6.6 6.6 0 1 1-6.6 6.6A6.6 6.6 0 0 1 12 5.4Zm0 2.1a4.5 4.5 0 1 0 4.5 4.5A4.5 4.5 0 0 0 12 7.5Zm0 2.2a2.3 2.3 0 1 1-2.3 2.3A2.3 2.3 0 0 1 12 9.7Z" fill="currentColor"/></svg>`;

  function ensureTab() {
    const tabs = document.getElementById("provider-tabs");
    if (!tabs || tabs.querySelector('[data-provider="audius"]')) return;
    const button = document.createElement("button");
    button.className = "provider-tab audius-provider-tab";
    button.dataset.provider = "audius";
    button.type = "button";
    button.innerHTML = `${AUDIUS_ICON}<span>Audius</span>`;
    button.addEventListener("click", () => {
      tabs.querySelectorAll(".provider-tab").forEach(tab => tab.classList.remove("active"));
      button.classList.add("active");
      const audio = document.getElementById("audio-home");
      const query = document.getElementById("search-input")?.value.trim() || "";
      const audioQuery = document.getElementById("audio-home-query");
      if (audioQuery) audioQuery.value = query;
      audio?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (query) document.getElementById("audio-home-search")?.requestSubmit();
    });
    tabs.appendChild(button);
  }

  window.addEventListener("DOMContentLoaded", ensureTab);
  if (document.readyState !== "loading") ensureTab();
})();
