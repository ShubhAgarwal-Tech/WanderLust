(() => {
  "use strict";

  const SUGGESTIONS = [
    "Bali",
    "Tokyo",
    "Maldives",
    "Aspen",
    "Barcelona",
    "Mountains",
    "Amazing pools",
    "Camping",
    "New York City",
    "Dubai",
  ];

  const HISTORY_KEY = "wl_search_history";

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveHistory(term) {
    const t = term.trim();
    if (!t) return;
    const history = getHistory().filter((h) => h !== t);
    history.unshift(t);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 6)));
  }

  function renderSuggestions(query, list) {
    const q = query.trim().toLowerCase();
    let items = [];

    if (!q) {
      items = [...getHistory(), ...SUGGESTIONS.filter((s) => !getHistory().includes(s))].slice(
        0,
        8
      );
    } else {
      const history = getHistory().filter((h) => h.toLowerCase().includes(q));
      const matches = SUGGESTIONS.filter((s) => s.toLowerCase().includes(q));
      items = [...new Set([...history, ...matches])].slice(0, 8);
    }

    list.innerHTML = items
      .map(
        (item) =>
          `<li role="option"><button type="button" data-value="${item.replace(/"/g, "&quot;")}">${item}</button></li>`
      )
      .join("");

    list.classList.toggle("is-open", items.length > 0);
  }

  function initHomeSearch() {
    const input = document.getElementById("home-search-input");
    const list = document.getElementById("home-search-suggestions");
    const form = document.getElementById("home-search-form");
    if (!input || !list || input.dataset.wlHomeEnhanced === "true") return;
    input.dataset.wlHomeEnhanced = "true";

    let debounceTimer;
    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => renderSuggestions(input.value, list), 200);
    });

    input.addEventListener("focus", () => renderSuggestions(input.value, list));

    list.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-value]");
      if (!btn) return;
      input.value = btn.dataset.value;
      list.classList.remove("is-open");
      form?.requestSubmit();
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".home-search")) list.classList.remove("is-open");
    });

    form?.addEventListener("submit", () => {
      saveHistory(input.value);
    });
  }

  initHomeSearch();
  window.addEventListener("wl:pagemount", initHomeSearch);
})();
