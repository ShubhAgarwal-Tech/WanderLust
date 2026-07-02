const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedin, validateBooking } = require("../middleware.js");
const BookingController = require("../controllers/bookings.js");

router.get("/listings/:id/checkout", isLoggedin, wrapAsync(BookingController.showCheckout));

router.post(
  "/listings/:id/checkout",
  isLoggedin,
  validateBooking,
  wrapAsync(BookingController.createCheckout)
);

router.post("/verify-payment", isLoggedin, wrapAsync(BookingController.verifyPayment));
router.post("/:id/demo-pay", isLoggedin, wrapAsync(BookingController.demoPay));

router.get("/:id/confirmation", isLoggedin, wrapAsync(BookingController.showConfirmation));
router.get("/:id", isLoggedin, wrapAsync(BookingController.showBooking));

router.get("/", isLoggedin, wrapAsync(BookingController.showUserBookings));
router.delete("/:id", isLoggedin, wrapAsync(BookingController.cancelBooking));

module.exports = router;
