if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const Listing = require("../models/listing");
const { normalizeListingImage } = require("../utils/provenImages");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function repairListingImages() {
  await mongoose.connect(MONGO_URL);

  const listings = await Listing.find({}).sort({ title: 1 });
  const usedUrls = new Set();
  const changes = [];

  for (const listing of listings) {
    const before = listing.image?.url || "";
    normalizeListingImage(listing, { usedUrls, forceCurated: true });
    listing.images = listing.image?.url ? [{ ...listing.image }] : [];
    const after = listing.image?.url || "";

    if (before !== after || listing.isModified("images")) {
      await listing.save();
      changes.push({
        title: listing.title,
        before,
        after,
      });
    }
  }

  const repaired = await Listing.find({}).select("title image").lean();
  const counts = new Map();
  repaired.forEach((listing) => {
    const url = listing.image?.url || "";
    counts.set(url, (counts.get(url) || 0) + 1);
  });
  const duplicates = [...counts.entries()].filter(([, count]) => count > 1);

  console.log(
    JSON.stringify(
      {
        totalListings: repaired.length,
        changedListings: changes.length,
        duplicatePrimaryImages: duplicates.length,
        changes,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

repairListingImages().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
