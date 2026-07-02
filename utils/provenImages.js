/** Curated, stable image fallbacks for listings and category-aware UI. */
const DEFAULT =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80";

function catalogImage(photoId, width = 900) {
  return `https://images.unsplash.com/${photoId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=${width}&q=80`;
}

function imageRecord(photoId, filename) {
  return {
    url: catalogImage(photoId),
    filename,
  };
}

const TITLE_IMAGE_MAP = {
  "Oceanfront Beach Cottage": imageRecord("photo-1499793983690-e29da59ef1c2", "oceanfront-beach-cottage"),
  "Tropical Beachfront Bungalow": imageRecord("photo-1602391833977-358a52198938", "tropical-beachfront-bungalow"),
  "Luxury Overwater Villa": imageRecord("photo-1439066615861-d1af74d74000", "luxury-overwater-villa"),
  "Cliffside Infinity Pool Villa": imageRecord("photo-1602343168117-bb8ffe3e2e9f", "cliffside-infinity-pool-villa"),
  "Alpine Ski Chalet": imageRecord("photo-1502784444187-359ac186c5bb", "alpine-ski-chalet"),
  "Cozy Mountain Cabin": imageRecord("photo-1513584684374-8bab748fbf90", "cozy-mountain-cabin"),
  "Himalayan Retreat Lodge": imageRecord("photo-1464822759023-fed622ff2c3b", "himalayan-retreat-lodge"),
  "Modern Downtown Loft": imageRecord("photo-1502672260266-1c1ef2d93688", "modern-downtown-loft"),
  "Parisian Haussmann Apartment": imageRecord("photo-1505693416388-ac5ce068fe85", "parisian-haussmann-apartment"),
  "Tokyo Designer Apartment": imageRecord("photo-1522708323590-d24dbb6b0267", "tokyo-designer-apartment"),
  "Barcelona Gothic Quarter Flat": imageRecord("photo-1554995207-c18c203602cb", "barcelona-gothic-quarter-flat"),
  "Scottish Highland Castle Wing": imageRecord("photo-1585543805890-6051f7829f98", "scottish-highland-castle-wing"),
  "Rajasthan Heritage Haveli": imageRecord("photo-1566073771259-6a8506099945", "rajasthan-heritage-haveli"),
  "Lakeside Treehouse Camp": imageRecord("photo-1520250497591-112f2f40a3f4", "lakeside-treehouse-camp"),
  "Desert Glamping Suite": imageRecord("photo-1504280390367-361c6d9f38f4", "desert-glamping-suite"),
  "Tuscany Vineyard Farmhouse": imageRecord("photo-1564013799919-ab600027ffc6", "tuscany-vineyard-farmhouse"),
  "Countryside Barn Conversion": imageRecord("photo-1570129477492-45c003edd2be", "countryside-barn-conversion"),
  "Arctic Glass Igloo Suite": imageRecord("photo-1476514525535-07fb3b4ae5f1", "arctic-glass-igloo-suite"),
  "Norwegian Fjord Cabin": imageRecord("photo-1501785888041-af3ef285b470", "norwegian-fjord-cabin"),
  "Boutique City Hotel Room": imageRecord("photo-1542314831-068cd1dbfeeb", "boutique-city-hotel-room"),
  "Heritage Boutique Suite": imageRecord("photo-1549187774-b4e9b0445b41", "heritage-boutique-suite"),
  "Designer Private Room": imageRecord("photo-1631049307264-da0ec9d70304", "designer-private-room"),
  "Safari Lodge Tent": imageRecord("photo-1571896349842-33c89424de2d", "safari-lodge-tent"),
  "Desert Luxury Oasis": imageRecord("photo-1518684079-3c830dcef090", "desert-luxury-oasis"),
  "Rainforest Eco Lodge": imageRecord("photo-1600585154340-be6161a56a0c", "rainforest-eco-lodge"),
  "Penthouse Sky Suite": imageRecord("photo-1600596542815-ffad4c1539a9", "penthouse-sky-suite"),
  "Canal House Amsterdam": imageRecord("photo-1534351590666-13e3e96b5017", "canal-house-amsterdam"),
  "Swiss Alpine Chalet": imageRecord("photo-1605146769289-440113cc3d00", "swiss-alpine-chalet"),
  "Greek Cliffside Villa": imageRecord("photo-1512917774080-9991f1c4c750", "greek-cliffside-villa"),
  "Kerala Backwater Houseboat": imageRecord("photo-1552733407-5d5c46c3bb3b", "kerala-backwater-houseboat"),
  "Moroccan Riad Suite": imageRecord("photo-1540518614846-7eded433c457", "moroccan-riad-suite"),
  "Seoul Hanok Stay": imageRecord("photo-1540959733332-eab4deabeeaf", "seoul-hanok-stay"),
  "Patagonia Eco Dome": imageRecord("photo-1506905925346-21bda4d32df4", "patagonia-eco-dome"),
  "Vineyard Pool Estate": imageRecord("photo-1598228723793-52759bba239c", "vineyard-pool-estate"),
  "Singapore Marina Suite": imageRecord("photo-1525625293386-3f8f99389edd", "singapore-marina-suite"),
  "Sydney Harbour Apartment": imageRecord("photo-1506973035872-a4ec16b8e8d9", "sydney-harbour-apartment"),
};

