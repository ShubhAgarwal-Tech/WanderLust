(() => {
  "use strict";

  window.WLToast = function (message, type = "success") {
    let wrap = document.getElementById("wl-toast-stack");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "wl-toast-stack";
      wrap.className = "wl-toast-stack";
      wrap.setAttribute("aria-live", "polite");
      document.body.appendChild(wrap);
    }
    const el = document.createElement("div");
    el.className = `wl-toast wl-toast--${type}`;
    el.textContent = message;
    wrap.appendChild(el);
    requestAnimationFrame(() => el.classList.add("is-show"));
    setTimeout(() => {
      el.classList.remove("is-show");
      setTimeout(() => el.remove(), 300);
    }, 3200);
  };
})();
