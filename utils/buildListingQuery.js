const SORT_OPTIONS = {
  recommended: { avgRating: -1, reviewCount: -1, createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  rating: { avgRating: -1, reviewCount: -1 },
  newest: { createdAt: -1 },
};

function parseNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function buildListingQuery(queryParams = {}) {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    guests,
    minRating,
    propertyType,
    amenities,
    sort = "recommended",
    page = 1,
    limit = 12,
  } = queryParams;

  const match = {};
  const andClauses = [];

  if (q && String(q).trim() !== "") {
    const search = String(q).trim();
    andClauses.push({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ],
    });
  }

  const cat = String(category || "").trim();
  if (cat && cat !== "Trending") {
    match.category = cat;
  }

  const minP = parseNumber(minPrice);
  const maxP = parseNumber(maxPrice);
  if (minP !== null || maxP !== null) {
    match.price = {};
    if (minP !== null) match.price.$gte = minP;
    if (maxP !== null) match.price.$lte = maxP;
  }

  const guestCount = parseNumber(guests);
  if (guestCount !== null && guestCount > 0) {
    andClauses.push({
      $or: [
        { maxGuests: { $gte: guestCount } },
        { maxGuests: { $exists: false } },
        { maxGuests: null },
      ],
    });
  }

  if (propertyType && String(propertyType).trim() !== "") {
    match.propertyType = String(propertyType).trim();
  }

  if (amenities) {
    const amenityList = Array.isArray(amenities)
      ? amenities
      : String(amenities)
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean);
    if (amenityList.length > 0) {
      match.amenities = { $all: amenityList };
    }
  }

  if (andClauses.length > 0) {
    match.$and = andClauses;
  }

  const ratingMin = parseNumber(minRating);
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));
  const sortKey = SORT_OPTIONS[sort] ? sort : "recommended";

  return {
    match,
    ratingMin,
    sort: SORT_OPTIONS[sortKey],
    sortKey,
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum,
  };
}

function listingAggregationPipeline({ match, ratingMin, sort, skip, limit }) {
  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: "reviews",
        localField: "reviews",
        foreignField: "_id",
        as: "reviewDocs",
      },
    },
    {
      $addFields: {
        avgRating: {
          $cond: [
            { $gt: [{ $size: "$reviewDocs" }, 0] },
            { $avg: "$reviewDocs.rating" },
            null,
          ],
        },
        reviewCount: { $size: "$reviewDocs" },
      },
    },
  ];

  if (ratingMin !== null && ratingMin > 0) {
    pipeline.push({
      $match: {
        avgRating: { $gte: ratingMin },
      },
    });
  }

  pipeline.push(
    { $sort: sort },
    {
      $facet: {
        listings: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    }
  );

  return pipeline;
}

module.exports = { buildListingQuery, listingAggregationPipeline };