const CURATED_POOL = Object.values(TITLE_IMAGE_MAP);

const BY_CATEGORY = {
  Trending: TITLE_IMAGE_MAP["Desert Luxury Oasis"].url,
  Rooms: TITLE_IMAGE_MAP["Boutique City Hotel Room"].url,
  "Iconic Cities": TITLE_IMAGE_MAP["Modern Downtown Loft"].url,
  Mountains: TITLE_IMAGE_MAP["Himalayan Retreat Lodge"].url,
  Castles: TITLE_IMAGE_MAP["Scottish Highland Castle Wing"].url,
  "Amazing pools": TITLE_IMAGE_MAP["Greek Cliffside Villa"].url,
  Camping: TITLE_IMAGE_MAP["Desert Glamping Suite"].url,
  Farm: TITLE_IMAGE_MAP["Tuscany Vineyard Farmhouse"].url,
  Arctic: TITLE_IMAGE_MAP["Norwegian Fjord Cabin"].url,
};

function fallbackForCategory(category) {
  return BY_CATEGORY[category] || DEFAULT;
}

const BY_KEYWORD = [
  [/beach|ocean|coast|bungalow|island|maldives|bali|mykonos|santorini/i, TITLE_IMAGE_MAP["Oceanfront Beach Cottage"].url],
  [/mountain|cabin|chalet|ski|aspen|banff|alpine|himalayan|fjord/i, TITLE_IMAGE_MAP["Cozy Mountain Cabin"].url],
  [/villa|luxury|estate|penthouse|pool|tropical|oasis/i, TITLE_IMAGE_MAP["Greek Cliffside Villa"].url],
  [/apartment|loft|flat|city|downtown|tokyo|paris|new york|barcelona|sydney|seoul/i, TITLE_IMAGE_MAP["Modern Downtown Loft"].url],
  [/hotel|suite|room|boutique/i, TITLE_IMAGE_MAP["Heritage Boutique Suite"].url],
  [/castle|haveli|heritage|historic|brownstone|canal|riad|cottage/i, TITLE_IMAGE_MAP["Scottish Highland Castle Wing"].url],
  [/camp|treehouse|glamping|dome|lodge|safari|rainforest/i, TITLE_IMAGE_MAP["Desert Glamping Suite"].url],
  [/farm|vineyard|barn|countryside|tuscany/i, TITLE_IMAGE_MAP["Tuscany Vineyard Farmhouse"].url],
  [/arctic|igloo|snow|rovaniemi|norway/i, TITLE_IMAGE_MAP["Norwegian Fjord Cabin"].url],
];

