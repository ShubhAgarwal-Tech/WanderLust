(() => {
  "use strict";

  const LIGHT_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const DARK_TILES =
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  let mapInstance = null;
  let tileLayer = null;

  function isDark() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function tileConfig() {
    return isDark()
      ? {
          url: DARK_TILES,
          options: {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 20,
            className: "wl-map-tiles--dark",
          },
        }
      : {
          url: LIGHT_TILES,
          options: {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          },
        };
  }

  function applyTiles(map) {
    if (tileLayer) map.removeLayer(tileLayer);
    const cfg = tileConfig();
    tileLayer = L.tileLayer(cfg.url, cfg.options).addTo(map);
  }

  function initMap() {
    const el = document.getElementById("listing-map");
    if (!el || typeof L === "undefined") return;

    const lat = parseFloat(el.dataset.lat);
    const lng = parseFloat(el.dataset.lng);
    const title = el.dataset.title || "Listing";

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      el.innerHTML =
        '<div class="wl-map-placeholder"><i class="fa-solid fa-map-location-dot fa-2x mb-2"></i><p>Map location is not available for this listing.</p></div>';
      return;
    }

    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }

    el.innerHTML = "";
    el.classList.add("wl-map--ready");

    mapInstance = L.map(el, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([lat, lng], 12);

    applyTiles(mapInstance);

    const markerIcon = L.divIcon({
      className: "wl-map-marker",
      html: '<div class="wl-map-marker-pin"></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const popup = document.createElement("strong");
    popup.textContent = title;
    L.marker([lat, lng], { icon: markerIcon })
      .addTo(mapInstance)
      .bindPopup(popup)
      .openPopup();

    setTimeout(() => mapInstance.invalidateSize(), 200);
  }

  function onThemeChange() {
    if (mapInstance) applyTiles(mapInstance);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMap);
  } else {
    initMap();
  }

  window.addEventListener("wl:pagemount", initMap);
  window.addEventListener("wl-theme-change", onThemeChange);

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-theme-toggle]")) {
      setTimeout(onThemeChange, 300);
    }
  });
})();
