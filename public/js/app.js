(() => {
  "use strict";

  const navbar = document.getElementById("wl-navbar");
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const toggle = document.getElementById("wl-nav-toggle");
  const mobileNav = document.getElementById("wl-mobile-nav");
  const navBackdrop = document.getElementById("wl-nav-backdrop");
  if (toggle && mobileNav) {
    let lockedScrollY = 0;
    let menuIsOpen = false;

    const lockBodyScroll = () => {
      lockedScrollY = getScrollY();
      document.body.classList.add("nav-open");
      menuIsOpen = true;
    };

    const unlockBodyScroll = () => {
      if (!menuIsOpen) return;
      const scrollY = lockedScrollY;
      menuIsOpen = false;
      document.body.classList.remove("nav-open");
      restoreScroll(scrollY);
    };

    const closeMenu = () => {
      if (!mobileNav.classList.contains("is-open")) return;
      mobileNav.classList.remove("is-open");
      navbar?.classList.remove("is-menu-open");
      navBackdrop?.classList.remove("is-visible");
      navBackdrop?.setAttribute("aria-hidden", "true");
      unlockBodyScroll();
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    };

    const openMenu = () => {
      document.querySelectorAll(".wl-mobile-nav.is-open").forEach((menu) => {
        if (menu !== mobileNav) menu.classList.remove("is-open");
      });
      mobileNav.classList.add("is-open");
      navbar?.classList.add("is-menu-open");
      navBackdrop?.classList.add("is-visible");
      navBackdrop?.setAttribute("aria-hidden", "false");
      lockBodyScroll();
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
    };

    const toggleMenu = () => {
      if (mobileNav.classList.contains("is-open")) closeMenu();
      else openMenu();
    };

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleMenu();
    });

    mobileNav.addEventListener("click", (event) => {
      if (event.target.closest("a, button[type='submit']")) closeMenu();
    });

    document.addEventListener(
      "pointerdown",
      (event) => {
        if (!mobileNav.classList.contains("is-open")) return;
        if (event.target.closest("#wl-mobile-nav, #wl-nav-toggle")) return;
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
      },
      true
    );

    navBackdrop?.addEventListener("click", (event) => {
      event.preventDefault();
      closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !mobileNav.classList.contains("is-open")) return;
      closeMenu();
      toggle.focus();
    });

    window.WLCloseNavMenu = closeMenu;
  }

  document.body.classList.add("has-fixed-nav");

  document.querySelectorAll(".wl-reveal").forEach((el) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
  });

  document.querySelectorAll(".wl-flash").forEach((flash) => {
    setTimeout(() => {
      flash.style.transition = "opacity 0.4s ease";
      flash.style.opacity = "0";
      setTimeout(() => flash.remove(), 400);
    }, 4500);
  });

  const main = document.getElementById("main-content");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const ENABLE_PJAX = true;
  let navAbort = null;
  let suppressScrollSave = false;

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = ENABLE_PJAX ? "manual" : "auto";
  }

  function makeHistoryKey() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function currentHistoryState() {
    return window.history.state && typeof window.history.state === "object"
      ? window.history.state
      : {};
  }

  function currentHistoryKey() {
    return currentHistoryState().wlKey;
  }

  const scrollKey = (key = currentHistoryKey()) => `wl-scroll:${key || "initial"}`;

  function getScrollY() {
    return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  function saveCurrentScroll(options = {}) {
    const { force = false } = options;
    if (!force && suppressScrollSave) return;
    const y = getScrollY();
    const state = currentHistoryState();
    const key = state.wlKey || makeHistoryKey();
    try {
      sessionStorage.setItem(scrollKey(key), String(y));
    } catch {
      // Ignore private-mode storage failures; history state is still available.
    }
    window.history.replaceState(
      { ...state, wlKey: key, wlScrollY: y },
      "",
      window.location.href
    );
  }

  function savedScrollFor(state) {
    if (typeof state?.wlScrollY === "number") return state.wlScrollY;
    try {
      const stored = sessionStorage.getItem(scrollKey(state?.wlKey));
      return stored == null ? 0 : Math.max(0, Number(stored) || 0);
    } catch {
      return 0;
    }
  }

  function restoreScroll(y) {
    const target = Math.max(0, Number(y) || 0);
    suppressScrollSave = true;
    window.clearTimeout(scrollSaveTimer);
    window.scrollTo({ top: target, left: 0, behavior: "auto" });
    requestAnimationFrame(() => {
      window.scrollTo({ top: target, left: 0, behavior: "auto" });
      requestAnimationFrame(() => {
        window.scrollTo({ top: target, left: 0, behavior: "auto" });
        window.setTimeout(() => {
          suppressScrollSave = false;
        }, 80);
      });
    });
  }

  if (ENABLE_PJAX && (!currentHistoryKey() || typeof currentHistoryState().wlScrollY !== "number")) {
    saveCurrentScroll();
  }

  let scrollSaveTimer = null;
  if (ENABLE_PJAX) {
    window.addEventListener(
      "scroll",
      () => {
        if (document.body.classList.contains("nav-open") || suppressScrollSave) return;
        window.clearTimeout(scrollSaveTimer);
        scrollSaveTimer = window.setTimeout(saveCurrentScroll, 120);
      },
      { passive: true }
    );
  }

  function isEnhancedNavigationTarget(link) {
    if (!main || !link) return false;
    if (link.target || link.hasAttribute("download")) return false;
    if (link.dataset.noPjax === "true") return false;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) return false;
    if (!["/", "/listings", "/login", "/signup", "/favorites", "/bookings"].some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`))) return false;
    if (url.pathname.includes("/checkout") || url.pathname.includes("/confirmation")) return false;
    return true;
  }

  function runPageEnhancers() {
    window.WLEnhanceImages?.();
    document.querySelectorAll(".wl-reveal:not(.is-visible)").forEach((el) => {
      if (prefersReducedMotion.matches) {
        el.classList.add("is-visible");
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      observer.observe(el);
    });
  }

  async function navigate(url, options = {}) {
    const { push = true, restoreY = 0 } = options;
    if (push) saveCurrentScroll({ force: true });
    suppressScrollSave = true;
    window.clearTimeout(scrollSaveTimer);
    if (navAbort) navAbort.abort();
    navAbort = new AbortController();
    document.documentElement.classList.add("wl-page-loading");
    try {
      const res = await fetch(url, {
        signal: navAbort.signal,
        headers: { "X-WL-PJAX": "true", Accept: "text/html" },
      });
      if (!res.ok) throw new Error("Navigation failed");
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const nextMain = doc.getElementById("main-content");
      if (!nextMain) throw new Error("Missing main content");
      document.title = doc.title;
      window.WLCloseNavMenu?.();
      document.body.className = doc.body.className;
      document.body.classList.add("has-fixed-nav");
      document.body.dataset.loggedIn = doc.body.dataset.loggedIn || "false";
      main.innerHTML = nextMain.innerHTML;
      if (push) window.history.pushState({ wlKey: makeHistoryKey(), wlScrollY: 0 }, "", url);
      runPageEnhancers();
      window.dispatchEvent(new CustomEvent("wl:pagemount"));
      restoreScroll(push ? 0 : restoreY);
    } catch (err) {
      if (err.name !== "AbortError") window.location.href = url;
      suppressScrollSave = false;
    } finally {
      document.documentElement.classList.remove("wl-page-loading");
    }
  }

  document.addEventListener("click", (event) => {
    if (!ENABLE_PJAX) return;
    const link = event.target.closest("a[href]");
    if (!isEnhancedNavigationTarget(link)) return;
    event.preventDefault();
    navigate(link.href, { push: true, restoreY: 0 });
  });

  window.addEventListener("popstate", (event) => {
    if (!ENABLE_PJAX) return;
    const restoreY = savedScrollFor(event.state);
    navigate(window.location.href, { push: false, restoreY });
  });

  if (ENABLE_PJAX) {
    window.addEventListener("pagehide", () => saveCurrentScroll({ force: true }));
  }
})();