function hashString(input = "") {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function fallbackForListing(listing = {}) {
  if (listing.title && TITLE_IMAGE_MAP[listing.title]) {
    return TITLE_IMAGE_MAP[listing.title].url;
  }
  const haystack = [listing.title, listing.description, listing.location, listing.country, listing.propertyType, listing.category]
    .filter(Boolean)
    .join(" ");
  const match = BY_KEYWORD.find(([regex]) => regex.test(haystack));
  return match ? match[1] : fallbackForCategory(listing.category);
}

function curatedImageForListing(listing = {}, usedUrls = new Set()) {
  if (listing.title && TITLE_IMAGE_MAP[listing.title]) {
    return { ...TITLE_IMAGE_MAP[listing.title] };
  }

  const haystack = [listing.title, listing.description, listing.location, listing.country, listing.propertyType, listing.category]
    .filter(Boolean)
    .join(" ");
  const match = BY_KEYWORD.find(([regex]) => regex.test(haystack));
  const preferredUrl = match ? match[1] : fallbackForCategory(listing.category);
  const preferred = CURATED_POOL.find((img) => img.url === preferredUrl);
  if (preferred && !usedUrls.has(preferred.url)) return { ...preferred };

  const start = hashString(haystack) % CURATED_POOL.length;
  for (let i = 0; i < CURATED_POOL.length; i += 1) {
    const image = CURATED_POOL[(start + i) % CURATED_POOL.length];
    if (!usedUrls.has(image.url)) return { ...image };
  }

  return preferred ? { ...preferred } : { url: fallbackForCategory(listing.category), filename: "fallback" };
}

function validImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    return /\.(jpe?g|png|webp|avif)(\?|$)/i.test(parsed.pathname) ||
      /images\.unsplash\.com|plus\.unsplash\.com|res\.cloudinary\.com/i.test(parsed.hostname);
  } catch {
    return false;
  }
}

function imageLooksLegacyPlaceholder(listing = {}) {
  const filename = listing.image?.filename || "";
  return filename === "listingimage";
}

function normalizeListingImage(listing, options = {}) {
  if (!listing) return listing;
  const url = listing.image?.url;
  const { usedUrls, forceCurated = false } = options;
  const isDuplicate = usedUrls?.has(url);
  const shouldReplace =
    forceCurated ||
    !validImageUrl(url) ||
    imageLooksLegacyPlaceholder(listing) ||
    isDuplicate ||
    (listing.title && TITLE_IMAGE_MAP[listing.title] && TITLE_IMAGE_MAP[listing.title].url !== url);

  if (shouldReplace) {
    listing.image = curatedImageForListing(listing, usedUrls);
  }
  if (usedUrls && listing.image?.url) usedUrls.add(listing.image.url);
  if (!Array.isArray(listing.images) || listing.images.length === 0) {
    listing.images = listing.image?.url ? [listing.image] : [];
  } else {
    listing.images = listing.images
      .filter((img) => validImageUrl(img?.url))
      .slice(0, 8);
    if (!listing.images.length && listing.image?.url) listing.images = [listing.image];
  }
  return listing;
}

function ensureListingImage(listing) {
  if (!listing) return listing;
  const doc = listing.toObject ? listing.toObject() : { ...listing };
  return normalizeListingImage(doc);
}

function normalizeListings(listings) {
  if (!Array.isArray(listings)) return listings;
  const usedUrls = new Set();
  listings.forEach((item) => normalizeListingImage(item, { usedUrls }));
  return listings;
}

module.exports = {
  DEFAULT,
  BY_CATEGORY,
  TITLE_IMAGE_MAP,
  CURATED_POOL,
  catalogImage,
  curatedImageForListing,
  fallbackForCategory,
  fallbackForListing,
  validImageUrl,
  normalizeListingImage,
  ensureListingImage,
  normalizeListings,
};
