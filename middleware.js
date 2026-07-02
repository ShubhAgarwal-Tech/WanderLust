const Listing = require("./models/listing");
const { ListingSchema,reviewSchema,bookingSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review");

module.exports.isLoggedin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    if (
      req.xhr ||
      req.headers.accept?.includes("application/json") ||
      req.get("X-Requested-With") === "XMLHttpRequest"
    ) {
      return res.status(401).json({ ok: false, message: "Please log in first." });
    }
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "Please Login!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }
  const ownerId = listing.owner._id || listing.owner;
  if (!ownerId.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to edit this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validatelisting = (req, res, next) => {
  let { error } = ListingSchema.validate(req.body, { abortEarly: false, convert: true });
  if (error) {
    let msg = error.details.map((el) => el.message.replace(/"/g, "")).join(", ");
    if (req.headers.accept?.includes("application/json")) {
      return res.status(400).json({ ok: false, message: msg });
    }
    req.flash("error", msg);
    const id = req.params.id;
    return res.redirect(id ? `/listings/${id}/edit` : "/listings/new");
  }
  next();
};

module.exports.validatereview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body, { abortEarly: false, convert: true });
  if (error) {
    let msg = error.details.map((el) => el.message.replace(/"/g, "")).join(", ");
    if (req.headers.accept?.includes("application/json")) {
      return res.status(400).json({ ok: false, message: msg });
    }
    req.flash("error", msg);
    return res.redirect(`/listings/${req.params.id}`);
  }
  next();
};

module.exports.validateBooking = (req, res, next) => {
  let { error } = bookingSchema.validate(req.body, { abortEarly: false, convert: true });
  if (error) {
    let msg = error.details.map((el) => el.message.replace(/"/g, "")).join(", ");
    if (req.headers.accept?.includes("application/json")) {
      return res.status(400).json({ ok: false, message: msg });
    }
    req.flash("error", msg);
    return res.redirect(req.get("Referer") || "/listings");
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id,reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found.");
    return res.redirect(`/listings/${id}`);
  }
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to edit this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
