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
      lockedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      document.body.style.position = "fixed";
      document.body.style.top = `-${lockedScrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.classList.add("nav-open");
      menuIsOpen = true;
    };

    const unlockBodyScroll = () => {
      if (!menuIsOpen) return;
      const scrollY = lockedScrollY;
      menuIsOpen = false;
      document.body.classList.remove("nav-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.documentElement.scrollTop = scrollY;
      document.body.scrollTop = scrollY;
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
  let navAbort = null;

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

  async function navigate(url, push = true) {
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
      document.body.className = doc.body.className;
      document.body.classList.add("has-fixed-nav");
      document.body.dataset.loggedIn = doc.body.dataset.loggedIn || "false";
      window.WLCloseNavMenu?.();
      main.innerHTML = nextMain.innerHTML;
      if (push) window.history.pushState({}, "", url);
      window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
      runPageEnhancers();
      window.dispatchEvent(new CustomEvent("wl:pagemount"));
    } catch (err) {
      if (err.name !== "AbortError") window.location.href = url;
    } finally {
      document.documentElement.classList.remove("wl-page-loading");
    }
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!isEnhancedNavigationTarget(link)) return;
    event.preventDefault();
    navigate(link.href);
  });

  window.addEventListener("popstate", () => navigate(window.location.href, false));
})();
