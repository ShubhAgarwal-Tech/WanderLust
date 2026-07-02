(() => {
  "use strict";

  const demoBtn = document.getElementById("wl-demo-pay");
  if (demoBtn) {
    demoBtn.addEventListener("click", async () => {
      demoBtn.disabled = true;
      demoBtn.textContent = "Processing…";
      try {
        const res = await fetch(`/bookings/${demoBtn.dataset.bookingId}/demo-pay`, {
          method: "POST",
          headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
          credentials: "same-origin",
        });
        const data = await res.json();
        if (data.redirect) window.location.href = data.redirect;
        else window.location.reload();
      } catch {
        window.WLToast?.("Payment failed. Try again.", "error");
        demoBtn.disabled = false;
        demoBtn.textContent = "Retry demo payment";
      }
    });
    return;
  }

  const payBtn = document.getElementById("wl-razorpay-pay");
  const cfg = window.WL_PAYMENT;
  if (!payBtn || !cfg || typeof Razorpay === "undefined") return;

  payBtn.addEventListener("click", () => {
    const options = {
      key: cfg.key,
      amount: cfg.amount,
      currency: "INR",
      name: cfg.name,
      description: cfg.title,
      order_id: cfg.orderId,
      prefill: { email: cfg.email },
      theme: { color: "#ff385c" },
      handler: async (response) => {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/bookings/verify-payment";
        const fields = {
          bookingId: cfg.bookingId,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        };
        Object.entries(fields).forEach(([k, v]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = k;
          input.value = v;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      },
    };
    new Razorpay(options).open();
  });
})();
