const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const {
  validatereview,
  isLoggedin,
  isReviewAuthor,
} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

router.post(
  "/",
  isLoggedin,
  validatereview,
  wrapAsync(reviewController.createReview)
);

router.delete(
  "/:reviewId",
  isLoggedin,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
