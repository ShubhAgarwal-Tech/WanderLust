(() => {
  "use strict";

  let abortCtrl = null;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function renderCard(l, isLoggedIn) {
    const img = l.image?.url || "";
    const rating =
      l.avgRating != null
        ? `<span class="listing-card__rating me-2"><i class="fa-solid fa-star"></i> ${l.avgRating.toFixed(1)}${l.reviewCount ? ` <span class="text-muted">(${l.reviewCount})</span>` : ""}</span>`
        : "";
    const favBtn = isLoggedIn
      ? `<button type="button" class="listing-card__favorite js-favorite-toggle" data-listing-id="${l._id}" data-favorited="${l.isFavorited ? "true" : "false"}" data-auth="true" aria-pressed="${l.isFavorited}"><i class="${l.isFavorited ? "fa-solid fa-heart text-danger" : "fa-regular fa-heart"}"></i></button>`
      : `<a href="/login" class="listing-card__favorite" aria-label="Sign in to save"><i class="fa-regular fa-heart"></i></a>`;
    const badge =
      l.category && l.category !== "Trending"
        ? `<span class="wl-badge listing-card__type">${escapeHtml(l.category)}</span>`
        : "";

    const cat = escapeHtml(l.category || "Trending");
    return `<article class="listing-card">
      <div class="listing-card__media">
        <div class="wl-img-wrap wl-img-wrap--ratio">
          <img src="${escapeHtml(img)}" alt="${escapeHtml(l.title)}" class="wl-img" loading="lazy" decoding="async" data-title="${escapeHtml(l.title)}" data-category="${cat}" />
          <span class="wl-img-skeleton" aria-hidden="true"></span>
        </div>
        ${badge}
        ${favBtn}
        <a href="/listings/${l._id}" class="listing-card__link" aria-label="View ${escapeHtml(l.title)}"></a>
      </div>
      <div class="listing-card__body">
        <h3 class="listing-card__title">${escapeHtml(l.location)}, ${escapeHtml(l.country)}</h3>
        <p class="listing-card__meta">${escapeHtml(l.title)}</p>
        <p class="listing-card__price">${rating}<strong>&#8377;${Number(l.price).toLocaleString("en-IN")}</strong><span class="text-muted"> night</span></p>
        ${l.propertyType ? `<p class="listing-card__meta mb-0">${escapeHtml(l.propertyType)}</p>` : ""}
      </div>
    </article>`;
  }

  function renderEmpty() {
    return `<div class="wl-grid-full"><div class="wl-empty is-visible">
      <div class="wl-empty__icon"><i class="fa-solid fa-magnifying-glass"></i></div>
      <h3>No stays found</h3>
      <p>Try clearing filters or browse all categories.</p>
      <div class="wl-empty__actions">
        <a href="/listings" class="wl-btn wl-btn--primary">Clear filters</a>
        <a href="/" class="wl-btn wl-btn--ghost">Back to home</a>
      </div>
    </div></div>`;
  }

  function initListingsPage() {
    const form = document.getElementById("listings-filter-form");
    const grid = document.getElementById("listings-grid");
    const countEl = document.getElementById("results-count");
    const categoryInput = document.getElementById("filter-category");
    const isLoggedIn = document.body.dataset.loggedIn === "true";

    if (!form || !grid || form.dataset.wlListingsEnhanced === "true") return;
    form.dataset.wlListingsEnhanced = "true";

    async function loadListings(params, pushUrl = true) {
    if (abortCtrl) abortCtrl.abort();
    abortCtrl = new AbortController();

    grid.classList.add("is-loading");
    const url = `/listings?${params.toString()}`;
    if (pushUrl) window.history.pushState({}, "", url);

    try {
      const res = await fetch(`/listings/api?${params.toString()}`, {
        signal: abortCtrl.signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();

      if (countEl) countEl.textContent = data.totalCount;

      document.querySelectorAll("#category-bar .wl-category").forEach((el) => {
        const cat = el.dataset.category;
        const activeCat = params.get("category") || "";
        const isTrending = !activeCat || activeCat === "Trending";
        el.classList.toggle(
          "is-active",
          isTrending ? cat === "Trending" : cat === activeCat
        );
      });

      grid.innerHTML = data.listings.length
        ? data.listings.map((listing) => renderCard(listing, isLoggedIn)).join("")
        : renderEmpty();
      if (window.WLEnhanceImages) window.WLEnhanceImages();
    } catch (err) {
      if (err.name !== "AbortError") form.submit();
    } finally {
      grid.classList.remove("is-loading");
    }
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      loadListings(new URLSearchParams(new FormData(form)));
    });

    document.querySelectorAll("#category-bar .wl-category").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const cat = link.dataset.category || "";
        if (categoryInput) categoryInput.value = cat === "Trending" ? "" : cat;
        const params = new URLSearchParams(new FormData(form));
        if (cat === "Trending") params.delete("category");
        else params.set("category", cat);
        params.delete("page");
        loadListings(params);
      });
    });

    const chips = document.getElementById("amenity-chips");
    const amenitiesInput = document.getElementById("filter-amenities");
    if (chips && amenitiesInput) {
      chips.addEventListener("click", (e) => {
        const chip = e.target.closest(".wl-filter-chip");
        if (!chip) return;
        chip.classList.toggle("is-selected");
        const selected = [...chips.querySelectorAll(".wl-filter-chip.is-selected")].map(
          (c) => c.dataset.amenity
        );
        amenitiesInput.value = selected.join(",");
      });
    }

    const taxToggle = document.getElementById("tax-toggle");
    if (taxToggle) {
      taxToggle.addEventListener("change", () => {
        document.querySelectorAll(".listing-card__price").forEach((el) => {
          if (!el.dataset.baseHtml) el.dataset.baseHtml = el.innerHTML;
          el.innerHTML =
            el.dataset.baseHtml +
            (taxToggle.checked ? " <span class='text-muted small'>+ GST</span>" : "");
        });
      });
    }

  }

  initListingsPage();
  window.addEventListener("wl:pagemount", initListingsPage);
})();
