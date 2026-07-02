require("dotenv").config();

const mongoose = require("mongoose");
const { LISTING_CATALOG } = require("../utils/listingCatalog.js");
const { normalizeListingImage } = require("../utils/provenImages.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");

const dbUrl =
  process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(dbUrl);
  console.log("connected to Database");
}

const REVIEW_COMMENTS = [
  "Loved the stay—super clean and exactly as described.",
  "Great location and smooth check-in. Would book again.",
  "The view was amazing and the place felt very cozy.",
  "Perfect for a weekend getaway. Host was responsive.",
  "Fantastic experience. Everything was spotless.",
];

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const initDB = async () => {
  await Listing.deleteMany({});
  await Review.deleteMany({});

  let seedUser = await User.findOne({ username: "demo" });
  if (!seedUser) {
    seedUser = new User({ username: "demo", email: "demo@wanderlust.local" });
    seedUser = await User.register(seedUser, "password");
  }

  const docs = LISTING_CATALOG.map((entry) =>
    normalizeListingImage({
      ...entry,
      owner: seedUser._id,
      images: entry.images || (entry.image ? [entry.image] : []),
    })
  );

  const insertedListings = await Listing.insertMany(docs);

  for (const listing of insertedListings) {
    const reviewCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < reviewCount; i++) {
      const review = await Review.create({
        comment: sample(REVIEW_COMMENTS),
        rating: 3 + Math.floor(Math.random() * 3),
        author: seedUser._id,
      });
      listing.reviews.push(review._id);
    }
    await listing.save();
  }

  console.log(`Initialized ${insertedListings.length} curated listings`);
};

main()
  .then(() => initDB())
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Seed failed:", err);
    await mongoose.connection.close();
    process.exit(1);
  });
