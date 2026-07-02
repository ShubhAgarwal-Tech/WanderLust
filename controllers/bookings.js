const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const ExpressError = require("../utils/ExpressError.js");
const {
  hasRazorpayKeys,
  createRazorpayOrder,
  verifyRazorpaySignature,
  calcBookingTotals,
  nightsBetween,
} = require("../utils/payment.js");
const { normalizeListingImage } = require("../utils/provenImages.js");

function parseBookingInput(body) {
  const { checkIn, checkOut, guests } = body.booking || body;
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const guestCount = Math.max(1, parseInt(guests, 10) || 1);
  return { checkInDate, checkOutDate, guestCount };
}

function validateDates(checkInDate, checkOutDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    throw new ExpressError(400, "Invalid dates provided.");
  }
  if (checkInDate >= checkOutDate) {
    throw new ExpressError(400, "Check-out must be after check-in.");
  }
  if (checkInDate < today) {
    throw new ExpressError(400, "Check-in cannot be in the past.");
  }
}

async function assertAvailability(listingId, checkInDate, checkOutDate) {
  const overlap = await Booking.findOne({
    listing: listingId,
    status: { $in: ["pending", "confirmed"] },
    paymentStatus: { $in: ["pending", "paid"] },
    checkIn: { $lt: checkOutDate },
    checkOut: { $gt: checkInDate },
  });
  if (overlap) {
    throw new ExpressError(409, "Those dates are not available. Please choose different dates.");
  }
}

module.exports.showCheckout = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  const { checkIn, checkOut, guests } = req.query;
  let preview = null;
  if (checkIn && checkOut) {
    try {
      const { checkInDate, checkOutDate, guestCount } = parseBookingInput({
        booking: { checkIn, checkOut, guests },
      });
      validateDates(checkInDate, checkOutDate);
      await assertAvailability(listing._id, checkInDate, checkOutDate);
      const nights = nightsBetween(checkInDate, checkOutDate);
      const totals = calcBookingTotals(listing.price, nights);
      preview = {
        checkIn: checkInDate.toISOString().slice(0, 10),
        checkOut: checkOutDate.toISOString().slice(0, 10),
        guests: guestCount,
        nights,
        ...totals,
        pricePerNight: listing.price,
      };
    } catch (e) {
      req.flash("error", e.message);
    }
  }

  normalizeListingImage(listing);

  res.render("bookings/checkout.ejs", {
    listing,
    preview,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
    demoMode: !hasRazorpayKeys(),
    pageClass: "page-checkout",
  });
};

module.exports.createCheckout = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }

    const { checkInDate, checkOutDate, guestCount } = parseBookingInput(req.body);
    validateDates(checkInDate, checkOutDate);

    if (guestCount > (listing.maxGuests || 16)) {
      throw new ExpressError(400, `This stay allows up to ${listing.maxGuests || 16} guests.`);
    }

    await assertAvailability(listing._id, checkInDate, checkOutDate);

    const nights = nightsBetween(checkInDate, checkOutDate);
    const { subtotal, serviceFee, totalAmount } = calcBookingTotals(listing.price, nights);

    const booking = new Booking({
      user: req.user._id,
      listing: listing._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guestCount,
      nights,
      pricePerNight: listing.price,
      totalAmount,
      serviceFee,
      status: "pending",
      paymentStatus: "pending",
    });

    await booking.save();

    if (hasRazorpayKeys()) {
      const order = await createRazorpayOrder({
        amountInr: totalAmount,
        receipt: `booking_${booking._id}`,
        notes: { listingId: String(listing._id), userId: String(req.user._id) },
      });
      booking.razorpayOrderId = order.id;
      await booking.save();
    }

    normalizeListingImage(listing);

    res.render("bookings/pay.ejs", {
      booking,
      listing,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      demoMode: !hasRazorpayKeys(),
      pageClass: "page-checkout",
    });
  } catch (err) {
    req.flash("error", err.message || "Could not create booking.");
    res.redirect(req.get("Referer") || "/listings");
  }
};

module.exports.verifyPayment = async (req, res) => {
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const booking = await Booking.findById(bookingId).populate("listing");
  if (!booking || !booking.user.equals(req.user._id)) {
    throw new ExpressError(403, "Unauthorized payment verification.");
  }

  const valid = verifyRazorpaySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!valid) {
    booking.paymentStatus = "failed";
    await booking.save();
    req.flash("error", "Payment verification failed.");
    return res.redirect(`/bookings/${booking._id}`);
  }

  await finalizeBooking(booking, razorpay_payment_id, razorpay_signature);
  req.flash("success", "Payment successful! Your trip is confirmed.");
  res.redirect(`/bookings/${booking._id}/confirmation`);
};

module.exports.demoPay = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("listing");
  if (!booking || !booking.user.equals(req.user._id)) {
    throw new ExpressError(403, "Unauthorized.");
  }
  if (!hasRazorpayKeys()) {
    await finalizeBooking(booking, `demo_${Date.now()}`, "demo");
    if (req.headers.accept?.includes("application/json")) {
      return res.json({ ok: true, redirect: `/bookings/${booking._id}/confirmation` });
    }
    req.flash("success", "Demo payment successful! Booking confirmed.");
    return res.redirect(`/bookings/${booking._id}/confirmation`);
  }
  throw new ExpressError(400, "Demo payment disabled when Razorpay is configured.");
};

async function finalizeBooking(booking, paymentId, signature) {
  booking.paymentStatus = "paid";
  booking.status = "confirmed";
  booking.razorpayPaymentId = paymentId;
  booking.razorpaySignature = signature;
  booking.paidAt = new Date();
  await booking.save();

  const listingId = booking.listing._id || booking.listing;
  const listing = await Listing.findById(listingId);
  if (listing && !listing.bookings.some((b) => String(b) === String(booking._id))) {
    listing.bookings.push(booking._id);
    await listing.save();
  }

  await User.findByIdAndUpdate(booking.user, { $addToSet: { bookings: booking._id } });
}

module.exports.showConfirmation = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("listing")
    .populate("user");
  if (!booking || !booking.user._id.equals(req.user._id)) {
    req.flash("error", "Booking not found.");
    return res.redirect("/bookings");
  }
  normalizeListingImage(booking.listing);
  res.render("bookings/confirmation.ejs", { booking, pageClass: "page-checkout" });
};

module.exports.showUserBookings = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "bookings",
    populate: { path: "listing" },
    options: { sort: { createdAt: -1 } },
  });
  res.render("bookings/index.ejs", {
    bookings: (user.bookings || []).map((booking) => {
      if (booking.listing) normalizeListingImage(booking.listing);
      return booking;
    }),
    pageClass: "page-bookings",
  });
};

module.exports.showBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("listing");
  if (!booking || !booking.user.equals(req.user._id)) {
    req.flash("error", "Booking not found.");
    return res.redirect("/bookings");
  }
  normalizeListingImage(booking.listing);
  res.render("bookings/show.ejs", { booking, pageClass: "page-bookings" });
};

module.exports.cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    req.flash("error", "Booking not found.");
    return res.redirect("/bookings");
  }
  if (!booking.user.equals(req.user._id)) {
    req.flash("error", "You can only cancel your own bookings.");
    return res.redirect("/bookings");
  }
  booking.status = "cancelled";
  if (booking.paymentStatus === "paid") booking.paymentStatus = "refunded";
  await booking.save();
  req.flash("success", "Booking cancelled.");
  res.redirect("/bookings");
};
