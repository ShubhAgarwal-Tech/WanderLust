const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedin, isOwner, validatelisting } = require("../middleware.js");
const ListingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 9,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed."));
    }
    cb(null, true);
  },
});

const listingImageUpload = (req, res, next) => {
  upload.fields([
    { name: "listing[image]", maxCount: 1 },
    { name: "listing[images]", maxCount: 8 },
  ])(req, res, (err) => {
    if (!err) return next();
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Each image must be smaller than 5 MB."
        : err.message || "Image upload failed. Please try again.";
    req.flash("error", message);
    return res.redirect(req.get("Referer") || "/listings/new");
  });
};

router.get("/api", wrapAsync(ListingController.apiIndex));

router
  .route("/")
  .get(wrapAsync(ListingController.index))
  .post(
    isLoggedin,
    listingImageUpload,
    validatelisting,
    wrapAsync(ListingController.createListing)
  );

//New Route
router.get("/new", isLoggedin, ListingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(ListingController.showListing))
  .put(
    isLoggedin,
    isOwner,
    listingImageUpload,
    validatelisting,
    wrapAsync(ListingController.updateListing)
  )
  .delete(isLoggedin, isOwner, wrapAsync(ListingController.destroyListing));

router.post(
  "/:id/favorite",
  isLoggedin,
  wrapAsync(ListingController.toggleFavorite)
);

//Edit Route
router.get(
  "/:id/edit",
  isLoggedin,
  isOwner,
  wrapAsync(ListingController.renderEditForm)
);

module.exports = router;
