const Listing = require("../models/listing");
const { listingAggregationPipeline } = require("../utils/buildListingQuery");
const { normalizeListings } = require("../utils/provenImages.js");

module.exports.showHome = async (req, res) => {
  const featuredPipeline = listingAggregationPipeline({
    match: {},
    ratingMin: null,
    sort: { avgRating: -1, reviewCount: -1 },
    skip: 0,
    limit: 8,
  });

  const trendingPipeline = listingAggregationPipeline({
    match: { category: { $ne: "Trending" } },
    ratingMin: null,
    sort: { reviewCount: -1 },
    skip: 0,
    limit: 6,
  });

  let favoriteIds = [];
  if (req.user) {
    const User = require("../models/user");
    const user = await User.findById(req.user._id).select("favorites");
    favoriteIds = user?.favorites || [];
  }

  const [featuredResult, trendingResult, totalListings] = await Promise.all([
    Listing.aggregate(featuredPipeline),
    Listing.aggregate(trendingPipeline),
    Listing.countDocuments(),
  ]);

  const featured = normalizeListings(featuredResult[0]?.listings || []);
  const trending = normalizeListings(trendingResult[0]?.listings || []);

  res.render("home.ejs", {
    featured,
    trending,
    favoriteIds,
    totalListings,
    pageClass: "page-home",
    fullWidth: true,
  });
};
