const Listing = require("../models/listing");
const User = require("../models/user");
const {
  buildListingQuery,
  listingAggregationPipeline,
} = require("../utils/buildListingQuery");
const {
  CATEGORIES,
  PROPERTY_TYPES,
  AMENITIES,
  SORT_OPTIONS,
} = require("../utils/categories");
const {
  fallbackForListing,
  normalizeListingImage,
  normalizeListings,
} = require("../utils/provenImages.js");
const { cloudinary, hasCloudinaryConfig } = require("../cloudConfig.js");

async function getFavoriteIds(req) {
  if (!req.user) return [];
  const user = await User.findById(req.user._id).select("favorites");
  return user?.favorites || [];
}

function queryParamsFromRequest(req) {
  return {
    q: req.query.q,
    category: req.query.category,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    guests: req.query.guests,
    minRating: req.query.minRating,
    propertyType: req.query.propertyType,
    amenities: req.query.amenities,
    sort: req.query.sort,
    page: req.query.page,
    limit: req.query.limit,
  };
}

function filtersPayload(req) {
  const q = queryParamsFromRequest(req);
  return {
    ...q,
    categories: CATEGORIES,
    propertyTypes: PROPERTY_TYPES,
    amenitiesList: AMENITIES,
    sortOptions: SORT_OPTIONS,
  };
}

function normalizeListingForm(listing = {}) {
  if (listing.amenities && !Array.isArray(listing.amenities)) {
    listing.amenities = [listing.amenities];
  }
  if (!listing.amenities) listing.amenities = [];
  if (listing.price !== undefined) listing.price = Number(listing.price);
  if (listing.maxGuests !== undefined) listing.maxGuests = Number(listing.maxGuests);
  return listing;
}

function cloudinaryPublicIdsFor(listing = {}) {
  const ids = new Set();
  [listing.image, ...(listing.images || [])].forEach((image) => {
    const filename = image?.filename;
    if (!filename || filename === "fallback" || filename === "listingimage") return;
    ids.add(filename);
  });
  return [...ids];
}

async function deleteListingImagesFromCloudinary(listing) {
  if (!hasCloudinaryConfig) return;
  const publicIds = cloudinaryPublicIdsFor(listing);
  if (!publicIds.length) return;

  await Promise.allSettled(
    publicIds.map((publicId) => cloudinary.uploader.destroy(publicId))
  );
}

module.exports.index = async (req, res) => {
  const params = queryParamsFromRequest(req);
  const { match, ratingMin, sort, sortKey, page, limit, skip } =
    buildListingQuery(params);

  const pipeline = listingAggregationPipeline({
    match,
    ratingMin,
    sort,
    skip,
    limit,
  });

  const [result, favoriteIds] = await Promise.all([
    Listing.aggregate(pipeline),
    getFavoriteIds(req),
  ]);

  const listings = normalizeListings(result[0]?.listings || []);
  const totalCount = result[0]?.totalCount[0]?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  res.render("listings/index.ejs", {
    listings,
    favoriteIds,
    currentUrl: req.originalUrl,
    page,
    limit,
    totalCount,
    totalPages,
    ...filtersPayload(req),
    pageClass: "page-listings",
    fullWidth: true,
  });
};

module.exports.apiIndex = async (req, res) => {
  const params = queryParamsFromRequest(req);
  const { match, ratingMin, sort, page, limit, skip } = buildListingQuery(params);

  const pipeline = listingAggregationPipeline({
    match,
    ratingMin,
    sort,
    skip,
    limit,
  });

  const [result, favoriteIds] = await Promise.all([
    Listing.aggregate(pipeline),
    getFavoriteIds(req),
  ]);

  const listings = normalizeListings(result[0]?.listings || []);
  const totalCount = result[0]?.totalCount[0]?.count || 0;
  const favSet = new Set(favoriteIds.map((id) => String(id)));

  res.json({
    listings: listings.map((l) => ({
      _id: l._id,
      title: l.title,
      location: l.location,
      country: l.country,
      price: l.price,
      category: l.category,
      propertyType: l.propertyType,
      image: l.image,
      avgRating: l.avgRating,
      reviewCount: l.reviewCount,
      isFavorited: favSet.has(String(l._id)),
    })),
    totalCount,
    page,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    isLoggedIn: !!req.user,
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs", {
    categories: CATEGORIES,
    propertyTypes: PROPERTY_TYPES,
    amenitiesList: AMENITIES,
    pageClass: "page-listing-form",
  });
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Your Requested Listing does not exist!");
    return res.redirect("/listings");
  }

  let isFavorited = false;
  if (req.user) {
    const user = await User.findById(req.user._id).select("favorites");
    isFavorited = user?.favorites?.some((favId) => favId.equals(listing._id));
  }

  const avgRating =
    listing.reviews.length > 0
      ? listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length
      : null;

  normalizeListingImage(listing);

  const similarListings = normalizeListings(
    await Listing.find({
      _id: { $ne: listing._id },
      category: listing.category,
    })
      .limit(4)
      .select("title price location country image category")
      .lean()
  );

  const favoriteIds = await getFavoriteIds(req);

  res.render("listings/show.ejs", {
    listing,
    isFavorited,
    avgRating,
    similarListings,
    favoriteIds,
    currentUrl: req.originalUrl,
    pageClass: "page-show",
    fullWidth: false,
  });
};

