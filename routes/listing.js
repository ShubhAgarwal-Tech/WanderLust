const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedin, isOwner, validatelisting } = require("../middleware.js");
const ListingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(ListingController.index))
  .post(
    isLoggedin,
    validatelisting,
    upload.single("listing[image]"),
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
    upload.single("listing[image]"),
    validatelisting,
    wrapAsync(ListingController.updateListing)
  )
  .delete(isLoggedin, isOwner, wrapAsync(ListingController.destroyListing));

//Edit Route
router.get(
  "/:id/edit",
  isLoggedin,
  isOwner,
  wrapAsync(ListingController.renderEditForm)
);

module.exports = router;
