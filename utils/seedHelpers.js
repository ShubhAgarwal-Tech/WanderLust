const { CATEGORY_IDS } = require("./categories");

const LOCATION_COORDS = {
  Malibu: [-118.7798, 34.0259],
  "New York City": [-74.006, 40.7128],
  Aspen: [-106.8175, 39.1911],
  Florence: [11.2558, 43.7696],
  Portland: [-122.6765, 45.5152],
  Cancun: [-86.8515, 21.1619],
  "Lake Tahoe": [-120.0324, 39.0968],
  "Los Angeles": [-118.2437, 34.0522],
  Verbier: [7.2285, 46.0968],
  "Serengeti National Park": [34.8333, -2.3333],
  Amsterdam: [4.9041, 52.3676],
  Fiji: [178.065, -17.7134],
  Cotswolds: [-1.8333, 51.8333],
  Boston: [-71.0589, 42.3601],
  Bali: [115.1889, -8.4095],
  Banff: [-115.5708, 51.1784],
  Miami: [-80.1918, 25.7617],
  Phuket: [98.3923, 7.8804],
  "Scottish Highlands": [-4.2026, 57.4778],
  Dubai: [55.2708, 25.2048],
  Montana: [-110.3626, 46.8797],
  Mykonos: [25.3289, 37.4467],
  "Costa Rica": [-84.0907, 9.7489],
  Charleston: [-79.9311, 32.7765],
  Tokyo: [139.6917, 35.6895],
  Barcelona: [2.1734, 41.3851],
  Jaipur: [75.7873, 26.9124],
  "New Hampshire": [-71.5728, 43.1939],
  Maldives: [73.2207, 3.2028],
};

function inferCategory(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();

  if (/castle|fort|haveli|heritage|historic villa/i.test(text)) return "Castles";
  if (/treehouse|camp|safari lodge|tent/i.test(text)) return "Camping";
  if (/mountain|ski|alpine|chalet|cabin|banff|aspen|serengeti/i.test(text))
    return "Mountains";
  if (/pool|infinity|beachfront|villa|maldives|overwater/i.test(text))
    return "Amazing pools";
  if (/farm|tractor|countryside cottage/i.test(text)) return "Farm";
  if (/arctic|snow|ski-in|verbier|swiss alps/i.test(text)) return "Arctic";
  if (
    /downtown|city|loft|apartment|tokyo|barcelona|miami|boston|amsterdam|modern/i.test(
      text
    )
  )
    return "Iconic Cities";
  if (/room|suite|hotel|penthouse|boutique/i.test(text)) return "Rooms";

  return "Trending";
}

function inferPropertyType(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  if (/hotel|suite|boutique/i.test(text)) return "Hotel";
  if (/room|shared/i.test(text)) return "Private room";
  if (/treehouse|island|castle|safari/i.test(text)) return "Unique stay";
  if (/cabin|cottage|villa|entire/i.test(text)) return "Entire place";
  return "Entire place";
}

function inferMaxGuests(price = 1000) {
  if (price >= 4000) return 8;
  if (price >= 2000) return 6;
  if (price >= 1000) return 4;
  return 2;
}

function inferAmenities(title = "", description = "", category = "") {
  const text = `${title} ${description}`.toLowerCase();
  const amenities = new Set(["WiFi"]);

  if (/kitchen|cook/i.test(text)) amenities.add("Kitchen");
  if (/parking|garage/i.test(text)) amenities.add("Free parking");
  if (/pool|swim/i.test(text) || category === "Amazing pools") amenities.add("Pool");
  if (/workspace|wi-fi|wifi|work nook/i.test(text)) amenities.add("Workspace");
  if (/pet/i.test(text)) amenities.add("Pet friendly");
  if (/breakfast/i.test(text)) amenities.add("Breakfast");
  if (/tv|netflix/i.test(text)) amenities.add("TV");
  if (/washer|laundry/i.test(text)) amenities.add("Washer");
  if (/air conditioning|ac\b/i.test(text)) amenities.add("Air conditioning");

  return [...amenities];
}

function coordsForLocation(location = "") {
  if (LOCATION_COORDS[location]) {
    const [lng, lat] = LOCATION_COORDS[location];
    return { lat, lng };
  }
  const key = Object.keys(LOCATION_COORDS).find((k) =>
    location.toLowerCase().includes(k.toLowerCase())
  );
  if (key) {
    const [lng, lat] = LOCATION_COORDS[key];
    return { lat, lng };
  }
  return { lat: 20 + Math.random() * 40, lng: -120 + Math.random() * 80 };
}

module.exports = {
  CATEGORY_IDS,
  inferCategory,
  inferPropertyType,
  inferMaxGuests,
  inferAmenities,
  coordsForLocation,
};