module.exports.toggleFavorite = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id).select("favorites");

  const alreadyFavorited = user.favorites.some((favId) => favId.equals(id));

  if (alreadyFavorited) {
    await User.findByIdAndUpdate(req.user._id, { $pull: { favorites: id } });
  } else {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { favorites: id } });
  }

  const favorited = !alreadyFavorited;
  const wantsJson =
    req.xhr ||
    req.headers.accept?.includes("application/json") ||
    req.get("X-Requested-With") === "XMLHttpRequest";

  if (wantsJson) {
    return res.json({ ok: true, favorited, listingId: id });
  }

  const redirectTo =
    (req.query && req.query.redirectTo) || req.get("Referer") || `/listings/${id}`;
  res.redirect(redirectTo);
};

module.exports.createListing = async (req, res, next) => {
  try {
    const mainImageFile = req.files?.["listing[image]"]?.[0];
    const extraImageFiles = req.files?.["listing[images]"] || [];

    const url = mainImageFile?.path;
    const filename = mainImageFile?.filename;
    const newlisting = new Listing(normalizeListingForm(req.body.listing));
    newlisting.owner = req.user._id;
    if (url && filename) {
      newlisting.image = { url, filename };
    } else if (!newlisting.image?.url) {
      newlisting.image = { url: fallbackForListing(newlisting), filename: "fallback" };
    }

    if (extraImageFiles.length > 0) {
      const uploadedImages = extraImageFiles
        .filter((f) => f.path && f.filename)
        .map((f) => ({
          url: f.path,
          filename: f.filename,
        }));
      if (uploadedImages.length) newlisting.images = uploadedImages;
    }
    normalizeListingImage(newlisting);
    await newlisting.save();
    req.flash("success", "New listing created successfully.");
    res.redirect(`/listings/${newlisting._id}`);
  } catch (err) {
    req.flash("error", err.message || "Could not create listing. Please try again.");
    res.redirect("/listings/new");
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Your Requested Listing does not exist!");
    return res.redirect("/listings");
  }

  let originalimageUrl = listing.image?.url;
  if (originalimageUrl) {
    originalimageUrl = originalimageUrl.replace("/upload", "/upload/h_200,w_250");
  }
  res.render("listings/edit.ejs", {
    listing,
    originalimageUrl,
    categories: CATEGORIES,
    propertyTypes: PROPERTY_TYPES,
    amenitiesList: AMENITIES,
    pageClass: "page-listing-form",
  });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  const oldListing = await Listing.findById(id).select("image");
  let listing = await Listing.findByIdAndUpdate(id, { ...normalizeListingForm(req.body.listing) }, { new: true });
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  const mainImageFile = req.files?.["listing[image]"]?.[0];
  const extraImageFiles = req.files?.["listing[images]"] || [];

  if (mainImageFile) {
    await deleteListingImagesFromCloudinary({ image: oldListing?.image, images: [] });
    listing.image = { url: mainImageFile.path, filename: mainImageFile.filename };
  }

  if (extraImageFiles.length > 0) {
    const newImages = extraImageFiles
      .filter((f) => f.path && f.filename)
      .map((f) => ({
        url: f.path,
        filename: f.filename,
      }));
    listing.images = [...(listing.images || []), ...newImages];
  }

  normalizeListingImage(listing);
  await listing.save();
  req.flash("success", "Listing updated successfully.");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  await deleteListingImagesFromCloudinary(listing);
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
