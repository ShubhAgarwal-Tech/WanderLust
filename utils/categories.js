const CATEGORIES = [
  { id: "Trending", label: "Trending", icon: "fa-fire", slug: "trending" },
  { id: "Rooms", label: "Rooms", icon: "fa-bed", slug: "rooms" },
  { id: "Iconic Cities", label: "Iconic Cities", icon: "fa-city", slug: "iconic-cities" },
  { id: "Mountains", label: "Mountains", icon: "fa-mountain", slug: "mountains" },
  { id: "Castles", label: "Castles", icon: "fa-fort-awesome", slug: "castles" },
  { id: "Amazing pools", label: "Amazing pools", icon: "fa-person-swimming", slug: "amazing-pools" },
  { id: "Camping", label: "Camping", icon: "fa-campground", slug: "camping" },
  { id: "Farm", label: "Farm", icon: "fa-tractor", slug: "farm" },
  { id: "Arctic", label: "Arctic", icon: "fa-snowflake", slug: "arctic" },
];

const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

const PROPERTY_TYPES = [
  "Entire place",
  "Private room",
  "Shared room",
  "Hotel",
  "Unique stay",
];

const AMENITIES = [
  "WiFi",
  "Kitchen",
  "Free parking",
  "Pool",
  "Hot tub",
  "Air conditioning",
  "Washer",
  "Dryer",
  "Workspace",
  "TV",
  "Pet friendly",
  "Breakfast",
];

const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
  { id: "newest", label: "Newest" },
];

module.exports = {
  CATEGORIES,
  CATEGORY_IDS,
  PROPERTY_TYPES,
  AMENITIES,
  SORT_OPTIONS,
};
