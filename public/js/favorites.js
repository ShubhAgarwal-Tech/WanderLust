(() => {
  "use strict";

  const LOGIN_MSG = "Please log in to save favorites.";

  async function toggleFavorite(listingId, button) {
    const res = await fetch(`/listings/${listingId}/favorite`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "same-origin",
    });

    const contentType = res.headers.get("content-type") || "";
    if (!res.ok || !contentType.includes("application/json")) {
      if (res.status === 401 || res.url?.includes("/login")) {
        window.WLToast?.(LOGIN_MSG, "error");
        return null;
      }
      throw new Error("Could not update wishlist");
    }

    return res.json();
  }

  function setHeartState(button, favorited) {
    const icon = button.querySelector("i");
    if (!icon) return;
    icon.classList.toggle("fa-solid", favorited);
    icon.classList.toggle("fa-regular", !favorited);
    icon.classList.toggle("text-danger", favorited);
    button.setAttribute("aria-pressed", String(favorited));
    button.setAttribute(
      "aria-label",
      favorited ? "Remove from wishlist" : "Add to wishlist"
    );
    button.dataset.favorited = favorited ? "true" : "false";
    button.classList.add("is-pop");
    setTimeout(() => button.classList.remove("is-pop"), 300);
  }

  function isFavoritesPage() {
    return Boolean(document.querySelector("[data-favorites-grid]"));
  }

  function syncFavoritesCount() {
    const grid = document.querySelector("[data-favorites-grid]");
    const countEl = document.querySelector("[data-favorites-count]");
    if (!grid || !countEl) return;
    const count = grid.querySelectorAll("[data-listing-card]").length;
    countEl.textContent = String(count);
    const copy = countEl.parentElement;
    if (copy) {
      copy.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.includes("saved stay")) {
          node.textContent = ` saved stay${count === 1 ? "" : "s"} for your next trip.`;
        }
      });
    }
  }

  function showFavoritesEmptyState() {
    const grid = document.querySelector("[data-favorites-grid]");
    if (!grid || grid.querySelector("[data-listing-card]")) return;
    grid.outerHTML = `<div class="wl-empty is-visible">
      <div class="wl-empty__icon"><i class="fa-regular fa-heart"></i></div>
      <h3>No favorites yet</h3>
      <p>Explore stays and tap the heart to save places for later.</p>
      <div class="wl-empty__actions">
        <a href="/listings" class="wl-btn wl-btn--primary">Explore stays</a>
        <a href="/" class="wl-btn wl-btn--ghost">Back to home</a>
      </div>
    </div>`;
  }

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".js-favorite-toggle");
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    if (btn.dataset.auth === "false") {
      window.WLToast?.(LOGIN_MSG, "error");
      return;
    }

    const listingId = btn.dataset.listingId;
    if (!listingId || btn.disabled) return;

    const wasFavorited = btn.dataset.favorited === "true";
    const card = btn.closest("[data-listing-card]");
    const removeFromFavoritesPage = isFavoritesPage() && wasFavorited;
    setHeartState(btn, !wasFavorited);
    btn.disabled = true;
    if (removeFromFavoritesPage && card) card.classList.add("is-removing");

    try {
      const data = await toggleFavorite(listingId, btn);
      if (data) {
        setHeartState(btn, data.favorited);
        if (removeFromFavoritesPage && !data.favorited && card) {
          card.addEventListener(
            "transitionend",
            () => {
              card.remove();
              syncFavoritesCount();
              showFavoritesEmptyState();
            },
            { once: true }
          );
          window.setTimeout(() => {
            if (card.isConnected) {
              card.remove();
              syncFavoritesCount();
              showFavoritesEmptyState();
            }
          }, 260);
        }
        window.WLToast?.(
          data.favorited ? "Saved to wishlist" : "Removed from wishlist",
          "success"
        );
      } else {
        setHeartState(btn, wasFavorited);
      }
    } catch {
      if (card) card.classList.remove("is-removing");
      setHeartState(btn, wasFavorited);
      window.WLToast?.("Could not update wishlist. Try again.", "error");
    } finally {
      if (btn.isConnected) btn.disabled = false;
    }
  });
})();
