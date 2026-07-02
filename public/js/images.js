(() => {
  "use strict";

  /* Keep in sync with utils/provenImages.js */
  const FALLBACK =
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80";

  const CATEGORY_FALLBACKS = {
    Trending: FALLBACK,
    Rooms:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
    "Iconic Cities":
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
    Mountains:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
    Castles:
      "https://images.unsplash.com/photo-1585543805890-6051f7829f98?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
    "Amazing pools":
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
    Camping:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
    Farm:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
    Arctic:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
  };

  const TITLE_FALLBACKS = {
    "Oceanfront Beach Cottage": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
    "Tropical Beachfront Bungalow": "https://images.unsplash.com/photo-1602391833977-358a52198938?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
    "Luxury Overwater Villa": "https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
    "Cliffside Infinity Pool Villa": "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
    "Cozy Mountain Cabin": "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
    "Desert Glamping Suite": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
    "Greek Cliffside Villa": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
  };

  const KEYWORD_FALLBACKS = [
    [/beach|ocean|coast|bungalow|island|maldives|bali|mykonos|santorini/i, "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80"],
    [/mountain|cabin|chalet|ski|aspen|banff|alpine|himalayan|fjord/i, "https://images.unsplash.com/photo-1449158743715-0a0908a71f9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80"],
    [/villa|luxury|estate|penthouse|pool|tropical|oasis/i, "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80"],
    [/apartment|loft|flat|city|downtown|tokyo|paris|new york|barcelona|sydney|seoul/i, "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80"],
    [/hotel|suite|room|boutique/i, "https://images.unsplash.com/photo-1560067174-8943bd0b3c40?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80"],
    [/castle|haveli|heritage|historic|brownstone|canal|riad|cottage/i, "https://images.unsplash.com/photo-1585543805890-6051f7829f98?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80"],
    [/camp|treehouse|glamping|dome|lodge|safari|rainforest/i, "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80"],
    [/farm|vineyard|barn|countryside|tuscany/i, "https://images.unsplash.com/photo-1416331108676-22c7610c9f9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80"],
    [/arctic|igloo|snow|rovaniemi|norway/i, "https://images.unsplash.com/photo-1531366936337-7c912a33869b?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80"],
  ];

  function fallbackFor(img) {
    if (img.dataset.fallback) {
      return img.dataset.fallback;
    }

    const isDestination = Boolean(img.closest(".home-destination"));
    const text = [
      img.alt,
      img.dataset.title,
      isDestination
        ? img.closest(".home-destination")?.textContent
        : img.closest("article, section, .row")?.textContent,
    ]
      .filter(Boolean)
      .join(" ");
    if (img.dataset.title && TITLE_FALLBACKS[img.dataset.title]) {
      return TITLE_FALLBACKS[img.dataset.title];
    }
    const match = KEYWORD_FALLBACKS.find(([regex]) => regex.test(text));
    if (match) return match[1];
    const cat = img.dataset.category;
    if (cat && CATEGORY_FALLBACKS[cat]) return CATEGORY_FALLBACKS[cat];
    return img.dataset.fallback || FALLBACK;
  }

  function markLoaded(img) {
    img.classList.add("is-loaded");
    img.classList.remove("is-error");
  }

  function useFallback(img) {
    const fb = fallbackFor(img);
    if (img.src !== fb) {
      img.src = fb;
      img.classList.add("is-error");
      markLoaded(img);
      return;
    }
    markLoaded(img);
  }

  function enhance(img) {
    if (img.dataset.wlEnhanced) return;
    img.dataset.wlEnhanced = "1";
    img.classList.add("wl-img");
    if (!img.getAttribute("loading")) img.setAttribute("loading", "lazy");
    if (!img.getAttribute("decoding")) img.setAttribute("decoding", "async");

    if (!img.getAttribute("src")) {
      useFallback(img);
      return;
    }

    if (img.complete && img.naturalWidth > 0) {
      markLoaded(img);
    } else {
      img.addEventListener("load", () => markLoaded(img), { once: true });
      img.addEventListener("error", () => useFallback(img), { once: true });
    }
  }

  function wrapListingMedia() {
    document.querySelectorAll(".listing-card__media").forEach((media) => {
      const img = media.querySelector("img");
      if (!img || media.querySelector(".wl-img-wrap")) return;

      const wrap = document.createElement("div");
      wrap.className = "wl-img-wrap wl-img-wrap--ratio";
      const sk = document.createElement("span");
      sk.className = "wl-img-skeleton";
      sk.setAttribute("aria-hidden", "true");

      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);
      wrap.appendChild(sk);
      enhance(img);
    });
  }

  function scan() {
    document
      .querySelectorAll(
        "img.wl-img, .listing-card__media img, .home-destination img, .wl-img-wrap img"
      )
      .forEach(enhance);
    wrapListingMedia();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scan);
  } else {
    scan();
  }

  window.WLEnhanceImages = scan;
  window.WL_IMAGE_FALLBACK = FALLBACK;
})();
