(() => {
  "use strict";

  function iso(date) {
    return date.toISOString().slice(0, 10);
  }

  function addDays(value, days) {
    const date = value ? new Date(`${value}T00:00:00`) : new Date();
    date.setDate(date.getDate() + days);
    return iso(date);
  }

  function enhanceForm(form) {
    const checkIn = form.querySelector('input[name="checkIn"], input[name="booking[checkIn]"]');
    const checkOut = form.querySelector('input[name="checkOut"], input[name="booking[checkOut]"]');
    const submit = form.querySelector('button[type="submit"]');
    if (!checkIn || !checkOut) return;

    const today = iso(new Date());
    checkIn.min = checkIn.min || today;
    checkOut.min = checkIn.value ? addDays(checkIn.value, 1) : addDays(today, 1);

    function sync() {
      const minCheckout = addDays(checkIn.value || today, 1);
      checkOut.min = minCheckout;
      if (checkOut.value && checkOut.value < minCheckout) checkOut.value = minCheckout;
    }

    checkIn.addEventListener("change", sync);
    form.addEventListener("submit", (event) => {
      sync();
      if (!checkIn.value || !checkOut.value || checkOut.value <= checkIn.value) {
        event.preventDefault();
        window.WLToast?.("Choose a valid check-in and check-out date.", "error");
        checkOut.focus();
        return;
      }
      if (submit) {
        submit.disabled = true;
        submit.classList.add("is-loading");
      }
    });
  }

  function initBookingForms() {
    document
      .querySelectorAll(".js-booking-preview-form, form[action*='/bookings/listings/']")
      .forEach((form) => {
        if (form.dataset.wlBookingEnhanced === "true") return;
        form.dataset.wlBookingEnhanced = "true";
        enhanceForm(form);
      });
  }

  initBookingForms();
  window.addEventListener("wl:pagemount", initBookingForms);
})();
